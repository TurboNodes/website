#!/usr/bin/env bash
set -euo pipefail

TURBO_BASE_URL="${TURBO_BASE_URL:-https://turbo.network}"
INSTALL_DIR="${TURBO_INSTALL_DIR:-$HOME/.local/bin}"

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
  curl -fsSL "${TURBO_BASE_URL}/api/download?platform=${PLATFORM}&arch=${ARCH}" \
    -o "${TMPDIR}/turbo.zip"

  if command -v unzip >/dev/null 2>&1; then
    unzip -qo "${TMPDIR}/turbo.zip" -d "${TMPDIR}/extracted"
  else
    echo "unzip is required but was not found." >&2
    exit 1
  fi

  mkdir -p "${INSTALL_DIR}"

  BINARY="${TMPDIR}/extracted/turbo-client"
  if [ ! -f "${BINARY}" ]; then
    BINARY="$(find "${TMPDIR}/extracted" -maxdepth 2 -type f -perm -111 | head -n 1)"
  fi
  if [ -z "${BINARY}" ] || [ ! -f "${BINARY}" ]; then
    echo "Could not find Turbo binary in the downloaded archive." >&2
    exit 1
  fi
  install -m 755 "${BINARY}" "${INSTALL_DIR}/turbo"
fi

if ! echo ":${PATH}:" | grep -q ":${INSTALL_DIR}:"; then
  echo ""
  echo "Add Turbo to your PATH:"
  echo "  export PATH=\"${INSTALL_DIR}:\$PATH\""
fi

echo ""
echo "Turbo installed to ${INSTALL_DIR}/turbo"
echo "Run 'turbo' to start."
