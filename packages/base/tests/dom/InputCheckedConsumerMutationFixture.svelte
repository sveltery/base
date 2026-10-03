<script lang="ts">
  import Input from '../../src/lib/input/Input.svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  let { initial, controlled, mode, observations, type = 'checkbox', native = false }: { initial: boolean; controlled: boolean; mode: string; observations: string[]; type?: 'checkbox' | 'radio'; native?: boolean } = $props();
  function consumer(event: MouseEvent) {
    const input = event.currentTarget as HTMLInputElement;
    observations.push(`consumer:${input.checked}`);
    if (mode === 'reset') input.form!.reset();
    else {
      input.checked = initial;
      if (mode === 'nested-input') input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
</script>
<form>{#if type === 'radio'}<input type="radio" name="choice" defaultChecked data-testid="sibling" />{/if}
  {#if native}
    <input {type} name={type === 'radio' ? 'choice' : undefined} data-testid="owned" value="token" {...(controlled ? { checked: initial } : { defaultChecked: initial }) as HTMLInputAttributes} onclick={consumer}
      oninput={(event) => observations.push(`value:${event.currentTarget.checked}`)} />
  {:else}
    <Input {type} name={type === 'radio' ? 'choice' : undefined} data-testid="owned" value="token" {...(controlled ? { checked: initial } : { defaultChecked: initial })} onclick={consumer}
      onValueChange={(_value, details) => observations.push(`value:${(details.event.target as HTMLInputElement).checked}`)} />
  {/if}
</form>
