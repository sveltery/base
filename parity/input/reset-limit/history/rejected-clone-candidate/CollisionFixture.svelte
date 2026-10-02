<script>
  import Current from '/workspace/base/packages/base/src/lib/input/Input.svelte';
  import Candidate from './InputCandidate.svelte';
  let { kind = 'native', move = 'out', collision = true } = $props();
  let input;
  function reset(event) { if (move === 'out') input.setAttribute('form', 'collision-second'); event.stopImmediatePropagation(); }
  function oninput(event) {
    input = event.currentTarget; input.ownerDocument.getElementById('collision-first').reset();
    if (move === 'after') input.setAttribute('form', 'collision-second');
    input.value = input.value;
  }
</script>
<form id="collision-first" onreset={reset}></form><form id="collision-second"></form>
{#if kind === 'native'}<input form="collision-first" value="owner" defaultValue={collision ? 'edit' : 'seed'} {oninput} />
{:else if kind === 'current'}<Current form="collision-first" value="owner" defaultValue={collision ? 'edit' : 'seed'} {oninput} />
{:else}<Candidate form="collision-first" value="owner" defaultValue={collision ? 'edit' : 'seed'} {oninput} />{/if}
