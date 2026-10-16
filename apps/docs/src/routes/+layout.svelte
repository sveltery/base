<script lang="ts">
	import '../app.css';
	import Header from '#lib/components/Header.svelte';
	import Sidebar from '#lib/components/Sidebar.svelte';
	import { MAIN_CONTENT_ID } from '#lib/components/SkipNav.svelte';

	let { data, children } = $props();
</script>

<div class="RootLayout">
	<div class="RootLayoutContainer">
		<div class="RootLayoutContent">
			<div class="ContentLayoutRoot">
				<Header nav={data.nav} />
				<Sidebar nav={data.nav} />
				<main class="ContentLayoutMain" id={MAIN_CONTENT_ID}>
					<div class="QuickNavContainer">
						{@render children()}
					</div>
				</main>
			</div>
		</div>
	</div>
</div>

<style>
	.RootLayout {
		z-index: 0;
		position: relative;
		padding-inline: var(--root-layout-padding-x);
	}

	.RootLayoutContainer {
		position: relative;
		display: flex;
		flex-direction: column;
		margin-inline: auto;
		min-height: 100dvh;
		max-width: calc(var(--breakpoint-max-layout-width) - var(--root-layout-padding-x) * 2);

		@media (width >= 64rem) {
			padding-top: var(--header-height);
		}
	}

	.RootLayoutContent {
		display: flex;
		flex-grow: 1;
		flex-direction: column;
		background-color: var(--color-content);
	}

	.ContentLayoutRoot {
		display: grid;
		align-items: start;
		padding-top: var(--header-height);
		padding-inline: var(--content-layout-padding-x);
		grid-template-columns: 1fr;

		@media (width >= 64rem) {
			padding-top: 0;
			grid-template-columns: var(--sidebar-width) 1fr 3rem;
		}

		@media (width >= 84rem) {
			grid-template-columns: var(--sidebar-width) 1fr var(--sidebar-width);
		}
	}

	.ContentLayoutMain {
		min-width: 0;
		max-width: 48rem;
		width: 100%;
		margin: 0 auto;

		@media (width >= 64rem) {
			margin: 0;
			grid-column: 2;
		}
	}

	.QuickNavContainer {
		padding: 0;
		position: relative;
	}
</style>
