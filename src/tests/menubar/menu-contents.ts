// The menus of upstream `ContainedTriggerMenubar`, `DetachedTriggerMenubar` and
// `MultipleContainedTriggersMenubar`.
// Derived from Base UI v1.9.0 packages/react/src/menubar/Menubar.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

export type RadioItem = {
	type: 'radioItem';
	label: string;
	value: string;
	testId?: string;
};

export type ContentItem =
	| { type: 'item'; label: string; testId?: string }
	| { type: 'submenu'; label: string; testId?: string; menuTestId?: string; items: ContentItem[] }
	| { type: 'radioGroup'; defaultValue: string; items: RadioItem[] }
	| RadioItem;

export type MenuDefinition = {
	label: string;
	triggerTestId: string;
	menuTestId: string;
	items: ContentItem[];
};

export const menuContents: MenuDefinition[] = [
	{
		label: 'File',
		triggerTestId: 'file-trigger',
		menuTestId: 'file-menu',
		items: [
			{ type: 'item', label: 'Open', testId: 'file-item-1' },
			{ type: 'item', label: 'Save', testId: 'file-item-2' },
			{
				type: 'submenu',
				label: 'Share',
				testId: 'share-trigger',
				menuTestId: 'share-menu',
				items: [
					{ type: 'item', label: 'Email', testId: 'share-item-1' },
					{ type: 'item', label: 'Print', testId: 'share-item-2' }
				]
			}
		]
	},
	{
		label: 'Edit',
		triggerTestId: 'edit-trigger',
		menuTestId: 'edit-menu',
		items: [
			{ type: 'item', label: 'Copy', testId: 'edit-item-1' },
			{ type: 'item', label: 'Paste', testId: 'edit-item-2' }
		]
	},
	{
		label: 'View',
		triggerTestId: 'view-trigger',
		menuTestId: 'view-menu',
		items: [
			{ type: 'item', label: 'Zoom In', testId: 'view-item-1' },
			{ type: 'item', label: 'Zoom Out', testId: 'view-item-2' },
			{
				type: 'submenu',
				label: 'Layout',
				testId: 'layout-trigger',
				menuTestId: 'layout-menu',
				items: [
					{
						type: 'radioGroup',
						defaultValue: 'single',
						items: [
							{
								type: 'radioItem',
								value: 'single',
								label: 'Single column',
								testId: 'layout-item-1'
							},
							{ type: 'radioItem', value: 'two', label: 'Two columns', testId: 'layout-item-2' }
						]
					}
				]
			}
		]
	}
];
