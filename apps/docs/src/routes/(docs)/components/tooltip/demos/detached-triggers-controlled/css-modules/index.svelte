<script lang="ts">
	import { Tooltip } from '@sveltery/base/tooltip';
	import styles from '../../index.module.css';

	const demoTooltip = Tooltip.createHandle();

	let open = $state(false);
	let triggerId = $state<string | null>(null);
</script>

{#snippet headphonesIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		aria-hidden="true"
		style="display: block"
	>
		<path stroke-linecap="round" d="M1.5 11V7.5c0-2.5 2.5-6 6.5-6s6.5 3.5 6.5 6V11" />
		<path
			d="M12 7.5c1.3807 0 2.5 1.11929 2.5 2.5v2c0 1.3807-1.1193 2.5-2.5 2.5h-1.5v-7zm-8 0h1.5v7H4c-1.38071 0-2.5-1.1193-2.5-2.5v-2c0-1.38071 1.11929-2.5 2.5-2.5Z"
		/>
	</svg>
{/snippet}

{#snippet stopwatchIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		aria-hidden="true"
		style="display: block"
	>
		<circle cx="8" cy="8.5" r="6" />
		<path
			stroke-linecap="square"
			stroke-linejoin="round"
			d="M8 9.5v-5m0-2v-2m-2 0h4M12 4l1.5-1.5"
		/>
	</svg>
{/snippet}

{#snippet trashIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-linejoin="round"
		aria-hidden="true"
		style="display: block"
	>
		<path stroke-linecap="square" d="M2.5 4h11" />
		<path stroke-linecap="round" d="M6.5 4V3c0-.82843.67157-1.5 1.5-1.5s1.5.67157 1.5 1.5v1" />
		<path
			stroke-linecap="square"
			d="m3.5 4 .87069 9.1422c.07332.7699.7199 1.3578 1.49324 1.3578h4.27217c.7733 0 1.4199-.5879 1.4932-1.3578L12.5 4"
		/>
	</svg>
{/snippet}

<Tooltip.Provider>
	<div class={styles.Container}>
		<div class={styles.ButtonGroup}>
			<Tooltip.Trigger
				class={styles.IconButton}
				handle={demoTooltip}
				id="trigger-1"
				aria-label="Trigger 1"
			>
				{@render headphonesIcon()}
			</Tooltip.Trigger>

			<Tooltip.Trigger
				class={styles.IconButton}
				handle={demoTooltip}
				id="trigger-2"
				aria-label="Trigger 2"
			>
				{@render stopwatchIcon()}
			</Tooltip.Trigger>

			<Tooltip.Trigger
				class={styles.IconButton}
				handle={demoTooltip}
				id="trigger-3"
				aria-label="Trigger 3"
			>
				{@render trashIcon()}
			</Tooltip.Trigger>
		</div>

		<button
			type="button"
			class={styles.Button}
			onclick={() => {
				triggerId = 'trigger-2';
				open = true;
			}}
		>
			Open programmatically
		</button>
	</div>

	<Tooltip.Root handle={demoTooltip} bind:open bind:triggerId>
		<Tooltip.Portal>
			<Tooltip.Positioner class={styles.Positioner} sideOffset={11}>
				<Tooltip.Popup class={styles.Popup}>
					<Tooltip.Arrow class={styles.Arrow} />
					Controlled tooltip
				</Tooltip.Popup>
			</Tooltip.Positioner>
		</Tooltip.Portal>
	</Tooltip.Root>
</Tooltip.Provider>
