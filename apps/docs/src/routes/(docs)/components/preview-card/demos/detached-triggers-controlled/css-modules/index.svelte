<script lang="ts">
	import type { Snippet } from 'svelte';
	import { PreviewCard } from '@sveltery/base/preview-card';
	import styles from '../../index.module.css';

	const demoPreviewCard = PreviewCard.createHandle<Snippet>();

	let open = $state(false);
	let triggerId = $state<string | null>(null);
</script>

{#snippet typography()}
	<div class={styles.PopupContent}>
		<img
			width="224"
			height="150"
			class={styles.Image}
			src="https://images.unsplash.com/photo-1619615391095-dfa29e1672ef?q=80&w=448&h=300"
			alt="Station Hofplein signage in Rotterdam, Netherlands"
		/>
		<p class={styles.Summary}>
			<strong>Typography</strong> is the art and science of arranging type.
		</p>
	</div>
{/snippet}

{#snippet design()}
	<div class={styles.PopupContent}>
		<img
			width="241"
			height="240"
			class={styles.Image}
			src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Braun_ABW30_%28schwarz%29.jpg/250px-Braun_ABW30_%28schwarz%29.jpg"
			alt="Braun ABW30"
		/>
		<p class={styles.Summary}>
			A <strong>design</strong> is the concept or proposal for an object, process, or system.
		</p>
	</div>
{/snippet}

{#snippet art()}
	<div class={styles.PopupContent}>
		<img
			width="206"
			height="240"
			class={styles.Image}
			src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/MonaLisa_sfumato.jpeg/250px-MonaLisa_sfumato.jpeg"
			alt="Mona Lisa"
		/>
		<p class={styles.Summary}>
			<strong>Art</strong> is a diverse range of cultural activity centered around works utilizing creative
			or imaginative talents, which are expected to evoke a worthwhile experience, generally through an
			expression of emotional power, conceptual ideas, technical proficiency, or beauty.
		</p>
	</div>
{/snippet}

<div>
	<div class={styles.Container}>
		<p class={styles.Paragraph}>
			Discover
			<PreviewCard.Trigger
				class={styles.Link}
				handle={demoPreviewCard}
				href="https://en.wikipedia.org/wiki/Typography"
				id="trigger-1"
				payload={typography}
			>
				typography
			</PreviewCard.Trigger>,
			<PreviewCard.Trigger
				class={styles.Link}
				handle={demoPreviewCard}
				href="https://en.wikipedia.org/wiki/Industrial_design"
				id="trigger-2"
				payload={design}
			>
				design
			</PreviewCard.Trigger>, or
			<PreviewCard.Trigger
				class={styles.Link}
				handle={demoPreviewCard}
				href="https://en.wikipedia.org/wiki/Art"
				id="trigger-3"
				payload={art}
			>
				art
			</PreviewCard.Trigger>.
		</p>
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

	<PreviewCard.Root handle={demoPreviewCard} bind:open bind:triggerId>
		{#snippet children({ payload })}
			<PreviewCard.Portal>
				<PreviewCard.Positioner sideOffset={8} class={styles.Positioner}>
					<PreviewCard.Popup class={styles.Popup}>
						<PreviewCard.Arrow class={styles.Arrow} />
						{@render (payload as Snippet | undefined)?.()}
					</PreviewCard.Popup>
				</PreviewCard.Positioner>
			</PreviewCard.Portal>
		{/snippet}
	</PreviewCard.Root>
</div>
