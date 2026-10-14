<!--
	Spec harness for the Combobox port of Base UI v1.9.0
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { Combobox, Dialog } from '#lib';
</script>

<button type="button" data-testid="outside">Outside</button>
<Combobox.Root items={['Apple', 'Banana']}>
	<Combobox.Input aria-label="Fruit" />
	<Combobox.Portal>
		<Combobox.Positioner>
			<Combobox.Popup>
				<Combobox.List>
					<Combobox.Collection>
						{#snippet children(item: string)}
							<Combobox.Item value={item}>{item}</Combobox.Item>
						{/snippet}
					</Combobox.Collection>
				</Combobox.List>
				<Dialog.Root>
					<Dialog.Trigger>Details</Dialog.Trigger>
					<Dialog.Portal>
						<Dialog.Popup aria-label="Fruit details">
							<Dialog.Close>Done</Dialog.Close>
						</Dialog.Popup>
					</Dialog.Portal>
				</Dialog.Root>
			</Combobox.Popup>
		</Combobox.Positioner>
	</Combobox.Portal>
</Combobox.Root>
