<script lang="ts">
	import { Select } from '@sveltery/base/select';
	import { Toggle } from '@sveltery/base/toggle';
	import { ToggleGroup } from '@sveltery/base/toggle-group';
	import { Toolbar } from '@sveltery/base/toolbar';
	import styles from './index.module.css';
</script>

{#snippet check()}
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

<Toolbar.Root class={styles.Toolbar}>
	<ToggleGroup class={styles.Group} aria-label="Alignment">
		<Toolbar.Button aria-label="Align left" value="align-left" class={styles.Button}>
			{#snippet render(props, _state, children)}
				<Toggle {...props}>{@render children?.()}</Toggle>
			{/snippet}
			Align Left
		</Toolbar.Button>
		<Toolbar.Button aria-label="Align right" value="align-right" class={styles.Button}>
			{#snippet render(props, _state, children)}
				<Toggle {...props}>{@render children?.()}</Toggle>
			{/snippet}
			Align Right
		</Toolbar.Button>
	</ToggleGroup>
	<Toolbar.Separator class={styles.Separator} />
	<Toolbar.Group class={styles.Group} aria-label="Numerical format">
		<Toolbar.Button class={styles.Button} aria-label="Format as currency">$</Toolbar.Button>
		<Toolbar.Button class={styles.Button} aria-label="Format as percent">%</Toolbar.Button>
	</Toolbar.Group>
	<Toolbar.Separator class={styles.Separator} />
	<Select.Root defaultValue="Helvetica">
		<Toolbar.Button class={styles.Button}>
			{#snippet render(props, _state, children)}
				<Select.Trigger {...props}>{@render children?.()}</Select.Trigger>
			{/snippet}
			<Select.Value />
			<Select.Icon>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block">
					<path d="M11 10H5l3 3.5zm0-4H5l3-3.5z" />
				</svg>
			</Select.Icon>
		</Toolbar.Button>
		<Select.Portal>
			<Select.Positioner class={styles.Positioner} sideOffset={4} alignItemWithTrigger={false}>
				<Select.Popup class={styles.Popup}>
					<Select.Item class={styles.Item} value="Helvetica">
						<Select.ItemIndicator class={styles.ItemIndicator}>
							{@render check()}
						</Select.ItemIndicator>
						<Select.ItemText class={styles.ItemText}>Helvetica</Select.ItemText>
					</Select.Item>
					<Select.Item class={styles.Item} value="Arial">
						<Select.ItemIndicator class={styles.ItemIndicator}>
							{@render check()}
						</Select.ItemIndicator>
						<Select.ItemText class={styles.ItemText}>Arial</Select.ItemText>
					</Select.Item>
				</Select.Popup>
			</Select.Positioner>
		</Select.Portal>
	</Select.Root>
	<Toolbar.Separator class={styles.Separator} />
	<Toolbar.Link class={styles.Link} href="#">Edited 51m ago</Toolbar.Link>
</Toolbar.Root>
