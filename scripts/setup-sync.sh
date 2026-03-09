#!/usr/bin/env bash
# setup-sync.sh
#
# One-time setup for the photo-sync sidecar on the Immich host.
# Run this once before starting the photo-sync container.
#
# Usage:
#   chmod +x setup-sync.sh
#   GITHUB_TOKEN=ghp_... GITHUB_REPO=yourusername/PersonalSite ./setup-sync.sh

set -euo pipefail

GITHUB_TOKEN="${GITHUB_TOKEN:?Set GITHUB_TOKEN to a GitHub PAT with repo scope}"
GITHUB_REPO="${GITHUB_REPO:?Set GITHUB_REPO to owner/repo (e.g. yourusername/PersonalSite)}"
SYNC_DIR="${SYNC_DIR:-./photo-sync}"

echo "=== photo-sync one-time setup ==="

# 1. Create the ./photo-sync directory and copy the script into it
echo "1. Copying sync script to ${SYNC_DIR}..."
mkdir -p "${SYNC_DIR}"
cp "$(dirname "$0")/sync-immich.mjs" "${SYNC_DIR}/sync-immich.mjs"

# Write a minimal package.json for the sidecar (only the runtime dep needed)
cat > "${SYNC_DIR}/package.json" <<'EOF'
{
  "name": "photo-sync",
  "type": "module",
  "version": "1.0.0",
  "dependencies": {
    "@aws-sdk/client-s3": "^3.0.0"
  }
}
EOF

echo "   Done."

# 2. Clone the site repo into the named Docker volume
echo "2. Cloning site repo into Docker volume site-repo..."

# The volume is accessed via a temporary container
CLONE_URL="https://${GITHUB_TOKEN}@github.com/${GITHUB_REPO}.git"

docker run --rm \
  -v site-repo:/site \
  -e GITHUB_TOKEN="${GITHUB_TOKEN}" \
  alpine/git:latest \
  clone "${CLONE_URL}" /site

echo "   Cloned."

# 3. Configure git credentials in the volume so push works
echo "3. Configuring git remote with embedded token..."
docker run --rm \
  -v site-repo:/site \
  alpine/git:latest \
  -C /site remote set-url origin "https://${GITHUB_TOKEN}@github.com/${GITHUB_REPO}.git"

docker run --rm \
  -v site-repo:/site \
  alpine/git:latest \
  -C /site config user.email "sync@mike.lapidak.is"

docker run --rm \
  -v site-repo:/site \
  alpine/git:latest \
  -C /site config user.name "photo-sync"

echo "   Done."

echo ""
echo "=== Setup complete ==="
echo ""
echo "Next steps:"
echo "  1. Copy docker-compose.sidecar.yml service block into your Immich compose"
echo "  2. Add required env vars to your Immich .env file:"
echo "       IMMICH_API_KEY, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID,"
echo "       R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, PHOTOS_CDN_URL, GITHUB_TOKEN"
echo "  3. Verify the network name (immich_default) matches your Immich setup:"
echo "       docker network ls"
echo "  4. Start the sidecar:"
echo "       docker compose up -d photo-sync"
echo "  5. Test with a dry run:"
echo "       docker compose exec photo-sync node sync-immich.mjs --dry-run"
