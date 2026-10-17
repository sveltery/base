<script lang="ts">
	import { Dialog } from '@sveltery/base/dialog';
	import { Field } from '@sveltery/base/field';
	import { Fieldset } from '@sveltery/base/fieldset';
	import styles from './index.module.css';

	let initialFocusEl = $state<HTMLInputElement | null>(null);
	let finalFocusEl = $state<HTMLButtonElement | null>(null);
</script>

<div class={styles.Container}>
	<Dialog.Root>
		<Dialog.Trigger class={styles.Button}>Open feedback</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Backdrop class={styles.Backdrop} />
			<Dialog.Popup
				class={styles.Popup}
				initialFocus={() => initialFocusEl}
				finalFocus={() => finalFocusEl}
			>
				<div class={styles.Intro}>
					<Dialog.Title class={styles.Title}>Feedback form</Dialog.Title>
					<Dialog.Description class={styles.Description}>
						Your feedback means a lot to us.
					</Dialog.Description>
				</div>
				<Fieldset.Root class={styles.Fieldset}>
					<Field.Root class={styles.Field}>
						<Field.Label class={styles.Label}>Full name</Field.Label>
						<Field.Control placeholder="Enter your name" class={styles.Input} />
					</Field.Root>
					<Field.Root class={styles.Field}>
						<Field.Label class={styles.Label}>Feedback</Field.Label>
						<Field.Control
							{@attach (node) => {
								initialFocusEl = node as HTMLInputElement;
							}}
							required
							placeholder="Enter your feedback"
							class={styles.Input}
						/>
					</Field.Root>
				</Fieldset.Root>
				<div class={styles.Actions}>
					<Dialog.Close class={styles.Button}>Close</Dialog.Close>
				</div>
			</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
	<button bind:this={finalFocusEl} type="button" class={styles.Button}>Final focus</button>
</div>
