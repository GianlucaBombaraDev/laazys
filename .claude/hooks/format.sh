#!/usr/bin/env bash
# PostToolUse: format the file Claude just edited with the repo's Prettier config.
file=$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s).tool_input?.file_path??"")}catch{}})')

case "$file" in
    "$CLAUDE_PROJECT_DIR"/*) ;;
    *) exit 0 ;;
esac
case "$file" in
    */node_modules/* | */dist/* | */packages/laazys/app/*) exit 0 ;;
    *.ts | *.js | *.mjs | *.vue | *.css) ;;
    *) exit 0 ;;
esac

prettier="$CLAUDE_PROJECT_DIR/node_modules/.bin/prettier"
[ -x "$prettier" ] || exit 0
"$prettier" --write --log-level warn "$file" >&2 || true
exit 0
