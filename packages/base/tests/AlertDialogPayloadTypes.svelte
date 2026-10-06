<script lang="ts">
  // AlertDialogRoot.spec.tsx at immutable 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT.
  import { AlertDialog } from '../src/lib/alert-dialog/index.js';
  import { expectType } from './expect-type.js';
  const numberPayloadHandle = AlertDialog.createHandle<number>();
  let triggerRef = $state<HTMLElement | null>(null);
</script>

<AlertDialog.Root handle={numberPayloadHandle}><AlertDialog.Portal /></AlertDialog.Root>
<AlertDialog.Root handle={numberPayloadHandle}>
  {#snippet children({ payload })}
    {expectType<number | undefined, typeof payload>(payload) ?? ''}
  {/snippet}
</AlertDialog.Root>
<AlertDialog.Trigger handle={numberPayloadHandle} payload={42} bind:ref={triggerRef} />
<AlertDialog.Trigger handle={numberPayloadHandle} />
