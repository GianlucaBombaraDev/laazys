# Security Policy

## Supported versions

Laazys is in alpha: only the latest release receives security fixes.

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

Report them privately through GitHub: go to the [Security tab](https://github.com/GianlucaBombaraDev/laazys/security) of the repository and choose **Report a vulnerability**. Include:

- what the issue is and its possible impact
- steps or a sample project to reproduce it
- the Laazys and Node.js versions you used

You'll get a first answer as soon as possible. Once a fix is released, the report can be published as a security advisory, crediting you if you wish.

## Scope

Laazys is a local development tool: it reads source files from a folder you choose and serves them over HTTP on `localhost`. Relevant reports include, for example, reading files outside the given folder, the server being reachable beyond what's expected, or code execution through crafted source files.
