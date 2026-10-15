<script module lang="ts">
	customElements.define(
		'shadow-scroller',
		class extends HTMLElement {
			constructor() {
				super();
				this.attachShadow({ mode: 'open' }).innerHTML =
					'<div style="display:flex;overflow-x:auto;width:200px"><slot></slot></div>';
			}
		}
	);
</script>

<script lang="ts">
	import { Tabs } from '#lib';

	let { value = $bindable('a') }: { value?: string } = $props();
	const tabStyle = 'flex:none;width:150px;height:20px;margin:0;padding:0;border:0';
</script>

<Tabs.Root bind:value>
	<Tabs.List style="position:relative;width:300px">
		<shadow-scroller>
			<Tabs.Tab value="a" style={tabStyle}>A</Tabs.Tab>
			<Tabs.Tab value="b" style={tabStyle}>B</Tabs.Tab>
		</shadow-scroller>
		<Tabs.Indicator data-testid="indicator" />
	</Tabs.List>
</Tabs.Root>
