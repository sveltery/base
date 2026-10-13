<!--
	Type checks only: `pnpm check` (svelte-check) fails when a payload type is wrong. Nothing renders this.
	Follows Base UI v1.9.0 packages/react/src/dialog/root/DialogRoot.spec.tsx,
	alert-dialog/root/AlertDialogRoot.spec.tsx and popover/root/PopoverRoot.spec.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { expectTypeOf } from 'vitest';
	import { AlertDialog, Dialog, Popover } from '#lib';

	const dialogHandle = Dialog.createHandle<{ id: number }>();
	const alertDialogHandle = AlertDialog.createHandle<number>();
	const popoverHandle = Popover.createHandle<number>();
</script>

{#snippet stringPayload({ payload }: { payload: string | undefined })}
	{payload}
{/snippet}

<Dialog.Root handle={dialogHandle}>
	<Dialog.Portal />
</Dialog.Root>

<Dialog.Root handle={dialogHandle}>
	{#snippet children({ payload })}
		{expectTypeOf(payload).toEqualTypeOf<{ id: number } | undefined>()}
	{/snippet}
</Dialog.Root>

<Dialog.Root
	children={stringPayload}
	// @ts-expect-error The snippet expects another payload than the handle carries.
	handle={dialogHandle}
/>

<Dialog.Trigger handle={dialogHandle} payload={{ id: 42 }} />
<Dialog.Trigger handle={dialogHandle} />
<Dialog.Trigger
	handle={dialogHandle}
	// @ts-expect-error The payload does not match the handle.
	payload="invalid"
/>

<AlertDialog.Root handle={alertDialogHandle}>
	<AlertDialog.Portal />
</AlertDialog.Root>

<AlertDialog.Root handle={alertDialogHandle}>
	{#snippet children({ payload })}
		{expectTypeOf(payload).toEqualTypeOf<number | undefined>()}
	{/snippet}
</AlertDialog.Root>

<AlertDialog.Root
	children={stringPayload}
	// @ts-expect-error The snippet expects another payload than the handle carries.
	handle={alertDialogHandle}
/>

<AlertDialog.Trigger handle={alertDialogHandle} payload={42} />
<AlertDialog.Trigger handle={alertDialogHandle} />
<AlertDialog.Trigger
	handle={alertDialogHandle}
	// @ts-expect-error The payload does not match the handle.
	payload="invalid"
/>

<AlertDialog.Root
	// @ts-expect-error Dialog handles cannot be used for alert dialogs.
	handle={Dialog.createHandle<number>()}
/>
<AlertDialog.Trigger
	// @ts-expect-error Dialog handles cannot be used for alert dialog triggers.
	handle={Dialog.createHandle<number>()}
/>

<Popover.Root handle={popoverHandle}>
	<Popover.Portal />
</Popover.Root>

<Popover.Root handle={popoverHandle}>
	{#snippet children({ payload })}
		{expectTypeOf(payload).toEqualTypeOf<number | undefined>()}
	{/snippet}
</Popover.Root>

<Popover.Root
	children={stringPayload}
	// @ts-expect-error The snippet expects another payload than the handle carries.
	handle={popoverHandle}
/>

<Popover.Trigger handle={popoverHandle} payload={42} />
<Popover.Trigger handle={popoverHandle} />
<Popover.Trigger
	handle={popoverHandle}
	// @ts-expect-error The payload does not match the handle.
	payload="invalid"
/>
