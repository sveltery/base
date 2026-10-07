# Sveltery Base

An experimental, unofficial Svelte 5 port of [Base UI](https://base-ui.com/), starting from Base UI v1.8.0 (commit [`47b40521`](https://github.com/mui/base-ui/tree/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c)). Not affiliated with or endorsed by MUI or Base UI.

The project was restarted from a fresh `sv create` library scaffold (Prettier, ESLint, Vitest with browser component tests, Playwright). It currently ships `Toggle`, `Button`, and `Avatar`. The package is private and unpublished.

```svelte
<script lang="ts">
	import { Toggle } from '@sveltery/base';

	let pressed = $state(false);
</script>

<Toggle bind:pressed onPressedChange={(next) => console.log(next)}>Bold</Toggle>
```

```svelte
<script lang="ts">
	import { Button } from '@sveltery/base';
</script>

<Button onclick={() => console.log('save')}>Save</Button>
```

## Develop

Requires Node 24 and pnpm 12.6.0 (selected automatically by `scripts/toolchain.sh` through Corepack).

```sh
source scripts/toolchain.sh
pnpm install
pnpm exec playwright install chromium
pnpm dev
```

`pnpm dev` serves the fixture routes under `/fixtures`. Add `&reference` to a fixture URL to render React Base UI for comparison.

## Verify

```sh
bash scripts/verify-component.sh toggle   # one component, every layer
bash scripts/verify.sh                    # everything, including the package build
```

See [.cursor/skills/verify-sveltery/SKILL.md](.cursor/skills/verify-sveltery/SKILL.md) for what each layer covers and how to read failures.

## License

MIT. Upstream-derived code retains the Base UI MIT notice in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
