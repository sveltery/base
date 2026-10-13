# Sveltery Base

An experimental, unofficial Svelte 5 port of [Base UI](https://base-ui.com/), pinned to Base UI v1.9.0 (commit [`ad7ecda5`](https://github.com/mui/base-ui/tree/ad7ecda5296b0295b41a51ecb01fce6204acd099)). Not affiliated with or endorsed by MUI or Base UI.

The project was restarted from a fresh `sv create` library scaffold (Prettier, ESLint, Vitest with browser component tests, Playwright). It currently ships `Toggle`, `Button`, `Checkbox`, `CheckboxGroup`, `Radio`, `RadioGroup`, `Avatar`, `Fieldset`, `Field`, `Input`, `Separator`, `Meter`, `Progress`, `Form`, `ToggleGroup`, `Switch`, `Collapsible`, `Accordion`, `Tabs`, `Toolbar`, `NumberField`, `ScrollArea`, `Slider`, `DirectionProvider`, `OTPField`, `CSPProvider`, `Popover`, `Dialog`, `AlertDialog`, and `Drawer`. The package is private and unpublished.

```svelte
<script lang="ts">
	import { Button, Fieldset, Separator, Toggle } from '@sveltery/base';

	let pressed = $state(false);
</script>

<Toggle bind:pressed onPressedChange={(next) => console.log(next)}>Bold</Toggle>

<Fieldset.Root>
	<Fieldset.Legend>Billing</Fieldset.Legend>
	<input />
</Fieldset.Root>

<Button onclick={() => console.log('save')}>Save</Button>
<Separator />
<Separator orientation="vertical" />
```

```svelte
<script lang="ts">
	import { Meter } from '@sveltery/base';
</script>

<Meter.Root value={40}>
	<Meter.Label>Storage</Meter.Label>
	<Meter.Value />
	<Meter.Track>
		<Meter.Indicator />
	</Meter.Track>
</Meter.Root>
```

```svelte
<script lang="ts">
	import { Progress } from '@sveltery/base';
</script>

<Progress.Root value={30}>
	<Progress.Label>Upload progress</Progress.Label>
	<Progress.Value />
	<Progress.Track>
		<Progress.Indicator />
	</Progress.Track>
</Progress.Root>
```

## Develop

Requires Node 22 or newer and pnpm 12.6.0 (`scripts/toolchain.sh` selects it through Corepack).

```sh
source scripts/toolchain.sh
pnpm install
pnpm exec playwright install chromium
pnpm dev
```

`pnpm dev` serves the fixture routes under `/fixtures`. Add `&reference` to a fixture URL to render React Base UI for comparison.

## Verify

```sh
bash scripts/verify-component.sh toggle  # one component, every layer
bash scripts/verify.sh                  # everything, including the package build
```

See [.cursor/skills/verify-sveltery/SKILL.md](.cursor/skills/verify-sveltery/SKILL.md) for what each layer covers and how to read failures. [AGENTS.md](AGENTS.md) and [docs/porting.md](docs/porting.md) hold the porting rules.

## License

MIT. Upstream-derived code retains the Base UI MIT notice in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
