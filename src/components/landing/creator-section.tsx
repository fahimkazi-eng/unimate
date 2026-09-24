import { existsSync } from "node:fs";
import path from "node:path";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreatorVideo } from "@/components/landing/creator-video";
import { SemesterTimeline } from "@/components/landing/semester-timeline";

const VIDEO_SRC = "/videos/creator-loop.mp4";
const VIDEO_POSTER = "/videos/poster.svg";

/** The MP4 ships with the repo; if it's not there yet the panel is honest. */
function hasCreatorVideo(): boolean {
  try {
    return existsSync(
      path.join(process.cwd(), "public", "videos", "creator-loop.mp4")
    );
  } catch {
    return false;
  }
}

/** "From the creator" section — lazy video panel + semester timeline. */
export function CreatorSection() {
  const available = hasCreatorVideo();

  return (
    <section id="creator" className="scroll-mt-16 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge>From the creator</Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
            Watch UniMate in action
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A short tour of the product, straight from the person building it.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <CreatorVideo
              src={VIDEO_SRC}
              poster={VIDEO_POSTER}
              available={available}
            />
          </div>

          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Your semester, at a glance</CardTitle>
                <CardDescription>
                  From syllabus to final exams — the whole term in one line.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SemesterTimeline />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}