<script lang="ts">
	import { Select } from '@sveltery/base/select';
	import type { Attachment } from 'svelte/attachments';
	import styles from './index.module.css';

	const fonts = [
		{ label: 'Select font', value: null },
		{ label: 'Sans-serif', value: 'sans' },
		{ label: 'Serif', value: 'serif' },
		{ label: 'Monospace', value: 'mono' },
		{ label: 'Cursive', value: 'cursive' }
	];

	function animateOpen(open: boolean): Attachment<HTMLElement> {
		return (element) => {
			// A popup that mounts open has no earlier animation, so it starts from the closed values.
			const mountedOpen = open && element.getAnimations().length === 0;
			const { opacity, scale } = mountedOpen
				? { opacity: '0', scale: '0.8' }
				: getComputedStyle(element);
			element.animate(
				[
					{ opacity, scale },
					{ opacity: open ? 1 : 0, scale: open ? 1 : 0.8 }
				],
				{ duration: 200, easing: 'ease-out', fill: 'forwards' }
			);
		};
	}
</script>

<Select.Root items={fonts}>
	<Select.Trigger class={styles.Select}>
		<Select.Value class={styles.Value} />
		<Select.Icon>
			<svg
				width="16"
				height="16"
				viewBox="0 0 16 16"
				fill="currentColor"
				aria-hidden="true"
				style="display: block"
			>
				<path d="M11 10H5l3 3.5zm0-4H5l3-3.5z" />
			</svg>
		</Select.Icon>
	</Select.Trigger>
	<Select.Portal>
		<Select.Positioner class={styles.Positioner} sideOffset={4}>
			<Select.Popup class={styles.Popup}>
				{#snippet render(props, state, children)}
					<div {...props} {@attach animateOpen(state.open)}>
						{@render children?.()}
					</div>
				{/snippet}
				<Select.ScrollUpArrow class={styles.ScrollArrow} />
				<Select.List class={styles.List}>
					{#each fonts as { label, value } (label)}
						<Select.Item {value} class={styles.Item}>
							<Select.ItemIndicator class={styles.ItemIndicator}>
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="none"
									stroke="currentColor"
									aria-hidden="true"
									style="display: block"
								>
									<path d="m2.5 8.5 4 4 7-9" />
								</svg>
							</Select.ItemIndicator>
							<Select.ItemText class={styles.ItemText}>{label}</Select.ItemText>
						</Select.Item>
					{/each}
				</Select.List>
				<Select.ScrollDownArrow class={styles.ScrollArrow} />
			</Select.Popup>
		</Select.Positioner>
	</Select.Portal>
</Select.Root>
