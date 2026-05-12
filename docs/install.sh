#!/usr/bin/env bash
#
# One-command installer for Open Friday AI Coding Assistant
# Usage: curl -fsSL https://samkomedved319-dev.github.io/OpenFriday/install.sh | sh
#

set -e

VERSION="2.0.0"
REPO_URL="https://github.com/samkomedved319-dev/OpenFriday.git"
INSTALL_DIR="$HOME/OpenFriday"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║     🤖 Open Friday v$VERSION Installer        ║"
echo "║     Your AI Coding Companion                ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ─── Step 1: Check Node.js ───
echo "[1/4] Checking Node.js..."
if command -v node &>/dev/null; then
    NODE_VER=$(node --version)
    echo "  ✓ Node.js $NODE_VER detected"
else
    echo "  ✗ Node.js not found!"
    echo "  Install via: brew install node (macOS)"
    echo "  Or: apt install nodejs (Linux)"
    echo "  Or download: https://nodejs.org"
    echo ""
    exit 1
fi

# ─── Step 2: Install / Update ───
if [ -d "$INSTALL_DIR" ]; then
    echo "[2/4] Updating Open Friday..."
    cd "$INSTALL_DIR"
    git pull 2>/dev/null || true
    echo "  ✓ Updated!"
else
    echo "[2/4] Downloading Open Friday..."
    if command -v git &>/dev/null; then
        git clone "$REPO_URL" "$INSTALL_DIR"
    else
        echo "  Git not found, downloading ZIP..."
        curl -fsSL "https://github.com/samkomedved319-dev/OpenFriday/archive/main.zip" -o /tmp/openfriday.zip
        unzip -q /tmp/openfriday.zip -d /tmp/openfriday-temp
        mkdir -p "$INSTALL_DIR"
        cp -r /tmp/openfriday-temp/OpenFriday-main/* "$INSTALL_DIR/"
        rm -rf /tmp/openfriday-temp /tmp/openfriday.zip
    fi
    echo "  ✓ Downloaded!"
fi

cd "$INSTALL_DIR"

# ─── Step 3: Install dependencies ───
echo "[3/4] Installing global command..."
npm link --silent 2>/dev/null || sudo npm link --silent 2>/dev/null
echo "  ✓ Global command installed!"

# ─── Step 4: Launch ───
echo "[4/4] Launching Open Friday..."
echo ""

sleep 1

# Clear session so login is required
rm -f "$INSTALL_DIR/core/session.json"

openfriday