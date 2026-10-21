<script lang="ts">
	import { Checkbox, Radio, RadioGroup, Switch } from '#lib';

	let { part }: { part: 'checkbox' | 'switch' | 'radio' } = $props();

	const style = 'display: inline-block; width: 16px; height: 16px; margin: 24px';
</script>

{#if part === 'checkbox'}
	<Checkbox.Root aria-label="Control" class="hit-area" {style} />
{:else if part === 'switch'}
	<Switch.Root aria-label="Control" class="hit-area" {style} />
{:else}
	<RadioGroup aria-label="Group">
		<Radio.Root value="a" aria-label="Control" class="hit-area" {style} />
	</RadioGroup>
{/if}

<style>
	/* An enlarged hit area drawn on the box, as shadcn draws it. */
	:global(.hit-area::after) {
		content: '';
		position: absolute;
		inset: -8px;
	}
</style>
