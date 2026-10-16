<script lang="ts">
	import { svelteryMark } from './Icons.svelte';
</script>

<a href="/" class="LogoLink" aria-label="Go to the homepage">
	{@render svelteryMark(24)}
</a>

<style>
	.LogoLink {
		display: flex;
		padding: 0.25rem 0.5rem;
		margin: -0.25rem -0.5rem;

		&:active {
			color: var(--gray-p1);
		}

		&:focus-visible {
			border-radius: var(--radius-6);
			outline: 2px solid var(--gray-t2);
			outline-offset: -1px;
		}
	}
</style>
