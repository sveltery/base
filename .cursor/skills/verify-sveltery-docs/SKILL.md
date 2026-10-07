---
name: verify-sveltery-docs
description: Secondary check for the Sveltery Base docs site at /docs. Use only after component verification, when a change touches docs pages, docs chrome, or the live Dialog example on the docs page.
---

# Verify the Sveltery Base docs site

Secondary. Component working order comes first: use [verify-sveltery-components](../verify-sveltery-components/SKILL.md). Use this skill when the change is the docs pages themselves.

The reader-facing surface is the experimental docs preview inside `@sveltery/fixtures`. Browse `http://127.0.0.1:5173/docs`. Pages are prose plus one interactive example, the live Dialog. There is no auth, database, or saved user data.

Other surfaces, leave them to their own checks:

- `pnpm dev:preview` (`packages/base`) is a separate one-button library preview.
- Other routes under `apps/fixtures/src/routes` are Playwright fixtures, not the docs site.
- `pnpm test:e2e` starts its own Vite on port 5173 (`reuseExistingServer: false` in `playwright.config.ts`). Do not point that config at a server this skill already owns.

The feature map in `features/README.md` is the maintained list of reader paths. Driving one route does not cover the others.

## Launch

From the repo root, with dependencies already installed (`bash scripts/bootstrap.sh` if `node_modules` is missing):

```sh
.cursor/skills/verify-sveltery-docs/scripts/session.sh launch
```

That script:

1. Requires Node 24.x (`package.json` `engines`, and `scripts/toolchain.sh` exits otherwise). On this cloud VM `/exec-daemon/node` is v22 and wins over nvm. If `node` is not 24, the script prepends the newest installed `~/.nvm/versions/node/v24.*/bin`.
2. Sources `scripts/toolchain.sh`, which selects pnpm 12.6.0 and points Playwright's browser cache at `.checks/cache`.
3. Refuses to start when `/tmp/sveltery-docs-verify/session` already has a live pid, or when the requested port already has a listener. It does not kill a foreign process.
4. Starts `pnpm --filter @sveltery/fixtures dev --port "$PORT" --strictPort` (the package script is `vite dev --host 0.0.0.0`). Default `PORT` is 5173.
5. Returns when the log contains `Local:` and `curl` of `http://127.0.0.1:$PORT/docs` returns 200 with `Sveltery Base`.

The server is stateless, so two copies can run side by side. This helper tracks one session. A second copy needs a different `SVELTERY_DOCS_STATE` directory and a free `PORT`. Do not start a second process on a port you already launched.

```sh
PORT=5174 SVELTERY_DOCS_STATE=/tmp/sveltery-docs-verify-b \
  .cursor/skills/verify-sveltery-docs/scripts/session.sh launch
```

Ready output includes `ready http://127.0.0.1:5173/docs`, the pid, and the log path `session/server.log` under the state directory.

## Doctor

Run this first whenever the preview looks wrong. It only reads. It does not start or stop anything.

```sh
.cursor/skills/verify-sveltery-docs/scripts/session.sh doctor
```

It passes only when all of these are true:

- The recorded pid is alive, and that process or a descendant owns the recorded port.
- The listener's node binary reports major version 24.
- The listener command line contains `vite` and `dev`.
- `GET /docs` is 200, contains `Sveltery Base` and `Experimental`, contains `data-hydrated="false"` (SSR, before client mount), and does not contain `role="dialog"`.
- `GET /docs/components/dialog` is 200 and contains `Explore a dialog`.

There is no auth to validate. An anonymous GET is the whole check. Exit 0 prints `doctor ok`. Anything else exits non-zero and names the failed check.

## Drive

Install the browser once if drive cannot launch Chromium. Source the toolchain first so the download lands in the cache the script uses:

```sh
if [[ "$(node -p 'process.versions.node.split(".")[0]')" != 24 ]]; then
  NODE24="$(find "$HOME/.nvm/versions/node" -maxdepth 1 -type d -name 'v24.*' | sort -V | tail -1)"
  export PATH="$NODE24/bin:$PATH"
fi
source scripts/toolchain.sh
pnpm exec playwright install chromium
```

