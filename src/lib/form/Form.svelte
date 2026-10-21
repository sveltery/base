<!--
	A native form element with consolidated error handling. Renders a `<form>` element.
	Derived from Base UI v1.9.0 packages/react/src/form/Form.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	`validate` is an export. Bind the form with `bind:this`.
	The browser's constraint validation is the submit gate, and `form` takes a SvelteKit remote
	form; docs/upstream-differences.md lists how this differs from Base UI.
-->
<script lang="ts">
	import { untrack } from 'svelte';
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
	let settleCount = $state(0);
	let plainSubmitted = $state(false);
	// A plain flag. The focus effects read it when the response arrives.
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
	let firstCancelled: HTMLElement | null = null;
	// Set while the user submits: a submit button's click, Enter in a control, or
	// `requestSubmit()`. A `checkValidity()` call fires `invalid` without it and is left alone.
	let submitIntent = false;
	const intentTimer = new ScopedTimeout();
	const invalidTimer = new ScopedTimeout();

	/** Marks a submit attempt and refreshes every `validate` message before the browser checks. */
	function startSubmit() {
		submitIntent = true;
		fields.forEach((field) => {
			field.syncValidity();
		});
		// The browser checks the form in the same task as the click or key press.
		intentTimer.start(0, () => {
			submitIntent = false;
		});
	}

	function isSubmitter(target: EventTarget | null, node: HTMLFormElement) {
		const control = target instanceof Element ? target.closest('button, input') : null;
		return (
			(control instanceof HTMLButtonElement || control instanceof HTMLInputElement) &&
			control.form === node &&
			(control.type === 'submit' || control.type === 'image') &&
			!control.formNoValidate
		);
	}

	/** Cancels the browser's bubble for a control a Field shows messages for. */
	function handleInvalid(event: Event) {
		if (!submitIntent) return;
		const target = event.target;
		let owned = false;
		for (const field of fields.values()) {
			if (target instanceof Element && field.owns(target)) {
				owned = true;
				break;
			}
		}
		if (owned) {
			event.preventDefault();
			if (target instanceof HTMLElement) firstCancelled ??= target;
		} else unhandledInvalid = true;

		if (invalidPass) return;
		invalidPass = true;
		// One constraint check fires `invalid` on every invalid control before this task runs.
		// A microtask would not do: it runs between the listeners of each `invalid` event.
		invalidTimer.start(0, () => {
			invalidPass = false;
			submitIntent = false;
			const browserReported = unhandledInvalid;
			const cancelled = firstCancelled;
			unhandledInvalid = false;
			firstCancelled = null;
			submitCount += 1;
			fields.forEach((field) => {
				field.validate();
			});
			if (browserReported) return;
			// A Field whose control the browser blocked may show nothing for it, such as a
			// `required` input in a Field without Field.Error. Let the browser report it then.
			if (!focusFirstInvalid() && cancelled && 'reportValidity' in cancelled) {
				(cancelled as HTMLInputElement).reportValidity();
			}
		});
	}

	function rememberForm(node: HTMLFormElement) {
		element = node;
		node.addEventListener('invalid', handleInvalid, true);
		const doc = node.ownerDocument;
		// On the document, for a submit button outside the form that names it with `form`.
		const onClick = (event: MouseEvent) => {
			if (isSubmitter(event.target, node)) startSubmit();
		};
		const onKeydown = (event: KeyboardEvent) => {
			// Enter in a control submits the form implicitly.
			const target = event.target;
			if (
				event.key === 'Enter' &&
				target instanceof Element &&
				!(target instanceof HTMLTextAreaElement) &&
				node.contains(target)
			) {
				startSubmit();
			}
		};
		doc.addEventListener('click', onClick, true);
		doc.addEventListener('keydown', onKeydown, true);
		node.requestSubmit = function (submitter) {
			if (!(submitter as HTMLButtonElement | null | undefined)?.formNoValidate) startSubmit();
			HTMLFormElement.prototype.requestSubmit.call(this, submitter);
		};
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
			doc.removeEventListener('click', onClick, true);
			doc.removeEventListener('keydown', onKeydown, true);
			delete (node as Partial<HTMLFormElement>).requestSubmit;
			if (element === node) element = null;
		};
	}

	/** Focuses the first invalid control by document position. Returns whether it found one. */
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
		if (!firstControl) return false;
		firstControl.focus();
		if (firstControl.tagName === 'INPUT') {
			(firstControl as HTMLInputElement).select();
		}
		return true;
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
		get settleCount() {
			return settleCount;
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
	// response arrives: new `errors`, or the end of a remote submit.
	$effect(() => {
		void errors;
		if (remote || !awaitingResponse) return;
		awaitingResponse = false;
		focusFirstInvalid();
	});

	let wasPending = false;
	$effect(() => {
		const isPending = pending;
		if (wasPending && !isPending) {
			untrack(() => {
				settleCount += 1;
				if (!awaitingResponse) return;
				awaitingResponse = false;
				focusFirstInvalid();
			});
		}
		wasPending = isPending;
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
