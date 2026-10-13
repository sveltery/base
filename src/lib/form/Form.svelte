<!--
	A native form element with consolidated error handling. Renders a `<form>` element.
	Derived from Base UI v1.8.0 packages/react/src/form/Form.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	`validate` is an export. Bind the form with `bind:this`.
-->
<script
	lang="ts"
	generics="FormValues extends Record<string, unknown> = Record<string, unknown>, S extends FormSource = FormSource"
>
	import { tick, untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import { on } from 'svelte/events';
	import type { HTMLFormAttributes } from 'svelte/elements';
	import { DEV } from 'esm-env';
	import { createGenericEventDetails, REASONS, warn } from '@sveltery/utils';
	import { setFormContext, type FormContextValue } from './context.js';
	import { comesBeforeInSameTree } from './document-order.js';
	import { IssueSession } from './issues.svelte.js';
	import { replayResets, resetForm } from './kit-reset-replay.js';
	import {
		allIssues,
		pathKey,
		type EnhanceInstance,
		type EnhanceInstanceOf,
		type FormSource
	} from './source.js';
	import { onFormReset } from '../internal/form-reset.svelte.js';
	import type { FormErrors, FormField, FormProps, FormState } from './types.js';

	let {
		form: source,
		enhance,
		validationMode = 'onSubmit',
		errors = $bindable(),
		onsubmit,
		onFormSubmit,
		novalidate = true,
		render,
		children,
		...elementProps
	}: FormProps<FormValues, S> = $props();

	const fields = new Map<string, FormField>();
	const issues = new IssueSession(() => source);
	let element = $state<HTMLFormElement | null>(null);
	let submitCount = 0;
	// Plain flags. The focus effects read them when errors or the source's state change.
	let submitted = false;
	let awaitingSource = false;

	const formState: FormState = {};
	const emptyErrors: FormErrors = {};
	const attachmentKey = createAttachmentKey();
	const noValidateKey = createAttachmentKey();

	function rememberForm(node: HTMLFormElement) {
		element = node;
		const stopGate = on(node, 'submit', gateSubmit, { capture: true });
		const stopReplay = replayResets(node, () => source !== undefined);
		// A reset starts the form over: no external errors, no submit and no source issues yet.
		const stopReset = onFormReset(node, {
			settle: () => {
				submitCount = 0;
				submitted = false;
				awaitingSource = false;
				issues.reset();
				if (errors && Object.keys(errors).length > 0) errors = {};
			}
		});
		return () => {
			stopGate();
			stopReplay();
			stopReset();
			if (element === node) element = null;
		};
	}

	// Applied once the form is live. A page without JavaScript keeps native validation.
	function applyNoValidate(node: HTMLFormElement) {
		node.noValidate = novalidate;
	}

	/**
	 * Focuses the first control by document position whose field matches `invalid`.
	 * Returns whether any field matched, focusable or not.
	 */
	function focusFirst(invalid: (field: FormField) => boolean) {
		// Registration order can diverge from DOM order. Disconnected trees keep registration order.
		let hasInvalid = false;
		let firstControl: HTMLElement | null = null;
		for (const field of fields.values()) {
			if (!invalid(field)) continue;
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
		}
		return hasInvalid;
	}

	function focusFirstInvalid(formErrors: FormErrors) {
		focusFirst(
			(field) =>
				field.validityData.state.valid === false ||
				(field.name != null && formErrors[field.name] != null)
		);
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

	// Capture phase, so an invalid submit stops before any later `submit` listener on the form,
	// such as the source's own or SvelteKit's `enhance`, which do not check `defaultPrevented`.
	function gateSubmit(event: SubmitEvent) {
		// `formnovalidate` on the submitter skips validation, as it does for a native form.
		if (event.submitter?.hasAttribute('formnovalidate')) return;
		submitCount += 1;
		issues.submitAttempted();

		// Async validation is not awaited, so it cannot stop this submit.
		fields.forEach((field) => {
			field.validate();
		});

		if (focusFirst((field) => field.blocksSubmit)) {
			event.preventDefault();
			event.stopImmediatePropagation();
			return;
		}
		awaitingSource = source !== undefined;
	}

	function handleSubmit(event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) {
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

	/** Kit's default: reset the form after a successful submit. */
	async function submitAndReset(instance: EnhanceInstance) {
		if (await instance.submit()) {
			await tick();
			if (instance.element.isConnected) resetForm(instance.element);
		}
	}

	// Form owns the source's callback so it learns when a server round trip ends. That is the
	// only way to tell server issues from client ones. `enhance` customizes the callback.
	$effect.pre(() => {
		const current = source;
		if (!current?.enhance) return;
		untrack(() =>
			current.enhance!(async (instance) => {
				const tracked: EnhanceInstance = Object.create(instance, {
					submit: {
						value: () => {
							const submission = instance.submit();
							const ended = () => issues.roundTripEnded();
							void submission.then(ended, ended);
							return submission;
						}
					}
				});
				if (enhance) await enhance(tracked as EnhanceInstanceOf<S>);
				else await submitAndReset(tracked);
			})
		);
		// The source keeps one callback. Hand back the default when this Form lets go of it.
		return () => {
			current.enhance!(async (instance) => {
				if (await instance.submit()) {
					await tick();
					if (instance.element.isConnected) HTMLFormElement.prototype.reset.call(instance.element);
				}
			});
		};
	});

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
		clearErrors,
		get source() {
			return source;
		},
		issues
	};
	setFormContext(context);

	// After a submit that was not already blocked, focus the first invalid control
	// once external errors change (server errors arriving after the post).
	$effect(() => {
		const current = errors ?? emptyErrors;
		if (!submitted) return;
		submitted = false;
		focusFirstInvalid(current);
	});

	// With a source, focus once its submit settles: preflight failed or the server answered.
	$effect(() => {
		if (!source) return;
		const pending = source.pending;
		void allIssues(source);
		if (!awaitingSource || pending > 0) return;
		awaitingSource = false;
		untrack(() => focusFirstInvalid(errors ?? emptyErrors));
	});

	if (DEV) {
		$effect(() => {
			if (source && onFormSubmit) {
				warn(
					'<Form form> submits through its source, so `onFormSubmit` runs alongside that submit. Use `enhance` to customize a source submit.'
				);
			}
		});

		// Kit's `fields` accepts any path, so a misspelled `name` cannot be caught up front.
		$effect(() => {
			const named = issues.nameClaims;
			if (named.length === 0) return;
			for (const issue of issues.unclaimedIssues) {
				if (issue.path.length === 0) continue;
				warn(
					`an issue on \`${pathKey(issue.path)}\` has no <Field.Root> to show it, while <Field.Root name> resolved ${named.map((name) => `\`${name}\``).join(', ')} through the form. A misspelled \`name\` submits under the wrong key.`
				);
			}
		});
	}

	const hostProps: HTMLFormAttributes = $derived({
		...source,
		...elementProps,
		onsubmit: handleSubmit,
		[attachmentKey]: rememberForm,
		[noValidateKey]: applyNoValidate
	});
</script>

{#if render}
	{@render render(hostProps, formState, children)}
{:else}
	<form {...hostProps}>{@render children?.()}</form>
{/if}
