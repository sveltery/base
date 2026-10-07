---
name: verify-sveltery-components
description: Verify working order of Sveltery Base components in the fixtures app. Use first when a change touches packages/base or a component fixture. Drive the Svelte component, not the docs site, and do not require React renderer behavior.
---

# Verify Sveltery components

This is the first verification skill. The library under test is `@sveltery/base`, a Svelte 5 port of Base UI v1.8.0 (`47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`). Components are exercised in `@sveltery/fixtures` routes such as `/toggle` and `/button`, after hydration. The docs site at `/docs` is a later check: [verify-sveltery-docs](../verify-sveltery-docs/SKILL.md).

A component is in working order when a rendered Svelte instance shows the business outcome: role and state attributes, activation, cancellation, disabled behavior, controlled or uncontrolled updates, and cleanup. Matching a React runtime quirk is not working order.

## What stays in React

React is allowed only in reference fixtures. Pass `&reference` on a fixture URL to mount the `@base-ui/react` 1.8.0 counterpart (`apps/fixtures` loads those mounts from `*-reference.ts`). The Svelte case is the library. Do not import React from `packages/base`.

Do not port these, and do not fail a Svelte run because they are missing. They are renderer machinery, recorded in [docs/source-porting.md](../../../docs/source-porting.md) and [docs/rendering.md](../../../docs/rendering.md):

- StrictMode double-mount, effect dependency lists, layout effects, insertion-effect guards
- Synthetic events and React event delegation
- `className`, React CSS style objects, render props, `children` as a function
- `UseRender`, `cloneElement`, callback-ref identity and fanout, render/commit emulation
- React.Activity keep-alive (Collapsible and Accordion leave those cases deferred)
- React controlled-input reset, where the `value` string becomes the form's reset default. Svelte keeps `value` and `defaultValue` distinct ([I-02](../../../docs/upstream-differences.md))
- React commit batching that hides a same-turn state read ([T-02](../../../docs/upstream-differences.md))

Port and verify the business mechanism when Svelte has no equivalent: cancellation (`preventBaseUIHandler` and canceled changes), focus ownership, disabled behavior, popup open and close, field registration, validation. Keep an upstream business bug if the pin has it. A paired `&reference` disagreement is a native difference to record with zero unchanged parity credit, not a reason to copy the React runtime. Read [docs/upstream-differences.md](../../../docs/upstream-differences.md) before calling that disagreement a bug.

## Launch

The fixtures app serves both component routes and `/docs`. From the repo root:

```sh
.cursor/skills/verify-sveltery-docs/scripts/session.sh launch
```

Node 24.x is required. If `node` is not 24, that script prepends the newest `~/.nvm/versions/node/v24.*/bin`, then sources `scripts/toolchain.sh` and runs `pnpm --filter @sveltery/fixtures dev --port "$PORT" --strictPort`. Ready when it prints `ready http://127.0.0.1:5173/docs`. The same origin serves `/toggle` and `/button`.

One tracked session. A second copy needs another `SVELTERY_DOCS_STATE` and a free `PORT`. Do not start `pnpm test:e2e` against this session: `playwright.config.ts` binds 5173 itself and sets `reuseExistingServer: false`.

## Doctor

```sh
.cursor/skills/verify-sveltery-docs/scripts/session.sh doctor
```

Read-only. It checks the recorded pid owns the port, the listener is Node 24 running `vite dev`, and `GET /docs` is the fixtures SSR shell (`Sveltery Base`, `data-hydrated="false"`, no `role="dialog"`). There is no auth. Component routes are not ready for interaction until the browser sees `main[data-hydrated="true"]`. SSR HTML on those routes still has `data-hydrated="false"`.

## Drive

Install Chromium once if launch fails, after `source scripts/toolchain.sh`, with `pnpm exec playwright install chromium`. Sandbox stays on.

```sh
node .cursor/skills/verify-sveltery-components/scripts/drive-toggle.mjs
```

That drives uncontrolled Toggle. The feature map lists the other component paths; driving only Toggle does not cover them. Run those snippets against the same origin. Do not append `&reference` unless the question is the React fixture.

Stable handles:

| Component | Route                       | Handle                                                                   |
| --------- | --------------------------- | ------------------------------------------------------------------------ |
| Toggle    | `/toggle?case=uncontrolled` | `getByRole('button', { name: 'Toggle', exact: true })`, `#tested-toggle` |
| Button    | `/button?case=custom`       | `getByRole('button', { name: 'Save' })`, `#tested-button`                |
| Input     | `/input?case=default`       | `#tested-input`, reset button `getByRole('button', { name: 'Reset' })`   |
| Hydration | any fixture                 | `main[data-hydrated="true"]`                                             |

`name: 'Toggle'` without `exact` also matches "Toggle mounting". Use exact.

## Evidence

`drive-toggle.mjs` writes `/tmp/sveltery-docs-verify/evidence/<utc-timestamp>/`:

- `toggle-before.png`, `toggle-pressed.png`, `toggle-released.png`
- `transcript.txt`

Proof is the sequence: hydrated `aria-pressed="false"`, click, `aria-pressed="true"`, click, `aria-pressed="false"`. The `calls` output on the fixture is a side effect of the press callback. Read it after the clicks. Do not set `aria-pressed` or the component state from the test.

## Cleanup

```sh
.cursor/skills/verify-sveltery-docs/scripts/session.sh cleanup
```

Signals the recorded process group only, removes `session/`, and leaves `evidence/`.

## Helpers

| Script          | Invocation                                                                       |
| --------------- | -------------------------------------------------------------------------------- |
| Fixtures server | `.cursor/skills/verify-sveltery-docs/scripts/session.sh launch\|doctor\|cleanup` |
| Toggle drive    | `node .cursor/skills/verify-sveltery-components/scripts/drive-toggle.mjs`        |

`SVELTERY_DOCS_STATE` defaults to `/tmp/sveltery-docs-verify`. The drive script reads `session/port` from that directory.
