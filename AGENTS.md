# Repository guidance

Sveltery Base is a Svelte 5 port of Base UI, pinned to v1.8.0 commit `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`. The library is `src/lib`; fixtures and their React Base UI references are `src/routes/fixtures`.

## Porting

- Start from the pinned upstream component and its test file. Keep the business behavior, including upstream bugs. File a GitHub issue for a bug instead of fixing it silently.
- Use native Svelte in place of React machinery: runes, snippets, native events, `bind:ref` with attachments, and the `Controlled` class for controlled/uncontrolled state. Do not recreate hooks, synthetic events, StrictMode behavior or render-prop cloning.
- `src/lib` must not import React or SvelteKit (enforced by ESLint).
- Keep the MIT attribution header on ported files and update `THIRD_PARTY_NOTICES.md`.
- Keep components small. Add a dependency only when the component actually uses it.

## Verifying

Read [.cursor/skills/verify-sveltery/SKILL.md](.cursor/skills/verify-sveltery/SKILL.md). Before pushing, run `bash scripts/verify-component.sh <name>` for each changed component and `bash scripts/verify.sh`, then report the `summary.txt` result. Each component needs a ported spec, a paired fixture and a feature-map entry.
