#!/bin/bash
# RCC — refresh deploy folder before dragging to Netlify

DIR="$(cd "$(dirname "$0")" && pwd)"
DEPLOY="$DIR/rcc-deploy"

cp "$DIR/rcc.html" "$DEPLOY/index.html"
cp "$DIR/rcc.css"  "$DEPLOY/rcc.css"
cp "$DIR/rcc.js"   "$DEPLOY/rcc.js"
cp "$DIR/sw.js"    "$DEPLOY/sw.js"
cp "$DIR/manifest.json" "$DEPLOY/manifest.json"
cp "$DIR/icon.svg"      "$DEPLOY/icon.svg"

echo "✓ Deploy folder updated — ready to drag to Netlify"
