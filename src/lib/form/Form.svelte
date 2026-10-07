<!--
	A native form element with consolidated error handling. Renders a `<form>` element.
	Derived from Base UI v1.8.0 packages/react/src/form/Form.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts" generics="FormValues extends Record<string, unknown> = Record<string, unknown>">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLFormAttributes } from 'svelte/elements';
	import { createGenericEventDetails, REASONS } from '../internal/event-details.js';
	import { setFormContext, type FormContextValue } from './context.js';
	import { comesBeforeInSameTree } from './document-order.js';
	import type { FormActions, FormErrors, FormField, FormProps, FormState } from './types.js';

	let {
		validationMode = 'onSubmit',
		errors = $bindable(),
		onsubmit,
		onFormSubmit,
		actions = $bindable(),
		novalidate = true,
		render,
		children,
		...elementProps
	}: FormProps<FormValues> = $props();

	const fields = new Map<string, FormField>();
	let element = $state<HTMLFormElement | null>(null);
	let submitCount = 0;
	// Plain flag. The focus effect reads it when `errors` changes.
	let submitted = false;

	const formState: FormState = {};
	const emptyErrors: FormErrors = {};
	const attachmentKey = createAttachmentKey();

	function rememberForm(node: HTMLFormElement) {
		element = node;
		return () => {
			if (element === node) element = null;
		};
	}

	function focusFirstInvalid() {
		// A field can be invalid without a focusable control. Submission stays blocked.
		// Registration order can diverge from DOM order, so pick the first control by
		// document position. Disconnected trees keep registration order.
		let hasInvalid = false;
		let firstControl: HTMLElement | null = null;
		for (const field of fields.values()) {
			if (field.validityData.state.valid !== false) continue;
			hasInvalid = true;
			const control = field.control;
			if (control && (!firstControl || comesBeforeInSameTree(control, firstControl))) {
				firstControl = control;
			}
		}
		if (firstControl) {
			firstControl.focus();
			if (firstControl.tagName === 'INPUT') {
				(firstControl as HTMLInputElement).select();
			}
			return true;
		}
		return hasInvalid;
	}

	function validate(fieldName?: string) {
		if (fieldName) {
			for (const field of fields.values()) {
				if (field.name === fieldName) {
					field.validate();
					return;
				}
			}
			return;
		}
		fields.forEach((field) => {
			field.validate();
		});
	}

	const actionsHandle: FormActions = { validate };
	publishActions();

	function publishActions() {
		actions = actionsHandle;
		return actions.validate;
	}

	function clearErrors(name: string | undefined) {
		if (!name || !errors || !Object.hasOwn(errors, name)) return;
		const nextErrors = { ...errors };
		delete nextErrors[name];
		errors = nextErrors;
	}

	function handleSubmit(event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) {
		submitCount += 1;

		// Async validation is not awaited, so it cannot stop this submit.
		fields.forEach((field) => {
			field.validate();
		});

		if (focusFirstInvalid()) {
			event.preventDefault();
			return;
		}

		submitted = true;
		onsubmit?.(event);

		if (onFormSubmit) {
			event.preventDefault();

			const formValues: Record<string, unknown> = {};
			fields.forEach((field) => {
				if (field.name) formValues[field.name] = field.getValue();
			});

			onFormSubmit(formValues as FormValues, createGenericEventDetails(REASONS.none, event));
		}
	}

	const context: FormContextValue = {
		fields,
		get element() {
			return element;
		},
		get submitCount() {
			return submitCount;
		},
		get validationMode() {
			return validationMode;
		},
		get errors() {
			return errors ?? emptyErrors;
		},
		clearErrors
	};
	setFormContext(context);

	// After a submit that was not already blocked, focus the first invalid control
	// once external errors change (server errors arriving after the post).
	$effect(() => {
		const current = errors;
		if (!submitted) return;
		submitted = false;
		if (current == null || current) focusFirstInvalid();
	});

	const hostProps: HTMLFormAttributes = $derived({
		...elementProps,
		novalidate,
		onsubmit: handleSubmit,
		// The default host uses `bind:this`. A custom `render` host is the caller's element,
		// so the same element is recorded when they spread `props`.
		...(render ? { [attachmentKey]: rememberForm } : {})
	});
</script>

{#snippet content()}
	{@render children?.()}
{/snippet}

{#if render}
	{@render render(hostProps, formState, content)}
{:else}
	<form {...hostProps} bind:this={element}>{@render content()}</form>
{/if}
