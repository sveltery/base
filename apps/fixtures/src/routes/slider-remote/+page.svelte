<script lang="ts">
  import { onMount } from 'svelte';
  import { Form, Slider, Fieldset } from '@sveltery/base';
  import { volumeForm } from './slider.remote.js';
  import type { HTMLAttributes } from 'svelte/elements';
  let hydrated = $state(false),
    cancel = $state(false),
    fieldsetDisabled = $state(false);
  let changes = $state<unknown[]>([]),
    enhancements = $state<string[]>([]);
  onMount(() => {
    hydrated = true;
  });
</script>

<main data-hydrated={hydrated}>
  <Form
    remote={volumeForm}
    id="remote-slider-form"
    {...volumeForm.enhance(async ({ submit }) => {
      enhancements.push('caller');
      await submit();
      enhancements.push('settled');
    })}
  >
    {#snippet children(Field)}
      <Fieldset.Root disabled={fieldsetDisabled}>
        <Fieldset.Legend>Volume settings</Fieldset.Legend>
        <Field.Root
          name="settings.volume"
          as="range"
          value={40}
          validate={(value) => (Number(value) < 50 ? 'Too low' : null)}
        >
          <Field.Label>Remote volume</Field.Label>
          <Slider.Root
            id="remote-slider"
            value={volumeForm.fields.settings.volume.value() ?? 40}
            name="authored-fallback"
            onValueChange={(value, details) => {
              changes.push({
                value,
                name: (details.event.target as unknown as { name: string }).name,
              });
              if (cancel) details.cancel();
              if (!details.isCanceled) volumeForm.fields.settings.volume.set(value);
            }}
          >
            {#snippet render(props, _state, children)}<section
                {...props as HTMLAttributes<HTMLElement>}
              >
                {@render children?.()}
              </section>{/snippet}
            <Slider.Control
              style="position:relative;width:300px;height:20px;margin:30px;touch-action:none"
              ><Slider.Track style="height:20px;width:300px;background:lightgray"
                ><Slider.Indicator /></Slider.Track
              ><Slider.Thumb style="width:20px;height:20px;background:blue" /></Slider.Control
            ><Slider.Value id="remote-slider-value" />
          </Slider.Root>
          <Field.Error id="remote-slider-error" />
        </Field.Root>
      </Fieldset.Root>
      <button type="submit" id="remote-slider-submit">Submit</button>
    {/snippet}
  </Form>
  <button
    id="remote-slider-disabled"
    onclick={() => {
      fieldsetDisabled = !fieldsetDisabled;
    }}>Toggle fieldset</button
  >
  <button id="remote-slider-set" onclick={() => volumeForm.fields.settings.volume.set(70)}
    >Set owner</button
  >
  <button
    id="remote-slider-cancel"
    onclick={() => {
      cancel = !cancel;
    }}>Cancel</button
  >
  <output id="remote-slider-owner">{JSON.stringify(volumeForm.fields.value())}</output>
  <output id="remote-slider-result">{JSON.stringify(volumeForm.result ?? null)}</output>
  <output id="remote-slider-changes">{JSON.stringify(changes)}</output>
  <output id="remote-slider-enhancement">{JSON.stringify(enhancements)}</output>
</main>
