// Item tree that MenuHarness renders, so one harness covers the ported Menu specs.
// Derived from Base UI v1.9.0 packages/react/src/menu/root/MenuRoot.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
type Bag = Record<string, unknown>;

export type MenuItemSpec =
	| { type: 'item'; label: string; props?: Bag; as?: 'button' }
	| { type: 'link'; label: string; props?: Bag }
	| { type: 'checkbox'; label: string; props?: Bag; indicator?: Bag }
	| {
			type: 'radio-group';
			props?: Bag;
			groupLabel?: string;
			items: { label: string; value: unknown; props?: Bag; indicator?: Bag }[];
	  }
	| { type: 'group'; props?: Bag; groupLabel?: string; items: MenuItemSpec[] }
	| { type: 'separator' }
	| { type: 'button'; label: string }
	| {
			type: 'submenu';
			label: string;
			rootProps?: Bag;
			triggerProps?: Bag;
			portalProps?: Bag;
			positionerProps?: Bag;
			popupProps?: Bag;
			items: MenuItemSpec[];
	  };

export function items(...labels: string[]): MenuItemSpec[] {
	return labels.map((label) => ({ type: 'item', label }));
}
