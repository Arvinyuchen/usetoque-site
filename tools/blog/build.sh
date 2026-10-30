#!/bin/sh
# Builds blog/ from blog/_src/ (see build.mjs). markdown-it is fetched by npx into its cache, pinned; nothing global.
set -e
cd "$(dirname "$0")/../.."
exec npx -y -p markdown-it@14.1.0 -c 'node tools/blog/build.mjs'
