<script lang="ts">
	import { Select } from '@sveltery/base/select';
	import styles from './index.module.css';

	const languages = {
		javascript: 'JavaScript',
		typescript: 'TypeScript',
		python: 'Python',
		java: 'Java',
		csharp: 'C#',
		php: 'PHP',
		cpp: 'C++',
		rust: 'Rust',
		go: 'Go',
		swift: 'Swift'
	};

	type Language = keyof typeof languages;

	const values = Object.keys(languages) as Language[];

	function renderValue(value: Language[]) {
		if (value.length === 0) {
			return 'Select languages';
		}

		const firstLanguage = languages[value[0]];
		const additionalLanguages = value.length > 1 ? ` (+${value.length - 1} more)` : '';
		return firstLanguage + additionalLanguages;
	}
</script>

<div class={styles.Field}>
	<Select.Root multiple defaultValue={['javascript', 'typescript']}>
		<Select.Label class={styles.Label}>Languages</Select.Label>
		<Select.Trigger class={styles.Select}>
			<Select.Value class={styles.Value}>
				{#snippet children(value)}
					{renderValue(value as Language[])}
				{/snippet}
			</Select.Value>
			<Select.Icon>
				{@render caretUpDownIcon()}
			</Select.Icon>
		</Select.Trigger>
		<Select.Portal>
			<Select.Positioner class={styles.Positioner} sideOffset={4} alignItemWithTrigger={false}>
				<Select.Popup class={styles.Popup}>
					{#each values as value (value)}
						<Select.Item {value} class={styles.Item}>
							<Select.ItemIndicator class={styles.ItemIndicator}>
								{@render checkIcon()}
							</Select.ItemIndicator>
							<Select.ItemText class={styles.ItemText}>{languages[value]}</Select.ItemText>
						</Select.Item>
					{/each}
				</Select.Popup>
			</Select.Positioner>
		</Select.Portal>
	</Select.Root>
</div>

{#snippet caretUpDownIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block">
		<path d="M11 10H5l3 3.5zm0-4H5l3-3.5z" />
	</svg>
{/snippet}

{#snippet checkIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		style="display: block"
	>
		<path d="m2.5 8.5 4 4 7-9" />
	</svg>
{/snippet}
