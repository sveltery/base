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
	import type { FormActions, FormErrors, FormProps, FormState } from './types.js';

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

	const formRef: FormContextValue['formRef'] = { current: { fields: new Map() } };
	const elementRef: FormContextValue['elementRef'] = { current: null };
	const submitCountRef: FormContextValue['submitCountRef'] = { current: 0 };
	// Plain flag, like the upstream ref. The focus effect reads it when `errors` changes.
	let submitted = false;

	const state: FormState = {};
	const emptyErrors: FormErrors = {};
	const attachmentKey = createAttachmentKey();

	function rememberForm(node: HTMLFormElement) {
		elementRef.current = node;
		return () => {
			if (elementRef.current === node) elementRef.current = null;
		};
	}

	function focusFirstInvalid() {
		// A field can be invalid without a focusable control. Submission stays blocked.
		// Registration order can diverge from DOM order, so pick the first control by
		// document position. Disconnected trees keep registration order.
		let hasInvalid = false;
		let firstControl: HTMLElement | null = null;
		for (const field of formRef.current.fields.values()) {
			if (field.validityData.state.valid !== false) continue;
			hasInvalid = true;
			const control = field.controlRef.current;
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
			for (const field of formRef.current.fields.values()) {
				if (field.name === fieldName) {
					field.validate();
					return;
				}
			}
			return;
		}
		formRef.current.fields.forEach((field) => {
			field.validate();
		});
	}

	const actionsHandle: FormActions = { validate };
	// Read the incoming bindable before replacing it so the publish is a real
	// assignment. Comparing the proxy with `!==` does not work.
	void actions;
	actions = actionsHandle;
	void actions.validate;

	function clearErrors(name: string | undefined) {
		if (!name || !errors || !Object.hasOwn(errors, name)) return;
		const nextErrors = { ...errors };
		delete nextErrors[name];
		errors = nextErrors;
	}

	function handleSubmit(event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) {
		submitCountRef.current += 1;

		// Async validation is not awaited, so it cannot stop this submit.
		formRef.current.fields.forEach((field) => {
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
			formRef.current.fields.forEach((field) => {
				if (field.name) formValues[field.name] = field.getValue();
			});

			onFormSubmit(formValues as FormValues, createGenericEventDetails(REASONS.none, event));
		}
	}

	const context: FormContextValue = {
		elementRef,
		formRef,
		submitCountRef,
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
		void errors;
		if (!submitted) return;
		submitted = false;
		focusFirstInvalid();
	});

	const hostProps: HTMLFormAttributes = $derived({
		...elementProps,
		novalidate,
		onsubmit: handleSubmit,
		[attachmentKey]: rememberForm
	});
</script>

{#snippet content()}
	{@render children?.()}
{/snippet}

{#if render}
	{@render render(hostProps, state, content)}
{:else}
	<form {...hostProps}>{@render content()}</form>
{/if}
