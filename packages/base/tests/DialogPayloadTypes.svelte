<script lang="ts">
  // DialogRoot.spec.tsx at immutable47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT.
  import * as Dialog from '../src/lib/dialog/index.js';
  import { createDialogHandle } from '../src/lib/dialog/handle.svelte.js';
  import { expectType } from './expect-type.js';
  const numberPayloadHandle = createDialogHandle<number>();
</script>
<Dialog.Root handle={numberPayloadHandle}><Dialog.Portal/></Dialog.Root>
<Dialog.Root handle={numberPayloadHandle}>
  {#snippet children({ payload })}
    {expectType<number | undefined, typeof payload>(payload) ?? ''}
  {/snippet}
</Dialog.Root>
<Dialog.Trigger handle={numberPayloadHandle} payload={42}/>
<Dialog.Trigger handle={numberPayloadHandle}/>
