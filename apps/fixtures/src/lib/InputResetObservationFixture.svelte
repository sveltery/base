<script lang="ts">
  // Native Svelte reset comparators; supplemental evidence, no upstream declaration credit.
  import { flushSync, onMount, untrack } from 'svelte';
  import { createAttachmentKey } from 'svelte/attachments';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { Input } from '@sveltery/base/input';
  import { mergeProps } from '@sveltery/base/merge-props';
  let { native = false, scenario = 'reassociation', canceled = false, sibling = false }: { native?: boolean; scenario?: string; canceled?: boolean; sibling?: boolean } = $props();
  let form = $state(untrack(() => scenario.startsWith('reassociation-into-reset') ? 'reset-second' : 'reset-first')); let hydrated = $state(false);
  const attachmentKey = createAttachmentKey();
  const renderAttachmentKey = createAttachmentKey();
  const attachmentScenario = $derived(scenario.startsWith('attachment-') || scenario.startsWith('render-attachment-'));
  function consumerAttachment(node: HTMLInputElement) {
    const listener = () => node.form?.reset(); const capture = scenario.includes('capture');
    node.addEventListener('input', listener, capture); return () => node.removeEventListener('input', listener, capture);
  }
  onMount(() => { hydrated = true; });
  function reset(event: Event & { currentTarget: HTMLInputElement }) {
    if (attachmentScenario) return;
    if (scenario === 'reassociation' || scenario === 'unrelated-old') { form = 'reset-second'; flushSync(); }
    const resetForm = scenario === 'unrelated-old' || scenario.startsWith('reassociation-into-reset') ? event.currentTarget.ownerDocument.getElementById('reset-first') as HTMLFormElement : event.currentTarget.form;
    resetForm?.reset();
    if (scenario.startsWith('reassociation-after-reset')) { form = 'reset-second'; flushSync(); }
  }
  function observeReset(event: Event) {
    if (canceled) event.preventDefault();
    if (scenario.startsWith('reassociation-during-reset')) { form = 'reset-second'; flushSync(); }
    if (scenario.startsWith('reassociation-into-reset')) { form = 'reset-first'; flushSync(); }
    if (scenario === 'stop-immediate' || scenario.endsWith('-stop')) event.stopImmediatePropagation();
  }
</script>
{#snippet replacement(props: Record<string | symbol, unknown>)}<input {...mergeProps(props, { 'data-merged': 'true' }) as HTMLInputAttributes} />{/snippet}
{#snippet precedingAttachment(props: Record<string | symbol, unknown>)}<input {...{ [renderAttachmentKey]: consumerAttachment, ...props } as HTMLInputAttributes} />{/snippet}
<main data-hydrated={hydrated}>
  <form id="reset-first" onreset={observeReset}></form>
  <form id="reset-second" onreset={observeReset}></form>
  {#if native}<input {form} value="owner" defaultValue="seed" oninput={reset} {...(attachmentScenario ? { [attachmentKey]: consumerAttachment } : {})} data-testid="reset-input" />
  {:else}<Input {form} value="owner" defaultValue="seed" oninput={reset} {...(scenario.startsWith('attachment-') ? { [attachmentKey]: consumerAttachment } : {})} render={scenario.startsWith('render-attachment-') ? precedingAttachment : scenario.endsWith('-replacement') ? replacement : undefined} data-testid="reset-input" />{/if}
  {#if sibling}<Input form="reset-second" value="other-owner" defaultValue="other-seed" data-testid="reset-sibling" />{/if}
</main>
