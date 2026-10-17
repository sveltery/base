/** Sveltery Base releases, newest first. Highlights take code spans and links. */
export const releases = [
	{
		version: 'v0.2.1',
		date: '2026-10-17',
		url: 'https://www.npmjs.com/package/@sveltery/base/v/0.2.1',
		highlights: [
			'`ScrollArea` and `Select` insert one shared scrollbar-hiding `<style>` into the head, as Base UI does, instead of one inline copy per instance.',
			'`Slider.Thumb` and `Tabs.Indicator` remove their prehydration script once mounted, so hydrated pages keep no `<script>` in them.',
			'A closed positioner keeps its measured CSS variables, and `Select` clears only its aligned styles on close, as in Base UI.',
			'A mouse press opens a popup after the press frame paints, so `Select` shows the selected item highlighted in its first painted frame.'
		]
	},
	{
		version: 'v0.2.0',
		date: '2026-10-17',
		url: 'https://www.npmjs.com/package/@sveltery/base/v/0.2.0',
		highlights: [
			'Breaking: `Form`, `Field` and `Fieldset` now have the same API as Base UI 1.9.0.',
			"Removed the additions Base UI does not have: Form's `form` source prop, `enhance`, `onFocusInvalid` and `Form.Error`, the `field` and `type` props on `Field.Root`, and the bound-control layer in the form controls.",
			'`Form` renders `novalidate` on the server, and it no longer skips validation when the submitter has `formnovalidate`.',
			'To use a SvelteKit remote form, spread `f.fields.x.as(type)` on `Field.Control`. See the [SvelteKit handbook page](/handbook/sveltekit).'
		]
	},
	{
		version: 'v0.1.1',
		date: '2026-10-17',
		url: 'https://www.npmjs.com/package/@sveltery/base/v/0.1.1',
		highlights: [
			'Dialog and alert dialog backdrops get `aria-hidden` and `data-base-ui-inert` while the popup is open, as in Base UI.',
			'`Tabs.Tab` sets `data-composite-item-active` on the active tab, and a composite list whose items are all disabled keeps one tab stop, so a disabled radio group has one radio with `tabindex="0"`.'
		]
	},
	{
		version: 'v0.1.0',
		date: '2026-10-16',
		url: 'https://www.npmjs.com/package/@sveltery/base/v/0.1.0',
		highlights: [
			'First release of [`@sveltery/base`](https://www.npmjs.com/package/@sveltery/base) on npm.',
			"Follows [Base UI v1.9.0](https://base-ui.com/react/overview/releases/v1-9-0), so Base UI's release notes up to that version describe the behavior Sveltery Base ports."
		]
	}
];
