"use client";

import { useRef, useState } from "react";
import { Play, RotateCcw, Video, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreatorVideoProps {
  src: string;
  poster: string;
  /** Whether the video file exists (server checks public/videos). */
  available: boolean;
}

/**
 * Lazy creator video — nothing loads until the user presses play, so the
 * homepage never pays bandwidth for the clip. Poster-first UI with a glass
 * play button; after the first play the clip loops muted with unobtrusive
 * mute/replay controls. `prefers-reduced-motion` is respected by only ever
 * starting playback on explicit user gesture.
 */
export function CreatorVideo({ src, poster, available }: CreatorVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);

  // Panel is a 16:9 surface with rounded corners and a dark stage.
  const panel =
    "relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-[#0a0a12] shadow-lg";

  if (!available || failed) {
    return (
      <div className={cn(panel, "group")}>
        <img
          src={poster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-black/50" aria-hidden />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-surface-elevated text-primary">
            <Video className="h-6 w-6" />
          </span>
          <p className="text-base font-semibold text-white">
            Creator video coming soon
          </p>
          <p className="max-w-sm text-sm text-white/70">
            The walkthrough is being recorded and will land here first — the
            place that already plays like it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={panel}>
      {playing ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay
          muted={muted}
          loop
          playsInline
          aria-label="UniMate product tour"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label="Play the UniMate product tour"
          className="group absolute inset-0 flex items-center justify-center focus-visible:outline-none"
        >
          <img
            src={poster}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span
            aria-hidden
            className="absolute inset-0 bg-black/40 transition-colors duration-200 group-hover:bg-black/25"
          />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-glow-primary transition-transform duration-200 ease-out-quart group-hover:scale-105">
            <Play className="ml-0.5 h-6 w-6" />
          </span>
        </button>
      )}

      {playing && (
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Unmute video" : "Mute video"}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => {
              const video = videoRef.current;
              if (!video) return;
              video.currentTime = 0;
              void video.play();
            }}
            aria-label="Replay video"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}