<!--
	A native form element with consolidated error handling. Renders a `<form>` element.
	Derived from Base UI v1.8.0 packages/react/src/form/Form.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	`validate` is an export. Bind the form with `bind:this`.
-->
<script module lang="ts">
	import type { EnhanceCallback, FormSource } from './source.js';

	/** The callback a mounted Form installed on each source, so an older Form does not undo a newer one's. */
	const installed = new WeakMap<FormSource, EnhanceCallback>();
</script>

<script
	lang="ts"
	generics="FormValues extends Record<string, unknown> = Record<string, unknown>, S extends FormSource = FormSource"
>
	import { tick, untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import { on } from 'svelte/events';
	import type { HTMLFormAttributes } from 'svelte/elements';
	import { DEV } from 'esm-env';
	import { activeElement, createGenericEventDetails, REASONS, warn } from '@sveltery/utils';
	import { setFormContext, type FormContextValue } from '../internal/form-context.js';
	import { comesBeforeInSameTree } from './document-order.js';
	import { IssueSession } from './issues.svelte.js';
	import { isRemoteForm, replayResets } from './kit-reset-replay.js';
	import {
		allIssues,
		defaultEnhance,
		pathKey,
		type EnhanceInstance,
		type EnhanceInstanceOf
	} from './source.js';
	import { onFormReset } from '../internal/form-reset.svelte.js';
	import type {
		FormErrors,
		FormField,
		FormFocusInvalidDetail,
		FormProps,
		FormState
	} from './types.js';

	let {
		form: source,
		enhance,
		validationMode = 'onSubmit',
		errors = $bindable(),
		onsubmit,
		onFormSubmit,
		onFocusInvalid,
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
	// A submit the gate let through is `sent` until the source's `pending` rises. A source that
	// leaves the submit to the browser never raises it, so only a `taken` submit settles.
	let sourceSubmit: 'idle' | 'sent' | 'taken' = 'idle';

	const formState: FormState = {};
	const emptyErrors: FormErrors = {};
	const attachmentKey = createAttachmentKey();
	const noValidateKey = createAttachmentKey();

	function rememberForm(node: HTMLFormElement) {
		element = node;
		const stopGate = on(node, 'submit', gateSubmit, { capture: true });
		const stopReplay = replayResets(node, () => isRemoteForm(source));
		// A reset starts the form over: no external errors, no submit and no source issues yet.
		const stopReset = onFormReset(node, {
			settle: () => {
				submitCount = 0;
				submitted = false;
				sourceSubmit = 'idle';
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
		let first: FormFocusInvalidDetail | null = null;
		for (const field of fields.values()) {
			if (!invalid(field)) continue;
			hasInvalid = true;
			const control = field.control;
			if (control && (!first || comesBeforeInSameTree(control, first.control))) {
				first = { control, field };
			}
		}
		if (first) void focusInvalid(first);
		return hasInvalid;
	}

	async function focusInvalid(detail: FormFocusInvalidDetail) {
		const { control } = detail;
		if (!onFocusInvalid) return focusControl(control);
		const doc = control.ownerDocument;
		const before = activeElement(doc);
		try {
			await untrack(() => onFocusInvalid(detail));
		} finally {
			// A reveal that only sets state has not reached the DOM yet. A failed reveal still
			// moves focus, and its error stays unhandled like any other callback's.
			await tick();
			const now = activeElement(doc);
			// Focus that moved while the callback ran belongs to the callback or the user. Hiding
			// the focused element only drops focus to the body.
			const moved = now !== before && now !== null && now !== doc.body;
			if (control.isConnected && !moved) focusControl(control);
		}
	}

	function focusControl(control: HTMLElement) {
		control.focus();
		if (control.tagName === 'INPUT') {
			(control as HTMLInputElement).select();
		}
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
		sourceSubmit = source ? 'sent' : 'idle';
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

	// Form owns the source's callback so it learns when a server round trip ends. That is the
	// only way to tell server issues from client ones. `enhance` customizes the callback.
	$effect.pre(() => {
		const current = source;
		if (!current?.enhance) return;
		const callback: EnhanceCallback = async (instance) => {
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
			else await defaultEnhance(tracked);
		};
		untrack(() => current.enhance!(callback));
		installed.set(current, callback);
		// The source keeps one callback. Hand back the default when this Form lets go of it,
		// unless a Form mounted since has replaced it.
		return () => {
			if (installed.get(current) !== callback) return;
			installed.delete(current);
			current.enhance!(defaultEnhance);
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
		if (pending > 0) {
			if (sourceSubmit === 'sent') sourceSubmit = 'taken';
			return;
		}
		if (sourceSubmit !== 'taken') return;
		sourceSubmit = 'idle';
		untrack(() => {
			issues.submitSettled();
			focusFirstInvalid(errors ?? emptyErrors);
		});
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
