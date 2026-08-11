import { once } from "node:events";
import type { ServerResponse } from "node:http";
import { unzipSync } from "fflate";
import { CLIENT_NODE_REPO } from "@/lib/turboClientDownload";

// Downloads are served out of the client-node repo's Actions artifacts rather
// than published releases, so the site always offers the current build. Shared
// by /api/download (desktop) and /api/download/turbod (headless).

export interface GitHubArtifact {
  name: string;
  archive_download_url: string;
  expired: boolean;
}

export async function findLatestArtifact(
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

export async function downloadArtifactZip(
  artifact: GitHubArtifact,
  token: string
): Promise<Uint8Array> {
  // Follow redirects from the GitHub API; auth is stripped automatically on
  // cross-origin redirect to the signed blob-storage URL.
  const response = await fetch(artifact.archive_download_url, {
    redirect: "follow",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub artifact download failed: ${response.status}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

// Actions wraps every artifact in a zip, even when it holds a single file, so
// the payload the user actually runs — .dmg, .exe, bare binary — has to be
// pulled back out before it is served. `preferredName` is the artifact name the
// build uploaded under, which is usually also the name of the entry inside.
export function extractArtifactFile(
  zipData: Uint8Array,
  preferredName: string
): Uint8Array {
  const files = unzipSync(zipData);
  const names = Object.keys(files).filter((name) => !name.endsWith("/"));

  const dotIndex = preferredName.lastIndexOf(".");
  const extension = dotIndex > 0 ? preferredName.slice(dotIndex) : null;

  const match =
    names.find((name) => name === preferredName) ??
    names.find((name) => name.split("/").pop() === preferredName) ??
    (extension ? names.find((name) => name.endsWith(extension)) : undefined) ??
    (names.length === 1 ? names[0] : undefined);

  if (!match) {
    throw new Error(`${preferredName} not found in artifact archive`);
  }

  return files[match];
}

const CHUNK_SIZE = 256 * 1024;

// Vercel rejects a buffered function response over 4.5 MB with
// FUNCTION_PAYLOAD_TOO_LARGE but exempts streamed ones, and the desktop builds
// are twice that, so the payload goes out chunked instead of as one Buffer.
// Chunked also means no Content-Length, hence no download progress bar — the
// trade for being able to serve the file at all.
export async function sendBinaryChunked(
  res: ServerResponse,
  data: Uint8Array
): Promise<void> {
  for (let offset = 0; offset < data.byteLength; offset += CHUNK_SIZE) {
    const chunk = Buffer.from(data.subarray(offset, offset + CHUNK_SIZE));
    if (!res.write(chunk)) {
      await once(res, "drain");
    }
  }
  res.end();
}
