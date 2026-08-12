import type { NextApiRequest, NextApiResponse } from "next";
import {
  getHeadlessArtifactName,
  type Architecture,
  type Platform,
} from "@/lib/turboClientDownload";
import {
  downloadArtifactZip,
  extractArtifactFile,
  findLatestArtifact,
  sendBinaryChunked,
} from "@/lib/githubArtifacts";

type HeadlessPlatform = Extract<Platform, "linux" | "macos">;

// Windows is absent by design: the install script that calls this is POSIX
// shell, and Windows installs autostart through its own installer instead.
const PLATFORMS: HeadlessPlatform[] = ["linux", "macos"];
const ARCHITECTURES: Architecture[] = ["amd64", "arm64"];

// Serves the headless node binary (cmd/turbod) that install.sh downloads —
// distinct from /api/download, which serves the desktop app in its
// platform-native wrapper (DMG, installer). Here there is nothing to unwrap
// but the Actions artifact zip itself, and the result is written straight to
// disk and executed, so it is streamed as a plain binary attachment.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { platform, arch } = req.query;
  if (
    typeof platform !== "string" ||
    typeof arch !== "string" ||
    !PLATFORMS.includes(platform as HeadlessPlatform) ||
    !ARCHITECTURES.includes(arch as Architecture)
  ) {
    return res.status(400).json({ error: "Invalid platform or architecture" });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(503).json({ error: "Download service is not configured" });
  }

  const artifactName = getHeadlessArtifactName(
    platform as HeadlessPlatform,
    arch as Architecture
  );

  try {
    const artifact = await findLatestArtifact(artifactName, token);
    if (!artifact) {
      return res.status(404).json({ error: `No build found for ${artifactName}` });
    }

    if (req.method === "HEAD") {
      return res.status(200).end();
    }

    // install.sh receives a ready-to-run binary rather than having to unzip it
    // itself.
    const zipData = await downloadArtifactZip(artifact, token);
    const binary = extractArtifactFile(zipData, artifactName);

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", 'attachment; filename="turbod"');
    // Same reasoning as /api/download: a cached response pins an old build.
    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.status(200);
    return await sendBinaryChunked(res, binary);
  } catch (error) {
    console.error("turbod download error:", error);
    return res.status(500).json({ error: "Failed to prepare download" });
  }
}
