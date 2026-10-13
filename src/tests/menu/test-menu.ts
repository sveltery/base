// The item tree of upstream MenuRoot.test.tsx `TestMenuContents`.
import type { MenuItemSpec } from './types.js';

type Bag = Record<string, unknown>;

export interface TestMenuOptions {
	submenuProps?: Bag;
	submenuTriggerProps?: Bag;
}

export function testMenuItems(options: TestMenuOptions = {}): MenuItemSpec[] {
	const { submenuProps, submenuTriggerProps } = options;
	return [
		{ type: 'item', label: 'Item 1', props: { 'data-testid': 'item-1' } },
		{ type: 'item', label: 'Item 2', props: { 'data-testid': 'item-2' } },
		{ type: 'item', label: 'Item 3', props: { 'data-testid': 'item-3', disabled: true } },
		{
			type: 'submenu',
			label: 'Item 4',
			rootProps: submenuProps,
			triggerProps: { 'data-testid': 'submenu-trigger', ...submenuTriggerProps },
			popupProps: { 'data-testid': 'submenu' },
			items: [
				{ type: 'item', label: 'Item 4.1', props: { 'data-testid': 'item-4_1' } },
				{ type: 'item', label: 'Item 4.2', props: { 'data-testid': 'item-4_2' } },
				{
					type: 'submenu',
					label: 'Item 4.3',
					rootProps: submenuProps,
					triggerProps: { 'data-testid': 'nested-submenu-trigger', ...submenuTriggerProps },
					popupProps: { 'data-testid': 'nested-submenu' },
					items: [
						{ type: 'item', label: 'Item 4.3.1', props: { 'data-testid': 'item-4_3_1' } },
						{ type: 'item', label: 'Item 4.3.2', props: { 'data-testid': 'item-4_3_2' } }
					]
				}
			]
		},
		{ type: 'item', label: 'Item 5', props: { 'data-testid': 'item-5' } }
	];
}

export function testMenu(
	options: TestMenuOptions & {
		rootProps?: Bag;
		trigger?: Bag;
		portalProps?: Bag;
		positionerProps?: Bag;
		popupProps?: Bag;
		items?: MenuItemSpec[];
		detached?: boolean;
		/** Any other MenuHarness prop, passed through. */
		[harnessProp: string]: unknown;
	} = {}
) {
	const { submenuProps, submenuTriggerProps, positionerProps, popupProps, items, ...rest } =
		options;
	return {
		triggerLabel: 'Toggle',
		positionerProps: { 'data-testid': 'menu-positioner', ...positionerProps },
		popupProps: { 'data-testid': 'menu', ...popupProps },
		items: items ?? testMenuItems({ submenuProps, submenuTriggerProps }),
		...rest
	};
}
