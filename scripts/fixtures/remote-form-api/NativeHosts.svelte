<script lang="ts">
  import { Form, Radio, RadioGroup, Switch } from '@sveltery/base';
  import { createAttachmentKey, type Attachment } from 'svelte/attachments';
  import type { RemoteForm } from '@sveltejs/kit';
  let { remote, host = 'span' }: {
    remote: RemoteForm<{ enabled: boolean; choice: string }, unknown>;
    host?: string;
  } = $props();
  const key = createAttachmentKey();
  const attachSpan: Attachment<HTMLSpanElement> = (node) => { node.dataset.consumer = 'span'; };
  const attachDiv: Attachment<HTMLDivElement> = (node) => { node.dataset.consumer = 'div'; };
  const attachHost: Attachment<HTMLElement> = (node) => { node.dataset.consumer = node.localName; };
  const hostAttachment = { [key]: attachHost };
</script>

<Switch.Root {...hostAttachment}>
  {#snippet render(native, state)}
    <span {...native} {...{ [key]: attachSpan }} data-checked={state.checked}></span>
  {/snippet}
</Switch.Root>
<RadioGroup defaultValue="a">
  <Radio.Root value="a" {...hostAttachment}>
    {#snippet render(native, state)}
      <div {...native} {...{ [key]: attachDiv }} data-checked={state.checked}></div>
    {/snippet}
  </Radio.Root>
</RadioGroup>

<Form {remote}>
  {#snippet children(Field)}
    <Field.Root name="enabled" as="checkbox">
      <Field.Control>
        {#snippet render(props)}
          <Switch.Root {...props}>
            {#snippet render(native, state)}
              {#if host === 'span'}
                <span {...native} {...{ [key]: attachSpan }} data-checked={state.checked}></span>
              {:else if host === 'div'}
                <div {...native} {...{ [key]: attachDiv }} data-checked={state.checked}></div>
              {:else}
                <svelte:element this={host} {...native} {...hostAttachment} data-checked={state.checked} />
              {/if}
            {/snippet}
          </Switch.Root>
        {/snippet}
      </Field.Control>
    </Field.Root>
    <Field.Root name="choice" as="radio" value="a">
      <RadioGroup>
        <Field.Control>
          {#snippet render(props)}
            <Radio.Root {...props} value={props.value}>
              {#snippet render(native, state)}
                {#if host === 'span'}
                  <span {...native} {...{ [key]: attachSpan }} data-checked={state.checked}></span>
                {:else if host === 'div'}
                  <div {...native} {...{ [key]: attachDiv }} data-checked={state.checked}></div>
                {:else}
                  <svelte:element this={host} {...native} {...hostAttachment} data-checked={state.checked} />
                {/if}
              {/snippet}
            </Radio.Root>
          {/snippet}
        </Field.Control>
      </RadioGroup>
    </Field.Root>
  {/snippet}
</Form>
