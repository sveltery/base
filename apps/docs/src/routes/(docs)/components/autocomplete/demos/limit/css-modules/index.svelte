<script lang="ts">
	import { Autocomplete } from '@sveltery/base/autocomplete';
	import styles from './index.module.css';

	const limit = 8;

	interface Tag {
		id: string;
		value: string;
	}

	const tags: Tag[] = [
		{ id: 't1', value: 'feature' },
		{ id: 't2', value: 'fix' },
		{ id: 't3', value: 'bug' },
		{ id: 't4', value: 'docs' },
		{ id: 't5', value: 'internal' },
		{ id: 't6', value: 'mobile' },
		{ id: 't7', value: 'frontend' },
		{ id: 't8', value: 'backend' },
		{ id: 't9', value: 'performance' },
		{ id: 't10', value: 'accessibility' },
		{ id: 't11', value: 'design' },
		{ id: 't12', value: 'research' },
		{ id: 't13', value: 'testing' },
		{ id: 't14', value: 'infrastructure' },
		{ id: 't15', value: 'documentation' },
		{ id: 'c-accordion', value: 'component: accordion' },
		{ id: 'c-alert-dialog', value: 'component: alert dialog' },
		{ id: 'c-autocomplete', value: 'component: autocomplete' },
		{ id: 'c-avatar', value: 'component: avatar' },
		{ id: 'c-checkbox', value: 'component: checkbox' },
		{ id: 'c-checkbox-group', value: 'component: checkbox group' },
		{ id: 'c-collapsible', value: 'component: collapsible' },
		{ id: 'c-combobox', value: 'component: combobox' },
		{ id: 'c-context-menu', value: 'component: context menu' },
		{ id: 'c-dialog', value: 'component: dialog' },
		{ id: 'c-field', value: 'component: field' },
		{ id: 'c-fieldset', value: 'component: fieldset' },
		{ id: 'c-filterable-menu', value: 'component: filterable menu' },
		{ id: 'c-form', value: 'component: form' },
		{ id: 'c-input', value: 'component: input' },
		{ id: 'c-menu', value: 'component: menu' },
		{ id: 'c-menubar', value: 'component: menubar' },
		{ id: 'c-meter', value: 'component: meter' },
		{ id: 'c-navigation-menu', value: 'component: navigation menu' },
		{ id: 'c-number-field', value: 'component: number field' },
		{ id: 'c-popover', value: 'component: popover' },
		{ id: 'c-preview-card', value: 'component: preview card' },
		{ id: 'c-progress', value: 'component: progress' },
		{ id: 'c-radio', value: 'component: radio' },
		{ id: 'c-scroll-area', value: 'component: scroll area' },
		{ id: 'c-select', value: 'component: select' },
		{ id: 'c-separator', value: 'component: separator' },
		{ id: 'c-slider', value: 'component: slider' },
		{ id: 'c-switch', value: 'component: switch' },
		{ id: 'c-tabs', value: 'component: tabs' },
		{ id: 'c-toast', value: 'component: toast' },
		{ id: 'c-toggle', value: 'component: toggle' },
		{ id: 'c-toggle-group', value: 'component: toggle group' },
		{ id: 'c-toolbar', value: 'component: toolbar' },
		{ id: 'c-tooltip', value: 'component: tooltip' }
	];

	let value = $state('');

	const { contains } = Autocomplete.useFilter({ sensitivity: 'base' });

	const totalMatches = $derived.by(() => {
		const trimmed = value.trim();
		if (!trimmed) {
			return tags.length;
		}
		return tags.filter((t) => contains(t.value, trimmed)).length;
	});

	const moreCount = $derived(Math.max(0, totalMatches - limit));
</script>

<Autocomplete.Root items={tags} bind:value {limit}>
	<label class={styles.Label}>
		Limit results to 8
		<Autocomplete.Input placeholder="e.g. component" class={styles.Input} />
	</label>

	<Autocomplete.Portal>
		<Autocomplete.Positioner class={styles.Positioner} sideOffset={4}>
			<Autocomplete.Popup class={styles.Popup}>
				<Autocomplete.Empty>
					<div class={styles.Empty}>No results found for "{value}"</div>
				</Autocomplete.Empty>

				<Autocomplete.List>
					<Autocomplete.Collection>
						{#snippet children(tag: Tag)}
							<Autocomplete.Item value={tag} class={styles.Item}>
								{tag.value}
							</Autocomplete.Item>
						{/snippet}
					</Autocomplete.Collection>
				</Autocomplete.List>

				<Autocomplete.Status>
					{#if moreCount > 0}
						<div class={styles.Status}>
							{`Hiding ${moreCount} results (type a more specific query to narrow results)`}
						</div>
					{/if}
				</Autocomplete.Status>
			</Autocomplete.Popup>
		</Autocomplete.Positioner>
	</Autocomplete.Portal>
</Autocomplete.Root>
