<script lang="ts">
  import { untrack } from 'svelte';
  import Input from '../../src/lib/input/Input.svelte';

  let {
    native = false,
    move,
    stop,
    cancel,
  }: {
    native?: boolean;
    move: 'out' | 'in' | 'after';
    stop: false | true | 'propagation';
    cancel: boolean;
  } = $props();
  const form = untrack(() => move === 'in' ? 'second' : 'first');
  let firstForm: HTMLFormElement;
  let currentInput: HTMLInputElement;

  const associate = (next: string) => currentInput.setAttribute('form', next);
  const onreset = (event: Event) => {
    if (move === 'out') associate('second');
    if (move === 'in') associate('first');
    if (cancel) event.preventDefault();
    if (stop === 'propagation') event.stopPropagation();
    else if (stop) event.stopImmediatePropagation();
  };
  const oninput = (event: Event) => {
    currentInput = event.currentTarget as HTMLInputElement;
    firstForm.reset();
    if (move === 'after') associate('second');
  };
</script>

<form id="first" bind:this={firstForm} {onreset}></form>
<form id="second"></form>
{#if native}
  <input {form} value="owner" defaultValue="seed" {oninput} />
{:else}
  <Input {form} value="owner" defaultValue="seed" {oninput} />
{/if}
