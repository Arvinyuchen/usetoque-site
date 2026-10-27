#!/bin/sh
# Regenerate img/og.png (1200x630) from tools/og/index.html with headless Chrome.
set -e
cd "$(dirname "$0")/../.."
PROFILE=$(mktemp -d)
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
  --screenshot="$PWD/img/og.png" --window-size=1200,630 --force-device-scale-factor=1 \
  --hide-scrollbars --virtual-time-budget=4000 --user-data-dir="$PROFILE" "file://$PWD/tools/og/index.html"
rm -rf "$PROFILE"
