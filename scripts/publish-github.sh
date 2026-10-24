#!/usr/bin/env bash
# Run after https://github.com/dawidw/jadlospis exists and GH_TOKEN can push.
set -euo pipefail
cd "$(dirname "$0")/.."

if ! git remote get-url github &>/dev/null; then
  git remote add github "https://github.com/dawidw/jadlospis.git"
fi

git push -u github main

gh api --method POST "/repos/dawidw/jadlospis/pages" -f build_type=workflow 2>/dev/null || \
  gh api --method PUT "/repos/dawidw/jadlospis/pages" -f build_type=workflow

echo "Pages deploy workflow should run on push. Check: gh run list -R dawidw/jadlospis"
