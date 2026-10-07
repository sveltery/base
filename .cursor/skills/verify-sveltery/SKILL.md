---
name: verify-sveltery
description: Verify Sveltery Base components (Svelte 5 port of Base UI v1.8.0). Use after any change to src/lib or src/routes/fixtures, before pushing, or when a component looks broken. Runs lint, types, unit, Chromium component tests and paired Svelte/React Playwright fixtures with one command.
---

# Verify Sveltery components

The product is the component library in `src/lib`. Verification means a rendered Svelte component produces the right business outcome: role and ARIA/`data-*` state, activation, cancellation, disabled behavior, controlled and uncontrolled updates, and cleanup. Behavior is compared against React Base UI 1.8.0 (commit `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`), which runs only in fixtures.

## Run it

One component, every layer:

```sh
bash scripts/verify-component.sh toggle
```

Everything, including the package build and publint (run before pushing):

```sh
bash scripts/verify.sh
```

Both scripts source `scripts/toolchain.sh`. That picks Node 24 (preferring `~/.nvm/versions/node/v24.*` when another node is first on PATH), pins pnpm 12.6.0 via Corepack, and keeps caches, including Playwright browsers, in `.checks/`. Run commands from a plain shell; you do not need to fix PATH yourself.

First run on a new machine:

```sh
source scripts/toolchain.sh
pnpm install
pnpm exec playwright install chromium
```

If Chromium is missing, the scripts stop and print that install command.

## The layers

| Step                    | Command run                                                             | What it proves                                                                       |
| ----------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| format, lint            | `prettier --check`, `eslint` on the component and fixture               | Style, plus the rule that `src/lib` imports neither React nor SvelteKit              |
| types                   | `pnpm check` (svelte-check)                                             | Public props and state types compile                                                 |
| unit                    | `vitest --project server` on `src/lib/<name>` and `src/lib/internal`    | Pure helpers: event details, state attributes                                        |
| component               | `vitest --project client` on `src/lib/<name>` (real Chromium)           | Upstream `Toggle.test.tsx` assertions ported to Svelte, plus native rendering checks |
| e2e                     | `playwright test src/routes/fixtures/<name>` against a production build | The same user path on Svelte and on React Base UI, plus SSR HTML                     |
| package (full run only) | `pnpm run build` (svelte-package, publint)                              | The published package is well formed                                                 |

All steps run even after one fails, so the summary shows every layer.

## Read the result

The last lines are the verdict:

```
e2e svelte: 7 passed, 0 failed
e2e react: 6 passed, 0 failed
RESULT PASS
```

When something fails, use the framework split:

- **Svelte fails, React passes**: a regression in the port. Fix `src/lib`.
- **Both fail**: the fixture or the test is wrong. Fix `src/routes/fixtures` or the spec, not the component.
- **React fails only**: the test expects something upstream does not do, or the reference fixture is wired wrong. React's result is the expected business behavior. Fix the test or fixture, then check whether Svelte matched the wrong expectation.
- **Component (Vitest) fails, e2e passes**: open `component.log`. Vitest failure screenshots are in `src/**/__screenshots__/` (gitignored).

When Svelte and React disagree on purpose, assert the native Svelte result in a Svelte-only test, name it, and say why in the test. Never copy React renderer machinery to make them match (see the list below).

## Evidence

Each run writes `.verify/<component>/<UTC timestamp>/` (`.verify/all/...` for the full run), which is gitignored:

- `summary.txt`: commit, each step's PASS/FAIL, e2e split by framework
- `<step>.log`: full output of each step
- `playwright/`: traces and screenshots of failed e2e tests (`trace: retain-on-failure`). Open one with `pnpm exec playwright show-trace <path>/trace.zip`

Quote `summary.txt` when reporting. A pass at one commit says nothing about later edits.

## Isolation and cleanup

Playwright builds the app and starts `vite preview` on `E2E_PORT` (default 4173). It stops that server when the run ends. The scripts refuse to start if the port is taken. They never kill another process. To run two verifications at once, give the second one a free port:

```sh
E2E_PORT=4180 bash scripts/verify-component.sh toggle
```

A run interrupted with Ctrl-C can leave a `vite.js preview` process on that port. Find it by port, check its command line, and stop that PID only:

```sh
ps -eo pid,cmd | grep 'vite.js preview' | grep -- '--port 4173'
```

Do not kill processes by name. Do not delete `.verify/`; it is the evidence.

## Explore by hand

For behavior no spec covers yet, run `pnpm dev`, open `http://localhost:5173/fixtures/<name>?case=<case>`, and add `&reference` for React Base UI. Wait for `main[data-hydrated="true"]` before interacting. Turn what you find into a spec in the fixture's `*.e2e.ts`; do not keep one-off scripts.

## What stays in React

React exists only in `src/routes/fixtures/**/react-reference.ts` (devDependencies). Do not port these, and do not treat their absence as a failure:

- Hooks, StrictMode double-mounting, effect dependency arrays, layout or insertion effects
- Synthetic events and `preventBaseUIHandler()`: Svelte uses native events. A consumer `onclick` skips the part's handler with `event.preventDefault()`
- `className` and React style objects: use native `class` and `style`
- Render props and `cloneElement`: parts take a `render` snippet that receives `(props, state)`
- `ref`, `forwardRef` and callback refs: Svelte has no refs. Consumers pass `{@attach}` to the part, which reaches the host through the props spread (including inside `render`)
- Controlled/uncontrolled pairs (`pressed`/`defaultPressed`, `useControlled`): one `$bindable` prop. `bind:pressed` shares it with the parent; a one-way value sets it until the parent changes it, and clicks can override it in between. To veto a change, use `eventDetails.cancel()`
- React commit batching and same-turn stale reads: Svelte reads live state

Keep the business mechanisms, even upstream bugs: cancellation through `eventDetails.cancel()`, disabled handling, state attributes, focus, registration and cleanup.

Because the idioms differ, a paired fixture may express one case differently per framework (for example `bind:pressed` against controlled `pressed` plus `onPressedChange`). The assertions stay the same.

## Adding a component

Copy the Toggle layout. Each component needs all four layers, or the script reports a failure:

- `src/lib/<name>/`: component, `types.ts`, `index.ts`, and `<Name>.svelte.spec.ts` porting the upstream test file (keep the attribution header)
- `src/routes/fixtures/<name>/`: `cases.ts`, `+page.ts`, `+page.svelte`, `<Name>Fixture.svelte`, `react-reference.ts`, `<name>.e2e.ts`
- A row in `features/README.md` and a feature file

The feature map in [features/README.md](features/README.md) lists what is verified for each component and what is not yet ported.
