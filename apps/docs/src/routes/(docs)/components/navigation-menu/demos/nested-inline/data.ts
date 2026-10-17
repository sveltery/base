export const audienceMenus = [
	{
		value: 'developers',
		label: 'Developers',
		hint: 'Go from idea to UI faster.',
		title: 'Build product UI without giving up control',
		description:
			'Start with accessible parts and shape them to your app instead of working around a preset design system.',
		links: [
			{
				href: '/overview/quick-start',
				title: 'Quick start',
				description:
					'Install Sveltery Base and get your first interactive primitive on screen fast.'
			},
			{
				href: '/handbook/composition',
				title: 'Composition',
				description: 'Wrap and combine parts to match your product structure without hacks.'
			}
		]
	},
	{
		value: 'systems',
		label: 'Design Systems',
		hint: 'Keep patterns aligned across teams.',
		title: 'Turn shared standards into working components',
		description:
			'Connect tokens, states, and accessibility rules once, then give every product team the same solid starting point.',
		links: [
			{
				href: '/handbook/styling',
				title: 'Styling',
				description: 'Map tokens and component states to your own CSS or utility setup.'
			},
			{
				href: '/overview/accessibility',
				title: 'Accessibility',
				description: 'Review keyboard support and semantic defaults before anything ships.'
			},
			{
				href: '/components/tooltip',
				title: 'Tooltip',
				description: 'Set one clear pattern for lightweight help, hints, and field guidance.'
			},
			{
				href: '/components/popover',
				title: 'Popover',
				description: 'Handle richer anchored panels like menus, inspectors, and onboarding.'
			}
		]
	},
	{
		value: 'managers',
		label: 'Engineering Leads',
		hint: 'Roll out shared UI without drag.',
		title: 'Give squads clear defaults and room to move',
		description:
			'Use the docs to align on quality bars, upgrades, and extension points while still leaving teams space to customize.',
		links: [
			{
				href: '/overview/releases',
				title: 'Releases',
				description: 'Track version changes and migration notes before upgrades surprise teams.'
			},
			{
				href: '/handbook/typescript',
				title: 'TypeScript',
				description: 'See how the primitives type custom wrappers and shared abstractions.'
			},
			{
				href: '/handbook/forms',
				title: 'Forms',
				description: 'Standardize validation and field patterns teams reach for constantly.'
			}
		]
	},
	{
		value: 'startups',
		label: 'Startups',
		hint: 'Ship polished basics while things change.',
		title: 'Get sturdy UI foundations in place early',
		description:
			'Cover the hard interaction details now so your team can spend more time on the product ideas that actually differentiate you.',
		links: [
			{
				href: '/overview/quick-start',
				title: 'Quick start',
				description: 'Get the package installed and your first component working in minutes.'
			},
			{
				href: '/components/menu',
				title: 'Menu',
				description: 'Add action menus with keyboard support and focus handling already done.'
			},
			{
				href: '/components/dialog',
				title: 'Dialog',
				description: 'Launch settings or upgrade flows without rebuilding focus management.'
			}
		]
	}
] as const;

export const guidesPanel = {
	title: 'Where teams usually start',
	description:
		'These are the docs people reach for first when they are turning a prototype into shared UI.'
} as const;

export const guideLinks = [
	{
		href: '/overview/accessibility',
		title: 'Accessibility handbook',
		description: 'Take a practical pass over focus order, semantics, and keyboard support.'
	},
	{
		href: '/handbook/composition',
		title: 'Composition handbook',
		description: 'Learn when to wrap parts, share behavior, and expose flexible APIs.'
	},
	{
		href: '/handbook/styling',
		title: 'Styling handbook',
		description: 'Apply tokens and state styles without fighting the underlying markup.'
	}
] as const;
