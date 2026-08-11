#!/usr/bin/env bash
set -euo pipefail

TURBO_BASE_URL="${TURBO_BASE_URL:-https://turbo.network}"
INSTALL_DIR="${TURBO_INSTALL_DIR:-$HOME/.local/bin}"

# With --pair-token, install the headless node and pair it to the account that
# generated the token (the command comes from the dashboard's Download page,
# with the token already in it). Without one, this stays exactly what it has
# always been: a plain download of the desktop app.
PAIR_TOKEN=""
# Guarded because "$@" is an unbound expansion under `set -u` on the bash 3.2
# that ships with macOS, and the no-argument case is the common one.
if [ "$#" -gt 0 ]; then
  for arg in "$@"; do
    case "$arg" in
      --pair-token=*) PAIR_TOKEN="${arg#*=}" ;;
      *)
        echo "Unknown option: $arg" >&2
        echo "Usage: install.sh [--pair-token=<token>]" >&2
        exit 1
        ;;
    esac
  done
fi

ARCH="$(uname -m)"
case "$ARCH" in
  x86_64|amd64) ARCH="amd64" ;;
  aarch64|arm64) ARCH="arm64" ;;
  *)
    echo "Unsupported architecture: $ARCH" >&2
    exit 1
    ;;
esac

OS="$(uname -s)"
case "$OS" in
  Linux) PLATFORM="linux" ;;
  Darwin) PLATFORM="macos" ;;
  *)
    echo "Unsupported OS: $OS. Visit ${TURBO_BASE_URL}/download" >&2
    exit 1
    ;;
esac

command -v curl >/dev/null 2>&1 || {
  echo "curl is required but was not found." >&2
  exit 1
}

TMPDIR="$(mktemp -d)"
cleanup() {
  rm -rf "$TMPDIR"
}
trap cleanup EXIT

# Headless install: fetch turbod, register it as a service, and let it pair
# itself. Installed as "turbod" rather than "turbo" so it can live alongside a
# desktop install without either overwriting the other.
if [ -n "$PAIR_TOKEN" ]; then
  echo "Downloading Turbo node for ${PLATFORM}/${ARCH}..."

  curl -fsSL "${TURBO_BASE_URL}/api/download/turbod?platform=${PLATFORM}&arch=${ARCH}" \
    -o "${TMPDIR}/turbod"

  if [ ! -s "${TMPDIR}/turbod" ]; then
    echo "Download failed: no build available for ${PLATFORM}/${ARCH}." >&2
    exit 1
  fi

  mkdir -p "${INSTALL_DIR}"
  install -m 755 "${TMPDIR}/turbod" "${INSTALL_DIR}/turbod"

  # The token goes through the environment rather than the command line:
  # /proc/<pid>/cmdline is world-readable on Linux, so an argument would be
  # visible in `ps` to anyone else on the machine while this runs.
  echo "Installing Turbo node service..."
  TURBO_PAIR_TOKEN="$PAIR_TOKEN" "${INSTALL_DIR}/turbod" --install

  echo ""
  echo "Turbo node installed to ${INSTALL_DIR}/turbod"
  echo "It runs in the background and starts automatically on boot."
  exit 0
fi

echo "Downloading Turbo for ${PLATFORM}/${ARCH}..."

if [ "$PLATFORM" = "macos" ]; then
  curl -fsSL "${TURBO_BASE_URL}/api/download?platform=${PLATFORM}&arch=${ARCH}" \
    -o "${TMPDIR}/turbo.dmg"

  MOUNT_DIR="${TMPDIR}/mount"
  mkdir -p "${MOUNT_DIR}"
  hdiutil attach -nobrowse -mountpoint "${MOUNT_DIR}" "${TMPDIR}/turbo.dmg" >/dev/null

  APP_PATH="$(find "${MOUNT_DIR}" -maxdepth 3 -name Turbo -type f | head -n 1)"
  if [ -z "${APP_PATH}" ] || [ ! -f "${APP_PATH}" ]; then
    hdiutil detach "${MOUNT_DIR}" >/dev/null 2>&1 || true
    echo "Could not find Turbo binary in the downloaded disk image." >&2
    echo "Download manually from ${TURBO_BASE_URL}/download" >&2
    exit 1
  fi
  mkdir -p "${INSTALL_DIR}"
  install -m 755 "${APP_PATH}" "${INSTALL_DIR}/turbo"
  hdiutil detach "${MOUNT_DIR}" >/dev/null
else
  # Linux: /api/download unwraps the Actions artifact server-side, so this is
  # the binary itself — nothing to extract, and no dependency on unzip.
  curl -fsSL "${TURBO_BASE_URL}/api/download?platform=${PLATFORM}&arch=${ARCH}" \
    -o "${TMPDIR}/turbo"

  if [ ! -s "${TMPDIR}/turbo" ]; then
    echo "Download failed: no build available for ${PLATFORM}/${ARCH}." >&2
    exit 1
  fi

  mkdir -p "${INSTALL_DIR}"
  install -m 755 "${TMPDIR}/turbo" "${INSTALL_DIR}/turbo"
fi

if ! echo ":${PATH}:" | grep -q ":${INSTALL_DIR}:"; then
  echo ""
  echo "Add Turbo to your PATH:"
  echo "  export PATH=\"${INSTALL_DIR}:\$PATH\""
fi

echo ""
echo "Turbo installed to ${INSTALL_DIR}/turbo"
echo "Run 'turbo' to start."
