---
name: verify-docs-output
description: Build Laazys and run the CLI against the sample files to check the real /files output and the served SPA. Use after changing parsing, the server, the file shape, or the UI build, before saying a change works.
---

Run from the repo root. Rebuild only what changed. Both builds are needed after dependency or shape changes.

```bash
(cd packages/laazys-app && pnpm build)      # only if the UI changed: outputs to packages/laazys/app
(cd packages/laazys && pnpm build)          # tsc + tsc-fix
```

Start the server in the background, inspect it, then stop it:

```bash
cd packages/laazys
log=$(mktemp)
node dist/bin/laazys.js -p ./test > "$log" 2>&1 &
pid=$!
sleep 4
curl -s localhost:3000/files | node -e '
let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
  for (const f of JSON.parse(s)) console.log(f.extension, f.name, "status=" + f.status, "methods=" + (f.methods?.length ?? 0), "snippet=" + Boolean(f.sourceCode))
})'
curl -s -o /dev/null -w 'SPA reload /file/x -> %{http_code}\n' localhost:3000/file/x
cat "$log"
kill $pid
```

What to check:

- All 4 sample files are listed (`Prova`, `Test`, `useProva`, `useTest`), and `name` is the bare file name, not a path. A missing `.vue` file means it threw during parsing: the stack trace is in the log.
- `Prova` has `status=Deprecated`, 1 method and a snippet. The composables have 2 methods each.
- The SPA reload returns 200.
- For a change limited to one case (e.g. a new tag), add a sample to `packages/laazys/test/` rather than pointing `-p` at a real project. Remove the sample afterwards if it was only for the check.

If port 3000 is busy, the CLI moves to the next free port: read the actual port from the log.
