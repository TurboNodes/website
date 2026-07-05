import {
  existsSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const useWebpack = process.argv.includes("--webpack");
const bundler = useWebpack ? "webpack" : "turbo";
const distDirName = useWebpack ? ".next-webpack" : ".next";
const nextDir = path.join(projectRoot, distDirName);
const nextArgs = [
  "dev",
  ...(useWebpack ? [] : ["--turbo"]),
  ...process.argv.slice(2).filter((a) => a !== "--webpack"),
];

const MAX_AUTO_RESTARTS = 5;
const HEALTH_CHECK_MS = 3000;
const CORRUPTION_CONFIRM_MS = 1500;

/** Webpack dev expects these; missing files mean a corrupted cache. */
const WEBPACK_REQUIRED = [
  "server/next-font-manifest.json",
  "server/pages-manifest.json",
  "server/webpack-runtime.js",
];

/** Manifests Next parses on every request; invalid JSON breaks reloads. */
const JSON_MANIFESTS = [
  "build-manifest.json",
  "fallback-build-manifest.json",
  "server/pages-manifest.json",
  "server/next-font-manifest.json",
];

const CORRUPTION_PATTERNS = [
  /pages-manifest\.json.*ENOENT/is,
  /build-manifest.*ENOENT/is,
  /Unexpected non-whitespace character after JSON/is,
  /Could not find files for .* in .*build-manifest\.json/is,
];

function isStaleVendorChunks() {
  const runtimePath = path.join(nextDir, "server/webpack-runtime.js");
  if (!existsSync(runtimePath)) return false;

  const runtime = readFileSync(runtimePath, "utf8");
  const expectsChunksSubdir = runtime.includes('require("./chunks/');
  const hasChunksVendor = existsSync(
    path.join(nextDir, "server/chunks/vendor-chunks")
  );
  const hasRootVendor = existsSync(path.join(nextDir, "server/vendor-chunks"));

  return expectsChunksSubdir && !hasChunksVendor && hasRootVendor;
}

function isProductionBuild() {
  return existsSync(path.join(nextDir, "BUILD_ID"));
}

function hasCorruptedJsonManifests({ log = false } = {}) {
  for (const rel of JSON_MANIFESTS) {
    const file = path.join(nextDir, rel);
    if (!existsSync(file)) continue;

    try {
      JSON.parse(readFileSync(file, "utf8"));
    } catch {
      if (log) console.log(`Corrupted ${distDirName}/${rel}, clearing cache…`);
      return true;
    }
  }

  return false;
}

function hadPreviousCompile() {
  const manifestPath = path.join(nextDir, "server/pages-manifest.json");
  if (!existsSync(manifestPath)) return false;

  try {
    const pages = JSON.parse(readFileSync(manifestPath, "utf8"));
    return Object.keys(pages).length > 0;
  } catch {
    return true;
  }
}

function isWebpackCorrupted() {
  if (!useWebpack) return false;
  if (hasCorruptedJsonManifests()) return true;

  // Before the first compile, manifests are empty placeholders — not corruption.
  if (!hadPreviousCompile()) return false;

  for (const rel of WEBPACK_REQUIRED) {
    if (!existsSync(path.join(nextDir, rel))) return true;
  }

  return false;
}

function shouldCleanNext() {
  if (!existsSync(nextDir)) return false;

  if (hasCorruptedJsonManifests({ log: true })) return true;

  if (isProductionBuild()) {
    console.log(`Found production build in ${distDirName}, clearing before dev…`);
    return true;
  }

  if (isStaleVendorChunks()) {
    console.log(`Stale webpack vendor-chunk cache in ${distDirName}, clearing…`);
    return true;
  }

  if (useWebpack && hadPreviousCompile()) {
    for (const rel of WEBPACK_REQUIRED) {
      if (!existsSync(path.join(nextDir, rel))) {
        console.log(`Missing ${distDirName}/${rel}, clearing cache…`);
        return true;
      }
    }
  }

  return false;
}

function cleanNext() {
  rmSync(nextDir, { recursive: true, force: true });
}

function matchesCorruptionOutput(text) {
  return CORRUPTION_PATTERNS.some((pattern) => pattern.test(text));
}

function startDev(restartCount = 0) {
  const nextBin = path.join(projectRoot, "node_modules/next/dist/bin/next");
  const env = useWebpack
    ? { ...process.env, NEXT_WEBPACK_DEV: "1" }
    : process.env;

  let ready = false;
  let restarting = false;
  let confirmTimer = null;
  let healthTimer = null;

  const child = spawn(process.execPath, [nextBin, ...nextArgs], {
    env,
    cwd: projectRoot,
  });

  const forward = (stream, data) => {
    stream.write(data);
    if (!useWebpack || restarting) return;

    const text = data.toString();
    if (text.includes("Ready in")) ready = true;
    if (matchesCorruptionOutput(text)) scheduleRestart("compile output");
  };

  child.stdout.on("data", (data) => forward(process.stdout, data));
  child.stderr.on("data", (data) => forward(process.stderr, data));

  function clearTimers() {
    if (confirmTimer) {
      clearTimeout(confirmTimer);
      confirmTimer = null;
    }
    if (healthTimer) {
      clearInterval(healthTimer);
      healthTimer = null;
    }
  }

  function scheduleRestart(reason) {
    if (restarting || confirmTimer) return;

    confirmTimer = setTimeout(() => {
      confirmTimer = null;
      if (isWebpackCorrupted()) restart(reason);
    }, CORRUPTION_CONFIRM_MS);
  }

  function restart(reason) {
    if (restarting) return;

    if (restartCount >= MAX_AUTO_RESTARTS) {
      console.error(
        `\nDev cache keeps corrupting (${reason}). Auto-restart limit reached — stop and run: rm -rf ${distDirName}\n`
      );
      return;
    }

    restarting = true;
    clearTimers();
    console.log(
      `\n↻ ${distDirName} cache corrupted (${reason}), auto-restarting… (${restartCount + 1}/${MAX_AUTO_RESTARTS})\n`
    );
    child.kill("SIGTERM");
    setTimeout(() => {
      if (!child.killed) child.kill("SIGKILL");
    }, 5000);
  }

  if (useWebpack) {
    healthTimer = setInterval(() => {
      if (!ready || restarting) return;
      if (isWebpackCorrupted()) scheduleRestart("health check");
    }, HEALTH_CHECK_MS);
  }

  child.on("exit", (code, signal) => {
    clearTimers();

    if (restarting) {
      cleanNext();
      startDev(restartCount + 1);
      return;
    }

    if (signal === "SIGINT" || signal === "SIGTERM") {
      process.exit(0);
    }

    process.exit(code ?? 0);
  });
}

if (shouldCleanNext()) {
  cleanNext();
}

startDev();
