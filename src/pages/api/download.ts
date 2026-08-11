import type { NextApiRequest, NextApiResponse } from "next";
import {
  getArtifactName,
  getDownloadContentType,
  getDownloadFilename,
  type Architecture,
  type Platform,
} from "@/lib/turboClientDownload";
import {
  downloadArtifactZip,
  extractArtifactFile,
  findLatestArtifact,
  sendBinaryChunked,
} from "@/lib/githubArtifacts";

type SupportedPlatform = Exclude<Platform, "" | "unknown">;

const PLATFORMS: SupportedPlatform[] = ["windows", "macos", "linux"];
const ARCHITECTURES: Architecture[] = ["amd64", "arm64"];

function parseQuery(
  req: NextApiRequest
): { platform: SupportedPlatform; arch: Architecture } | null {
  const { platform, arch } = req.query;
  if (
    typeof platform !== "string" ||
    typeof arch !== "string" ||
    !PLATFORMS.includes(platform as SupportedPlatform) ||
    !ARCHITECTURES.includes(arch as Architecture)
  ) {
    return null;
  }
  return {
    platform: platform as SupportedPlatform,
    arch: arch as Architecture,
  };
}

function setDownloadHeaders(
  res: NextApiResponse,
  platform: SupportedPlatform,
  filename: string
) {
  res.setHeader("Content-Type", getDownloadContentType(platform));
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const parsed = parseQuery(req);
  if (!parsed) {
    return res.status(400).json({ error: "Invalid platform or architecture" });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(503).json({ error: "Download service is not configured" });
  }

  const artifactName = getArtifactName(parsed.platform, parsed.arch);
  const downloadFilename = getDownloadFilename(parsed.platform, parsed.arch);

  try {
    const artifact = await findLatestArtifact(artifactName, token);
    if (!artifact) {
      return res
        .status(404)
        .json({ error: `No build found for ${artifactName}` });
    }

    if (req.method === "HEAD") {
      setDownloadHeaders(res, parsed.platform, downloadFilename);
      return res.status(200).end();
    }

    // Unwrapped on the server for every platform, so what lands in the user's
    // downloads folder is the thing they run — no zip to open first.
    const zipData = await downloadArtifactZip(artifact, token);
    const payload = extractArtifactFile(zipData, artifactName);

    setDownloadHeaders(res, parsed.platform, downloadFilename);
    res.status(200);
    return await sendBinaryChunked(res, payload);
  } catch (error) {
    console.error("Download error:", error);
    return res.status(500).json({ error: "Failed to prepare download" });
  }
}