Sandboxed Playwright against the already-running session (do not use `playwright.config.ts`, which would start a second server):

```sh
.cursor/skills/verify-sveltery-docs/scripts/session.sh drive
```

`drive` runs `scripts/drive-live-dialog.mjs` with `chromiumSandbox: true`. That is the live Dialog path. Recipes for the other mapped features are in `features/`. Stable handles, from `apps/fixtures/src/routes/docs/+layout.svelte`, `DialogExample.svelte`, and `tests/browser/docs.spec.ts`:

| Handle                   | Selector                                                                     |
| ------------------------ | ---------------------------------------------------------------------------- |
| Docs shell, client ready | `.sveltery-docs[data-hydrated="true"]`                                       |
| Skip link                | `getByRole('link', { name: 'Skip to content' })`                             |
| Search                   | `getByRole('searchbox')` inside `form[role="search"]`                        |
| Search count             | `getByRole('status')` (`1 page found`, `0 pages found`)                      |
| Sidebar                  | `getByRole('navigation', { name: 'Documentation' })`                         |
| Search hits              | `getByRole('navigation', { name: 'Search results' })`                        |
| On this page             | `getByRole('navigation', { name: 'On this page' })`                          |
| Mobile menu              | `getByRole('button', { name: 'Browse docs' })` (shown at `max-width: 720px`) |
| Dialog trigger           | `getByRole('button', { name: 'Explore a dialog' })`                          |
| Dialog                   | `getByRole('dialog', { name: 'A little room to focus' })`                    |
| Note field               | `getByRole('textbox', { name: 'Your note' })`                                |
| Close                    | `getByRole('button', { name: 'Done exploring' })`                            |

Wait for `data-hydrated="true"` before clicking. The trigger is in the SSR HTML, and a click before hydration does not open the dialog. Scope text queries to the dialog: the example source is also in the page, inside `details`, so a page-wide search for the description matches twice.

## Evidence

`drive` writes a new directory under `/tmp/sveltery-docs-verify/evidence/<utc-timestamp>/`:

- `before-open.png` — Dialog page after hydration, dialog not open
- `dialog-open.png` — dialog visible with the note filled
- `after-close.png` — dialog gone, trigger focused
- `transcript.txt` — each assertion and the resulting state
- `requests.txt` — requests observed while the note was typed

Proof for the live Dialog is the sequence, not the final screenshot: hydration, click, dialog role and description, focused note, typed value, no `POST`/`PUT`/`PATCH`/`DELETE`, close, focus back on the trigger, reload with the note absent and no dialog. The note is a local demonstration and is not saved; the request log and the reload are how you see that, rather than trusting the docs copy.

This directory is outside the repo. Do not commit it.

## Cleanup

```sh
.cursor/skills/verify-sveltery-docs/scripts/session.sh cleanup
```

Sends `SIGTERM` to the recorded process group (the pid in `session/pid`, only when that pid is the group leader), waits, then `SIGKILL` if it is still alive. Removes `session/` (pid, port, log). Does not delete `evidence/`. Does not signal processes by name. If you launched a second state directory, run cleanup with the same `SVELTERY_DOCS_STATE`. Run cleanup after a failed drive so the port is not left occupied.

## Helpers

| Script                          | Invocation                                                                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `scripts/session.sh`            | `.cursor/skills/verify-sveltery-docs/scripts/session.sh launch\|doctor\|drive\|cleanup`                                                    |
| `scripts/drive-live-dialog.mjs` | called by `session.sh drive`; `node .cursor/skills/verify-sveltery-docs/scripts/drive-live-dialog.mjs` after `source scripts/toolchain.sh` |

`PORT` defaults to 5173. `SVELTERY_DOCS_STATE` defaults to `/tmp/sveltery-docs-verify`.
