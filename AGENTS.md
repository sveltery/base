# Repository guidance

Sveltery Base is a Svelte 5 port of [Base UI](https://base-ui.com/), pinned to v1.9.0 commit `ad7ecda5296b0295b41a51ecb01fce6204acd099`. The repository is a pnpm workspace. The base library is the root package, in `src/lib`. Fixtures and their React Base UI references are `src/routes/fixtures`. `packages/utils` (`@sveltery/utils`) holds the shared helpers that Base UI keeps in `@base-ui/utils`. `packages/floating-ui-svelte` (`@sveltery/floating-ui-svelte`) holds the Svelte version of Base UI's floating-ui fork. Packages never import the base library, and the base library imports a package only by its name. [docs/porting.md](docs/porting.md) is the rulebook for turning Base UI code into Svelte. Read it before you port anything.

## Headless parts for Sveltery UI

Base also holds the headless parts that [Sveltery UI](https://github.com/sveltery/ui) needs and Base UI does not have. Hugo Hsi, the owner, signed off on this scope on 2026-10-24, along with any deviation from Base UI that Sveltery UI needs. These parts are ports of other libraries:

| Upstream                                                                    | Subpath                                                           |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| [cmdk](https://github.com/pacocoursey/cmdk)                                 | `@sveltery/base/command`                                          |
| [react-day-picker](https://github.com/gpbl/react-day-picker)                | `@sveltery/base/day-picker`                                       |
| [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) | `@sveltery/base/resizable`                                        |
| [input-otp](https://github.com/guilhermerodz/input-otp)                     | `@sveltery/base/input-otp`                                        |
| [@shadcn/react](https://github.com/shadcn-ui/ui)                            | `@sveltery/base/message-scroller`, `@sveltery/base/questionnaire` |

- Each part follows its own upstream, not Base UI. Its paired React fixture mounts that upstream, which is a devDependency at the version the port follows.
- The rules below still apply. Props use HTML and Svelte names, such as `maxlength`, not `maxLength`. Read an element with `bind:this` or a `render` snippet, not a `ref` prop.
- Base has two OTP inputs. OTPField is the Base UI part. InputOTP ports input-otp, because Sveltery UI's input OTP is built on it.
- A part with an optional peer dependency, such as date-fns for the day picker, is a subpath only. Do not export it from `src/lib/index.ts`. `node scripts/check-optional-peers.mjs` (run by `pnpm lint`) fails when the root barrel exports a folder that imports a package marked optional in `peerDependenciesMeta`.
- Docs pages go in the Extras section, `apps/docs/src/routes/(docs)/extras`. `apps/docs/scripts/compare-nav.ts` compares only the sections Base UI has.
- Upstream files copied without changes go in `upstreamCopies` in `eslint.config.js`, so they keep upstream's code. The `jsdom` Vitest project runs the upstream unit tests copied with them, `src/lib/resizable/**/*.test.ts`.

## Port the intent, not the React code

- Port every behavior Base UI intends: roles, ARIA and `data-*` state, keyboard and pointer handling, focus, cancellation through `eventDetails.cancel()`, validation and cleanup.
- Keep React-only behavior out. Mirror HTML and Svelte instead. Use `class`, not `className`. Use `onclick`, not `onClick`. Use HTML attribute names such as `readonly`, `autocomplete` and `inputmode`. Do not recreate hooks, refs, synthetic events, StrictMode behavior or render-prop cloning.
- When React and Svelte differ, take Svelte's default. A controlled React input ignores a form reset. A Svelte `bind:value` input resets. The port resets.
- Read the upstream code for its intent, then look for the Svelte primitive that already does the job. `useIsoLayoutEffect` is `$effect`. `useStableCallback` and latest-value refs are not needed. `useSyncExternalStore` is `createSubscriber`. Do not copy a helper that Svelte makes unnecessary.
- Port the internals as well as the components. Utilities and helpers that carry real behavior (timers, scroll lock, transition status, focus management, composite lists, positioning) get a Svelte version.
- Port each custom hook as a class in a `*.svelte.ts` file. The constructor takes getters, the fields are `$state` or `$derived`, and `createContext` exposes the instance. [docs/porting.md](docs/porting.md#hooks-become-classes) has the pattern.

## Props and events

- Each stateful prop is one `$bindable` prop, which replaces upstream's controlled prop. No binding is uncontrolled, `bind:x` is two-way, and `bind:x={get, set}` lets the parent reject a change. Commit the new value in the event handler, not in an effect.
- Each upstream `default*` prop exists beside its `$bindable` prop. It is the value an empty binding starts from, read once at mount. On form controls, `defaultValue` and `defaultChecked` also mean what HTML means: the value a form reset restores. `node scripts/compare-api-descriptions.ts <base-ui checkout>` fails when one is missing.
- `event.preventDefault()` in a consumer handler is the one signal that skips a part's own handler.

## Upstream bugs

- Fix an upstream bug that a newer Base UI release already fixed, and note the fix in [docs/upstream-differences.md](docs/upstream-differences.md).
- For any other upstream bug, keep the upstream behavior while the paired React fixture is the oracle, and file a GitHub issue.

## Dependencies

Sort every upstream dependency into one of three categories:

1. Framework-agnostic, such as `@floating-ui/dom`. Use it directly.
2. Framework-specific with a public agnostic core, such as `@floating-ui/react-dom`. Use the agnostic core. Put any Svelte wrapper around it in its own monorepo package.
3. Framework-specific with no agnostic core, such as Base UI's floating-ui-react fork. Write your own Svelte version, in its own monorepo package, not inside `src/lib`. `packages/floating-ui-svelte` is the one for floating-ui.

Add a dependency only when a component uses it. `src/lib` must not import React or SvelteKit. ESLint enforces this.

## Forms

Form, Field and Fieldset follow Base UI's API, with the differences the owner signed off listed in [docs/upstream-differences.md](docs/upstream-differences.md#the-browsers-constraint-check-is-the-submit-gate): the browser's constraint check is the submit gate, Form takes a SvelteKit remote form in `form`, `Field.Root name` is a path, and `Form.Error` shows form-level messages. Form libraries integrate through Form `errors` and `values`, the Field.Root `invalid`, `dirty`, `touched` and `validate` props, `bind:value`, and native inputs. Do not import SvelteKit in `src/lib`. Any other addition to this API needs the owner's sign-off and an entry in docs/upstream-differences.md.

## Attribution

Keep the MIT attribution header on ported files and update [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). The header names the Base UI version the file follows. A part ported from another upstream uses the same header with that upstream's name, version, path and commit, such as `Derived from cmdk v1.1.1 src/index.tsx (commit dd2250e). MIT, see THIRD_PARTY_NOTICES.md.` The docs read a part's description from the header text before `Derived from`. Each upstream has its own `## <upstream>` section in THIRD_PARTY_NOTICES.md, with its file list and license text. A file whose header still says v1.8.0 follows upstream code that changed in v1.9.0 and is not ported yet. `node scripts/provenance-bump.mjs` lists those files with the upstream commits that block them, and moves a header once the file follows the pin.

## Verify

Read [.cursor/skills/verify-sveltery/SKILL.md](.cursor/skills/verify-sveltery/SKILL.md). Before you push, run `bash scripts/verify-component.sh <name>` for each changed component and `bash scripts/verify.sh`, then report the `summary.txt` result. Each component needs a ported spec and a paired Svelte and React fixture.
