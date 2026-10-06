<script lang="ts">
  // Literal Svelte witness for live state/closure timing; no Base runtime imported.
  import { untrack } from 'svelte';
  let { scenario }: { scenario: string } = $props();
  let pressed = $state(false);
  let owners = $state<string[]>([]);
  let values = $state<boolean[]>([]);
  let switched = $state(false);
  const controlled = untrack(() => scenario.startsWith('controlled'));
  function change(next: boolean) {
    values = [...values, next];
    pressed = next;
  }
  function oldChange(next: boolean) {
    owners = [...owners, 'old'];
    change(next);
  }
  function newChange(next: boolean) {
    owners = [...owners, 'new'];
    change(next);
  }
  const callback = $derived(
    scenario.startsWith('callback') ? (switched ? newChange : oldChange) : change,
  );
</script>

<button
  id="literal-toggle"
  aria-pressed={pressed}
  onclick={() => {
    if (controlled) pressed = true;
    if (scenario.startsWith('callback')) switched = true;
    const nextPressed = !pressed;
    callback(nextPressed);
  }}>Literal Svelte toggle</button
>
<output id="literal-values">{JSON.stringify(values)}</output>
<output id="literal-owners">{JSON.stringify(owners)}</output>
