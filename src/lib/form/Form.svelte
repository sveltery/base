<!--
	A native form element with consolidated error handling. Renders a `<form>` element.
	Derived from Base UI v1.9.0 packages/react/src/form/Form.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	`validate` is an export. Bind the form with `bind:this`.
	The browser's constraint validation is the submit gate, and `form` takes a SvelteKit remote
	form; docs/upstream-differences.md lists how this differs from Base UI.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { ScopedTimeout } from '@sveltery/utils';
	import type { HTMLFormAttributes } from 'svelte/elements';
	import { setFormContext, type FormContextValue } from '../internal/form-context.js';
	import { comesBeforeInSameTree } from './document-order.js';
	import { onFormReset } from '../internal/form-reset.svelte.js';
	import { readRemoteIssues, remoteFormAttributes } from './remote-form.js';
	import type { FormErrors, FormProps, FormState } from './types.js';

	const uid = $props.id();

	let {
		form: remote,
		validationMode = 'onSubmit',
		validationDebounceTime,
		errors = $bindable(),
		values,
		onsubmit,
		novalidate = false,
		render,
		children,
		...elementProps
	}: FormProps = $props();

	const fields: FormContextValue['fields'] = new Map();
	let element = $state<HTMLFormElement | null>(null);
	let submitCount = $state(0);
	let plainSubmitted = $state(false);
	// A plain flag. The focus effect reads it when errors change.
	let awaitingResponse = false;

	const formState: FormState = {};
	const emptyErrors: FormErrors = {};
	const emptyValues: Record<string, unknown> = {};
	const attachmentKey = createAttachmentKey();

	const remoteIssues = $derived(readRemoteIssues(remote));
	const formMessages = $derived.by(() => {
		if (remote) {
			return remoteIssues.filter((issue) => issue.path.length === 0).map((issue) => issue.message);
		}
		const entry = errors?.[''];
		return entry === undefined ? [] : ([] as string[]).concat(entry).filter(Boolean);
	});
	const invalid = $derived.by(() => {
		if (remote) return remoteIssues.length > 0;
		return Object.values(errors ?? emptyErrors).some((entry) =>
			Array.isArray(entry) ? entry.length > 0 : Boolean(entry)
		);
	});
	const pending = $derived((remote?.pending ?? 0) > 0);
	const submitted = $derived(remote ? Boolean(remote.submitted) : plainSubmitted);
	const errorId = $derived(`${elementProps.id ?? `base-ui-${uid}`}-error`);

	let invalidPass = false;
	let unhandledInvalid = false;
	const invalidTimer = new ScopedTimeout();

	/** Cancels the browser's bubble for a control a Field shows messages for. */
	function handleInvalid(event: Event) {
		const target = event.target;
		let owned = false;
		for (const field of fields.values()) {
			if (target instanceof Element && field.owns(target)) {
				owned = true;
				break;
			}
		}
		if (owned) event.preventDefault();
		else unhandledInvalid = true;

		if (invalidPass) return;
		invalidPass = true;
		// One constraint check fires `invalid` on every invalid control before this task runs.
		// A microtask would not do: it runs between the listeners of each `invalid` event.
		invalidTimer.start(0, () => {
			invalidPass = false;
			const browserReported = unhandledInvalid;
			unhandledInvalid = false;
			submitCount += 1;
			fields.forEach((field) => {
				field.validate();
			});
			if (!browserReported) focusFirstInvalid();
		});
	}

	function rememberForm(node: HTMLFormElement) {
		element = node;
		node.addEventListener('invalid', handleInvalid, true);
		// A reset starts the form over: no external errors and no submit yet.
		const stopReset = onFormReset(node, {
			settle: () => {
				submitCount = 0;
				plainSubmitted = false;
				awaitingResponse = false;
				if (errors && Object.keys(errors).length > 0) errors = {};
			}
		});
		return () => {
			stopReset();
			node.removeEventListener('invalid', handleInvalid, true);
			if (element === node) element = null;
		};
	}

	/** Focuses the first invalid control by document position. */
	function focusFirstInvalid() {
		// Registration order can diverge from DOM order. Disconnected trees keep registration order.
		let firstControl: HTMLElement | null = null;
		for (const field of fields.values()) {
			if (field.validityData.state.valid !== false && !field.invalid) continue;
			const control = field.control;
			if (control && (!firstControl || comesBeforeInSameTree(control, firstControl))) {
				firstControl = control;
			}
		}
		if (!firstControl) return;
		firstControl.focus();
		if (firstControl.tagName === 'INPUT') {
			(firstControl as HTMLInputElement).select();
		}
	}

	export function validate(fieldName?: string) {
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

	function clearErrors(name: string | undefined) {
		if (!name || !errors || !Object.hasOwn(errors, name)) return;
		const nextErrors = { ...errors };
		delete nextErrors[name];
		errors = nextErrors;
	}

	function handleSubmit(event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) {
		submitCount += 1;
		plainSubmitted = true;
		// Publishes each field's verdict. The browser has already blocked an invalid submit,
		// and async validation is not awaited.
		fields.forEach((field) => {
			field.validate();
		});
		// A field marked invalid by its `invalid` prop or external errors passes the browser's
		// check. Focus it, as Base UI does on submit.
		focusFirstInvalid();
		awaitingResponse = true;
		onsubmit?.(event);
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
		get validationDebounceTime() {
			return validationDebounceTime;
		},
		get errors() {
			return errors ?? emptyErrors;
		},
		get values() {
			return values ?? emptyValues;
		},
		clearErrors,
		get remote() {
			return remote;
		},
		get remoteIssues() {
			return remoteIssues;
		},
		get formMessages() {
			return formMessages;
		},
		get errorId() {
			return errorId;
		},
		get pending() {
			return pending;
		},
		get submitted() {
			return submitted;
		}
	};
	setFormContext(context);

	// After a submit the browser let through, focus the first invalid control once the
	// errors or issues it brought back arrive.
	$effect(() => {
		void errors;
		void remoteIssues;
		if (!awaitingResponse) return;
		awaitingResponse = false;
		focusFirstInvalid();
	});

	const describedBy = $derived.by(() => {
		const ids = elementProps['aria-describedby']?.split(' ').filter(Boolean) ?? [];
		if (formMessages.length > 0 && !ids.includes(errorId)) ids.push(errorId);
		return ids.length > 0 ? ids.join(' ') : undefined;
	});

	const hostProps: HTMLFormAttributes = $derived({
		novalidate,
		...(remote ? remoteFormAttributes(remote) : {}),
		...elementProps,
		'aria-describedby': describedBy,
		'data-pending': pending ? '' : undefined,
		'data-submitted': submitted ? '' : undefined,
		'data-invalid': invalid ? '' : undefined,
		onsubmit: handleSubmit,
		[attachmentKey]: rememberForm
	});
</script>

{#if render}
	{@render render(hostProps, formState, children)}
{:else}
	<form {...hostProps}>{@render children?.()}</form>
{/if}
