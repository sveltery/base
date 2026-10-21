# Sveltery Base

Sveltery Base (`@sveltery/base`) is an unfaithful Svelte 5 port of [Base UI](https://base-ui.com): unstyled, accessible components for building your own design system. It tracks Base UI v1.9.0 (commit [`ad7ecda5`](https://github.com/mui/base-ui/tree/ad7ecda5296b0295b41a51ecb01fce6204acd099)).

"Unfaithful" means that Sveltery Base follows Base UI's component anatomy, behavior, accessibility and docs, but changes the API where Svelte does things differently from React:

- A `render` prop is a snippet, not a function or element.
- Controlled state uses `bind:`, such as `bind:open` or `bind:value`. You can still use `onOpenChange` and the other change callbacks.
- The code does not emulate React. Hooks become runes, attachments and plain classes.

Each component page lists the differences that apply to that component. [docs/porting.md](docs/porting.md) shows how each React pattern maps to Svelte.

Sveltery Base is not affiliated with or endorsed by MUI or the Base UI team.

> [!NOTE]
> Sveltery Base is experimental and pre-1.0. The API can change in a minor release.

## Install

Sveltery Base requires Svelte 5.57.1 or newer.

```sh
npm install @sveltery/base
```

## Use

Import a component from its own entry point, so that your bundle contains only the components you use:

```svelte
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';
</script>

<Popover.Root>
	<Popover.Trigger>Notifications</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner sideOffset={8}>
			<Popover.Popup>
				<Popover.Title>Notifications</Popover.Title>
				<Popover.Description>You are all caught up.</Popover.Description>
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
```

The components are unstyled. Style them with any CSS solution, through `class` and the `data-*` state attributes that each part sets. The [quick start](https://base.sveltery.dev/overview/quick-start) explains the portal setup and shows a styled example.

## Documentation

- Docs: [base.sveltery.dev](https://base.sveltery.dev)
- Components: [base.sveltery.dev/components](https://base.sveltery.dev/components)
- Styled components built on Sveltery Base: [Sveltery UI](https://ui.sveltery.dev) ([sveltery/ui](https://github.com/sveltery/ui))

### For LLMs and agents

- `llms.txt`: [base.sveltery.dev/llms.txt](https://base.sveltery.dev/llms.txt) indexes the docs as Markdown, and [llms-full.txt](https://base.sveltery.dev/llms-full.txt) contains all of it in one file. Add `.md` to a page URL to get that page as Markdown.
- Agent skill: `npx skills add sveltery/base` installs the `sveltery-base` skill, which teaches a coding agent to use the components.

## Develop

Requires Node 22 or newer and pnpm 12.6.0 (`scripts/toolchain.sh` selects it through Corepack).

```sh
source scripts/toolchain.sh
pnpm install
pnpm exec playwright install chromium
pnpm dev
```

`pnpm dev` serves the fixture routes under `/fixtures`. Add `&reference` to a fixture URL to render React Base UI for comparison. To work on the docs site, run `pnpm --filter @sveltery/base-docs dev`. Refer to [apps/docs/README.md](apps/docs/README.md).

To check your work:

```sh
bash scripts/verify-component.sh toggle  # one component, every layer
bash scripts/verify.sh                   # everything, including the package build
```

[.cursor/skills/verify-sveltery/SKILL.md](.cursor/skills/verify-sveltery/SKILL.md) explains what each layer covers and how to read failures. [AGENTS.md](AGENTS.md) and [docs/porting.md](docs/porting.md) contain the porting rules.

## Credits

Sveltery Base would not exist without [Base UI](https://base-ui.com), made by the [Base UI team](https://base-ui.com/react/overview/about) at [MUI](https://mui.com) and the [Base UI contributors](https://github.com/mui/base-ui/graphs/contributors). The component behavior, the API design, the tests that the specs port and much of the documentation come from Base UI.

Thanks also to:

- [Floating UI](https://floating-ui.com), whose `@floating-ui/dom` positions every popup, and whose React hooks (by way of Base UI's fork) are the source of `packages/floating-ui-svelte`.
- [Svelte](https://svelte.dev) and [SvelteKit](https://svelte.dev/docs/kit).

## License

Original code is under the [MIT license](LICENSE), copyright Sveltery contributors.

Code, tests and docs derived from Base UI keep Base UI's MIT notice, "Copyright (c) 2019 Material-UI SAS". [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) lists every derived file, its upstream source and the full notice.
