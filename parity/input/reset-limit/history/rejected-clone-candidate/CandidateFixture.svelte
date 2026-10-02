<script>
  import Input from './InputCandidate.svelte';
  import { untrack } from '/workspace/base/packages/base/node_modules/svelte/src/index-client.js';
  let { native = false, move = 'out', stop = false, cancel = false, type = 'text', seed = 'seed', owner = 'owner', decision = 'reject', record = () => {} } = $props();
  const form = untrack(() => move === 'in' ? 'clone-second' : 'clone-first');
  let value = $state(untrack(() => owner)); let input;
  function resetHandler(event) {
    if (move === 'out') input.setAttribute('form', 'clone-second');
    if (move === 'in') input.setAttribute('form', 'clone-first');
    if (cancel) event.preventDefault(); if (stop) event.stopImmediatePropagation();
  }
  function changed(next) { record({ callback: next }); if (decision === 'accept') value = next; if (decision === 'rewrite') value = next.toUpperCase(); }
  function oninput(event) {
    input = event.currentTarget; input.ownerDocument.getElementById('clone-first').reset();
    if (move === 'after') input.setAttribute('form', 'clone-second');
    if (native) changed(input.value);
  }
</script>
{#snippet textarea(props)}<textarea {...props}></textarea>{/snippet}
<form id="clone-first" onreset={resetHandler}></form><form id="clone-second"></form>
{#if native}
  {#if type === 'textarea'}<textarea {form} {value} defaultValue={seed} {oninput}></textarea>
  {:else}<input {type} {form} {value} defaultValue={seed} {oninput} />{/if}
{:else}<Input {type} {form} {value} defaultValue={seed} {oninput} onValueChange={changed} render={type === 'textarea' ? textarea : undefined} />{/if}
