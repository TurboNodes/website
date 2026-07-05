import type { NextApiRequest, NextApiResponse } from "next";
import {
  CLIENT_NODE_REPO,
  getArtifactName,
  type Architecture,
  type Platform,
} from "@/lib/turboClientDownload";

type SupportedPlatform = Exclude<Platform, "" | "unknown">;

const PLATFORMS: SupportedPlatform[] = ["windows", "macos", "linux"];
const ARCHITECTURES: Architecture[] = ["amd64", "arm64"];

interface GitHubArtifact {
  name: string;
  archive_download_url: string;
  expired: boolean;
}

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

async function findLatestArtifact(
  artifactName: string,
  token: string
): Promise<GitHubArtifact | null> {
  const url = new URL(
    `https://api.github.com/repos/${CLIENT_NODE_REPO}/actions/artifacts`
  );
  url.searchParams.set("name", artifactName);
  url.searchParams.set("per_page", "1");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data = (await response.json()) as { artifacts: GitHubArtifact[] };
  const artifact = data.artifacts[0];
  if (!artifact || artifact.expired) return null;
  return artifact;
}

async function resolveArtifactDownloadUrl(
  artifact: GitHubArtifact,
  token: string
): Promise<string> {
  const response = await fetch(artifact.archive_download_url, {
    redirect: "manual",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (response.status !== 302 && response.status !== 303) {
    throw new Error(`Unexpected GitHub download response: ${response.status}`);
  }

  const location = response.headers.get("location");
  if (!location) {
    throw new Error("GitHub download redirect missing location");
  }

  return location;
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

  try {
    const artifact = await findLatestArtifact(artifactName, token);
    if (!artifact) {
      return res
        .status(404)
        .json({ error: `No build found for ${artifactName}` });
    }

    if (req.method === "HEAD") {
      return res.status(200).end();
    }

    const downloadUrl = await resolveArtifactDownloadUrl(artifact, token);
    return res.redirect(302, downloadUrl);
  } catch (error) {
    console.error("Download error:", error);
    return res.status(500).json({ error: "Failed to prepare download" });
  }
}
