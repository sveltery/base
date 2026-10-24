import { createElement as h, Fragment, useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { mountApp } from '../react-fixture.js';
import type { CommandCase } from './cases.js';

export function mountCommandReference(
	node: HTMLElement,
	scenario: CommandCase,
	onReady: () => void
) {
	function App() {
		const preset = scenario === 'preset';
		const [search, setSearch] = useState(preset ? 'c' : '');
		const [value, setValue] = useState(preset ? 'Carrot' : '');
		const [selected, setSelected] = useState<string[]>([]);
		useEffect(onReady, []);
		const onSelect = (picked: string) => setSelected((previous) => [...previous, picked]);
		const item = (text: string, props: object = {}) =>
			h(Command.Item, { onSelect, ...props }, text);
		return h(
			Fragment,
			null,
			h(
				Command,
				{ label: 'Command menu', value, onValueChange: setValue, loop: scenario === 'loop' },
				h(Command.Input, {
					placeholder: 'Type a command',
					value: search,
					onValueChange: setSearch
				}),
				h(
					Command.List,
					null,
					h(Command.Empty, null, 'No results.'),
					h(
						Command.Group,
						{ heading: 'Fruits' },
						item('Apple'),
						item('Banana'),
						item('Pineapple', { value: 'pineapple', keywords: ['tropical'] })
					),
					h(Command.Separator),
					h(
						Command.Group,
						{ heading: 'Vegetables' },
						item('Carrot'),
						item('Cabbage', { disabled: true }),
						item('Asparagus')
					),
					item('Settings', { keywords: ['preferences'] })
				)
			),
			h('output', { 'data-testid': 'value' }, value),
			h('output', { 'data-testid': 'selected' }, JSON.stringify(selected))
		);
	}

	return mountApp(node, App);
}
