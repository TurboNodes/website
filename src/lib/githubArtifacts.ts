import { once } from "node:events";
import type { ServerResponse } from "node:http";
import { unzipSync } from "fflate";
import { CLIENT_NODE_REPO } from "@/lib/turboClientDownload";

// Downloads are served out of the client-node repo's Actions artifacts rather
// than published releases, so the site always offers the current build. Shared
// by /api/download (desktop) and /api/download/turbod (headless).

export interface GitHubArtifact {
  id: number;
  name: string;
  created_at: string;
  archive_download_url: string;
  expired: boolean;
  workflow_run?: { id: number; head_branch: string | null } | null;
}

// The branch a download is allowed to come from. Without this a build from a
// pull request could be newer than main's and win the "latest" comparison.
const RELEASE_BRANCH = "main";

// One page comfortably covers every retained artifact for a single name (they
// expire long before a hundred builds accumulate), so no pagination is needed
// to see the full candidate set.
const ARTIFACT_PAGE_SIZE = 100;

// Newest first: by build time, falling back to artifact id for two artifacts
// uploaded in the same second by the same run.
function compareNewestFirst(a: GitHubArtifact, b: GitHubArtifact): number {
  const byTime =
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  return byTime !== 0 ? byTime : b.id - a.id;
}

// Picks the most recent live build for a name. The GitHub API's own ordering is
// not contractual — asking for per_page=1 and taking artifacts[0] has handed
// back a previous run's build — so the whole candidate set is fetched and
// ordered here instead.
export async function findLatestArtifact(
  artifactName: string,
  token: string
): Promise<GitHubArtifact | null> {
  const url = new URL(
    `https://api.github.com/repos/${CLIENT_NODE_REPO}/actions/artifacts`
  );
  url.searchParams.set("name", artifactName);
  url.searchParams.set("per_page", String(ARTIFACT_PAGE_SIZE));

  const response = await fetch(url, {
    // Any cached listing is a stale listing: a build uploaded a minute ago has
    // to be visible here immediately.
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Cache-Control": "no-cache",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data = (await response.json()) as { artifacts: GitHubArtifact[] };

  // The name filter is applied server-side, but re-checking it locally keeps a
  // partial match from ever being served under the wrong name.
  const live = data.artifacts.filter(
    (artifact) => artifact.name === artifactName && !artifact.expired
  );

  const fromReleaseBranch = live.filter(
    (artifact) => artifact.workflow_run?.head_branch === RELEASE_BRANCH
  );

  // Older artifacts predate this filter's assumptions (workflow_run can be
  // absent), so fall back to the unfiltered set rather than serving nothing.
  const candidates = fromReleaseBranch.length > 0 ? fromReleaseBranch : live;

  return candidates.sort(compareNewestFirst)[0] ?? null;
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
