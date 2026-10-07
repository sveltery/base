# Repository guidance

Sveltery Base is a Svelte 5 port of Base UI, pinned to v1.8.0 commit `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`. The library is `src/lib`; fixtures and their React Base UI references are `src/routes/fixtures`.

## Porting

- Start from the pinned upstream component and its test file. Keep the business behavior, including upstream bugs. File a GitHub issue for a bug instead of fixing it silently.
- Write native Svelte in code and behavior: runes, snippets, native events (`event.preventDefault()` to skip a part's handler), `$bindable` props in place of controlled/default pairs, and consumer `{@attach}` instead of refs. Do not recreate hooks, refs, synthetic events, StrictMode behavior or render-prop cloning. The skill's "What stays in React" section lists these differences.
- `src/lib` must not import React or SvelteKit (enforced by ESLint).
- Keep the MIT attribution header on ported files and update `THIRD_PARTY_NOTICES.md`.
- Keep components small. Add a dependency only when the component actually uses it.

## Verifying

Read [.cursor/skills/verify-sveltery/SKILL.md](.cursor/skills/verify-sveltery/SKILL.md). Before pushing, run `bash scripts/verify-component.sh <name>` for each changed component and `bash scripts/verify.sh`, then report the `summary.txt` result. Each component needs a ported spec, a paired fixture and a feature-map entry.
