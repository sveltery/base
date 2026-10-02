<script>
  import Input from '/workspace/base/packages/base/src/lib/input/Input.svelte';
  import { onMount, untrack } from '/workspace/base/packages/base/node_modules/svelte/src/index-client.js';
  let { native = false, move = 'out', stop = false, cancel = false, record = () => {} } = $props();
  const form = untrack(() => move === 'in' ? 'imperative-second' : 'imperative-first');
  let input; let lastReset;
  onMount(() => {
    const observer = new MutationObserver(records => {
      for (const mutation of records) if (mutation.target === input) snapshot('mutation:form', lastReset, mutation.oldValue);
    });
    observer.observe(document, { subtree: true, attributes: true, attributeFilter: ['form'], attributeOldValue: true });
    return () => observer.disconnect();
  });
  function snapshot(stage, event, oldForm) { record({ stage, value: input.value, form: input.form?.id ?? null, ...(event ? { eventPhase: event.eventPhase, defaultPrevented: event.defaultPrevented } : {}), ...(oldForm === undefined ? {} : { oldForm }) }); }
  function resetHandler(event) {
    lastReset = event;
    snapshot('reset:handler-before', event);
    if (move === 'out') input.setAttribute('form', 'imperative-second');
    if (move === 'in') input.setAttribute('form', 'imperative-first');
    if (cancel) event.preventDefault();
    if (stop) event.stopImmediatePropagation();
    snapshot('reset:handler-after', event);
  }
  function oninput(event) {
    input = event.currentTarget; snapshot('input:before-reset');
    input.ownerDocument.getElementById('imperative-first').reset(); snapshot('input:reset-return');
    if (move === 'after') input.setAttribute('form', 'imperative-second');
    snapshot('input:after-reassociation');
  }
</script>
<form id="imperative-first" onreset={resetHandler}></form><form id="imperative-second"></form>
{#if native}<input {form} value="owner" defaultValue="seed" {oninput} />
{:else}<Input {form} value="owner" defaultValue="seed" {oninput} />{/if}
