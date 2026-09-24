import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/**
 * V2 Phase 2 — browser-tab favicon derived from the real UniMate logo tile
 * (`public/logo.jpeg`). Read from disk and embedded as a data URL so the
 * favicon always matches the brand asset.
 */
export default async function Icon() {
  const tile = fs.readFileSync(
    path.join(process.cwd(), "public", "logo.jpeg")
  );
  const dataUrl = `data:image/jpeg;base64,${tile.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          borderRadius: 14,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUrl} width={64} height={64} alt="" />
      </div>
    ),
    size
  );
}