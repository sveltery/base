# Repository guidance

Sveltery Base is a Svelte 5 port of [Base UI](https://base-ui.com/), pinned to v1.8.0 commit `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`. The repository is a pnpm workspace. The base library is the root package, in `src/lib`. Fixtures and their React Base UI references are `src/routes/fixtures`. `packages/utils` (`@sveltery/utils`) holds the shared helpers that Base UI keeps in `@base-ui/utils`. `packages/floating-ui-svelte` (`@sveltery/floating-ui-svelte`) holds the Svelte version of Base UI's floating-ui fork. Packages never import the base library, and the base library imports a package only by its name. [docs/porting.md](docs/porting.md) is the rulebook for turning Base UI code into Svelte. Read it before you port anything.

## Port the intent, not the React code

- Port every behavior Base UI intends: roles, ARIA and `data-*` state, keyboard and pointer handling, focus, cancellation through `eventDetails.cancel()`, validation and cleanup.
- Keep React-only behavior out. Mirror HTML and Svelte instead. Use `class`, not `className`. Use `onclick`, not `onClick`. Use HTML attribute names such as `readonly`, `autocomplete` and `inputmode`. Do not recreate hooks, refs, synthetic events, StrictMode behavior or render-prop cloning.
- When React and Svelte differ, take Svelte's default. A controlled React input ignores a form reset. A Svelte `bind:value` input resets. The port resets.
- Read the upstream code for its intent, then look for the Svelte primitive that already does the job. `useIsoLayoutEffect` is `$effect`. `useStableCallback` and latest-value refs are not needed. `useSyncExternalStore` is `createSubscriber`. Do not copy a helper that Svelte makes unnecessary.
- Port the internals as well as the components. Utilities and helpers that carry real behavior (timers, scroll lock, transition status, focus management, composite lists, positioning) get a Svelte version.
- Port each custom hook as a class in a `*.svelte.ts` file. The constructor takes getters, the fields are `$state` or `$derived`, and `createContext` exposes the instance. [docs/porting.md](docs/porting.md#hooks-become-classes) has the pattern.

## Props and events

- `$bindable` replaces each controlled and default pair. No binding is uncontrolled, `bind:x` is two-way, and `bind:x={get, set}` lets the parent reject a change. Commit the new value in the event handler, not in an effect.
- `defaultValue` and `defaultChecked` exist only on form controls, where they mean what HTML means: the initial value and the value a form reset restores. Other components take `bind:open`, `bind:value` or `bind:pressed` with an initial value.
- `event.preventDefault()` in a consumer handler is the one signal that skips a part's own handler.

## Upstream bugs

- Fix an upstream bug that Base UI v1.9.0 already fixed, and note the fix in [docs/upstream-differences.md](docs/upstream-differences.md).
- For any other upstream bug, keep the upstream behavior while the paired React fixture is the oracle, and file a GitHub issue.

## Dependencies

Sort every upstream dependency into one of three categories:

1. Framework-agnostic, such as `@floating-ui/dom`. Use it directly.
2. Framework-specific with a public agnostic core, such as `@floating-ui/react-dom`. Use the agnostic core. Put any Svelte wrapper around it in its own monorepo package.
3. Framework-specific with no agnostic core, such as Base UI's floating-ui-react fork. Write your own Svelte version, in its own monorepo package, not inside `src/lib`. `packages/floating-ui-svelte` is the one for floating-ui.

Add a dependency only when a component uses it. `src/lib` must not import React or SvelteKit. The integration subpaths are the exceptions: `src/lib/form/kit` may import SvelteKit and `src/lib/form/tanstack` may import TanStack Form, and nothing else in `src/lib` imports either subpath. ESLint enforces this.

## Forms

Form and Field are a headless form library inside the components. Keep all four of its jobs: form state, validation, integration with form libraries through `Field.Root` overrides and `bind:value`, and native framework integration. In Svelte, native integration means SvelteKit form actions (`use:enhance`) and remote form functions, not React actions or `useActionState`.

## Attribution

Keep the MIT attribution header on ported files and update [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Verify

Read [.cursor/skills/verify-sveltery/SKILL.md](.cursor/skills/verify-sveltery/SKILL.md). Before you push, run `bash scripts/verify-component.sh <name>` for each changed component and `bash scripts/verify.sh`, then report the `summary.txt` result. Each component needs a ported spec and a paired Svelte and React fixture.
