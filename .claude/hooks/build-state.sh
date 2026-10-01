#!/usr/bin/env bash
# SessionStart: tell Claude which generated artifacts exist, so it knows what to build before running the CLI.
cd "$CLAUDE_PROJECT_DIR" || exit 0
state() { [ -e "$1" ] && echo "present" || echo "MISSING"; }
echo "laazys build state:"
echo "- node_modules: $(state node_modules/.modules.yaml)$( [ -e node_modules/.modules.yaml ] || echo ' (run: pnpm install)')"
echo "- SPA build packages/laazys/app: $(state packages/laazys/app/index.html)$( [ -e packages/laazys/app/index.html ] || echo ' (run: pnpm build in packages/laazys-app)')"
echo "- CLI build packages/laazys/dist: $(state packages/laazys/dist/bin/laazys.js)$( [ -e packages/laazys/dist/bin/laazys.js ] || echo ' (run: pnpm build in packages/laazys)')"
exit 0
