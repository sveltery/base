/** Sveltery Base releases, newest first. Highlights take code spans and links. */
export const releases = [
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
