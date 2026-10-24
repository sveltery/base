<!--
	Holds the slots and the input that types into them. Rest props go to the input.
	Renders a `<div>` element.
	Derived from input-otp v1.4.2 packages/input-otp/src/input.tsx
	(commit 81ccdb48c010d800b24942aa231909f0c971b1ca). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts" module>
	const NOSCRIPT_CSS_FALLBACK = `
[data-input-otp] {
  --nojs-bg: white !important;
  --nojs-fg: black !important;

  background-color: var(--nojs-bg) !important;
  color: var(--nojs-fg) !important;
  caret-color: var(--nojs-fg) !important;
  letter-spacing: .25em !important;
  text-align: center !important;
  border: 1px solid var(--nojs-fg) !important;
  border-radius: 4px !important;
  width: 100% !important;
}
@media (prefers-color-scheme: dark) {
  [data-input-otp] {
    --nojs-bg: black !important;
    --nojs-fg: white !important;
  }
}`;

	const AUTOFILL_STYLES =
		'background: transparent !important; color: transparent !important; border-color: transparent !important; opacity: 0 !important; box-shadow: none !important; -webkit-box-shadow: none !important; -webkit-text-fill-color: transparent !important;';

	const GLOBAL_RULES = [
		'[data-input-otp]::selection { background: transparent !important; color: transparent !important; }',
		`[data-input-otp]:autofill { ${AUTOFILL_STYLES} }`,
		`[data-input-otp]:-webkit-autofill { ${AUTOFILL_STYLES} }`,
		'@supports (-webkit-touch-callout: none) { [data-input-otp] { letter-spacing: -.6em !important; font-weight: 100 !important; font-stretch: ultra-condensed; font-optical-sizing: none !important; left: -1px !important; right: 1px !important; } }',
		'[data-input-otp] + * { pointer-events: all !important; }'
	];

	function insertGlobalStyles() {
		if (document.getElementById('input-otp-style')) return;
		const style = document.createElement('style');
		style.id = 'input-otp-style';
		document.head.appendChild(style);
		for (const rule of GLOBAL_RULES) {
			try {
				style.sheet?.insertRule(rule);
			} catch {
				console.error('input-otp could not insert CSS rule:', rule);
			}
		}
	}
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { on } from 'svelte/events';
	import { TimeoutManager } from '@sveltery/utils';
	import { useValueChanged } from '../internal/useValueChanged.svelte.js';
	import { setInputOTPContext } from './context.js';
	import { BADGE_SPACE_WIDTH, passwordManagerBadge } from './password-manager-badge.svelte.js';
	import type { InputOTPRootProps, InputOTPRootState, InputOTPSlotState } from './types.js';

	type Direction = 'forward' | 'backward' | 'none';

	let {
		value = $bindable(),
		defaultValue = '',
		maxlength,
		textAlign = 'left',
		pattern,
		placeholder,
		inputmode = 'numeric',
		onComplete,
		pushPasswordManagerStrategy = 'increase-width',
		pasteTransformer,
		containerClass,
		noScriptCSSFallback = NOSCRIPT_CSS_FALLBACK,
		render,
		children,
		oninput,
		onpaste,
		onfocus,
		onblur,
		onmouseover,
		onmouseleave,
		...props
	}: InputOTPRootProps = $props();

	value ??= untrack(() => defaultValue);
	const code = $derived(value ?? '');

	const regexp = $derived(
		pattern ? (typeof pattern === 'string' ? new RegExp(pattern) : pattern) : null
	);

	let container = $state<HTMLDivElement | null>(null);
	let input = $state<HTMLInputElement | null>(null);
	let isHoveringInput = $state(false);
	let isFocused = $state(false);
	let mirrorSelectionStart = $state<number | null>(null);
	let mirrorSelectionEnd = $state<number | null>(null);
	let previousSelection: [number | null, number | null, Direction | null] = [null, null, null];

	const badge = passwordManagerBadge({
		container: () => container,
		input: () => input,
		strategy: () => pushPasswordManagerStrategy,
		isFocused: () => isFocused
	});

	const syncTimers = new TimeoutManager();
	let syncRun = 0;
	$effect(() => () => syncTimers.clearAll());
	function syncTimeouts(callback: () => void) {
		const run = syncRun++;
		for (const delay of [0, 10, 50]) syncTimers.start(`${run}:${delay}`, delay, callback);
	}

	function setMirror(start: number | null, end: number | null) {
		mirrorSelectionStart = start;
		mirrorSelectionEnd = end;
	}

	function onDocumentSelectionChange() {
		if (!input) return;
		if (document.activeElement !== input) {
			setMirror(null, null);
			return;
		}
		const {
			selectionStart: s,
			selectionEnd: e,
			selectionDirection: dir,
			maxLength: ml,
			value: val
		} = input;
		const prev = previousSelection;

		let start = -1;
		let end = -1;
		let direction: Direction | undefined;
		if (val.length !== 0 && s !== null && e !== null) {
			const isSingleCaret = s === e;
			const isInsertMode = s === val.length && val.length < ml;
			if (isSingleCaret && !isInsertMode) {
				if (s === 0) {
					start = 0;
					end = 1;
					direction = 'forward';
				} else if (s === ml) {
					start = s - 1;
					end = s;
					direction = 'backward';
				} else if (ml > 1 && val.length > 1) {
					let offset = 0;
					if (prev[0] !== null && prev[1] !== null) {
						direction = s < prev[1] ? 'backward' : 'forward';
						const wasPreviouslyInserting = prev[0] === prev[1] && prev[0] < ml;
						if (direction === 'backward' && !wasPreviouslyInserting) offset = -1;
					}
					start = offset + s;
					end = offset + s + 1;
				}
			}
			if (start !== -1 && end !== -1 && start !== end)
				input.setSelectionRange(start, end, direction);
		}

		const nextStart = start !== -1 ? start : s;
		const nextEnd = end !== -1 ? end : e;
		setMirror(nextStart, nextEnd);
		previousSelection = [nextStart, nextEnd, direction ?? dir];
	}

	function mountInput(field: HTMLInputElement) {
		const root = container;
		if (!root) return;
		return untrack(() => syncInput(field, root));
	}

	function syncInput(field: HTMLInputElement, root: HTMLDivElement) {
		input = field;
		if (field.value !== code) value = field.value;
		previousSelection = [field.selectionStart, field.selectionEnd, field.selectionDirection];
		const offSelectionChange = on(document, 'selectionchange', onDocumentSelectionChange, {
			capture: true
		});
		onDocumentSelectionChange();
		if (document.activeElement === field) isFocused = true;

		insertGlobalStyles();

		const updateRootHeight = () =>
			root.style.setProperty('--root-height', `${field.clientHeight}px`);
		updateRootHeight();
		const resizeObserver = new ResizeObserver(updateRootHeight);
		resizeObserver.observe(field);

		return () => {
			offSelectionChange();
			resizeObserver.disconnect();
			input = null;
		};
	}

	$effect(() => {
		void code;
		void isFocused;
		syncTimeouts(() => {
			if (!input) return;
			// Dispatching input clears the browser's :autofill state.
			input.dispatchEvent(new Event('input'));
			onDocumentSelectionChange();
		});
	});

	// A value changes from short to full exactly when `isComplete` flips to true.
	const isComplete = $derived(code.length === maxlength);
	useValueChanged(
		() => isComplete,
		(complete) => {
			if (complete) onComplete?.(code);
		}
	);

	function handleInput(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		const field = event.currentTarget;
		const next = field.value.slice(0, maxlength);
		if (next !== code && !(next.length > 0 && regexp && !regexp.test(next))) {
			// Deleting moves no selection, so selectionchange has to be raised by hand.
			if (next.length < code.length) document.dispatchEvent(new Event('selectionchange'));
			value = next;
		}
		if (field.value !== code) field.value = code;
		oninput?.(event);
	}

	function handlePaste(event: ClipboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		const field = event.currentTarget;
		const isIOS = window.CSS?.supports?.('-webkit-touch-callout', 'none');
		if ((pasteTransformer || isIOS) && event.clipboardData) {
			const pasted = event.clipboardData.getData('text/plain');
			const content = pasteTransformer ? pasteTransformer(pasted) : pasted;
			event.preventDefault();
			const start = field.selectionStart ?? 0;
			const end = field.selectionEnd ?? start;
			const next = (code.slice(0, start) + content + code.slice(start !== end ? end : start)).slice(
				0,
				maxlength
			);
			if (!(next.length > 0 && regexp && !regexp.test(next))) {
				field.value = next;
				value = next;
				const selectionStart = Math.min(next.length, maxlength - 1);
				field.setSelectionRange(selectionStart, next.length);
				setMirror(selectionStart, next.length);
			}
		}
		onpaste?.(event);
	}

	function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		const field = event.currentTarget;
		const start = Math.min(field.value.length, maxlength - 1);
		field.setSelectionRange(start, field.value.length);
		setMirror(start, field.value.length);
		isFocused = true;
		onfocus?.(event);
	}

	const slots = $derived(
		Array.from({ length: maxlength }, (_, index): InputOTPSlotState => {
			const isActive =
				isFocused &&
				mirrorSelectionStart !== null &&
				mirrorSelectionEnd !== null &&
				((mirrorSelectionStart === mirrorSelectionEnd && index === mirrorSelectionStart) ||
					(index >= mirrorSelectionStart && index < mirrorSelectionEnd));
			const char = code[index] ?? null;
			return {
				char,
				placeholderChar: code[0] !== undefined ? null : (placeholder?.[index] ?? null),
				isActive,
				hasFakeCaret: isActive && char === null
			};
		})
	);

	const renderProps: InputOTPRootState = {
		get slots() {
			return slots;
		},
		get isFocused() {
			return isFocused;
		},
		get isHovering() {
			return !props.disabled && isHoveringInput;
		}
	};
	setInputOTPContext(renderProps);

	const inputStyle = $derived(
		[
			'position: absolute',
			'inset: 0',
			`width: ${badge.willPush ? `calc(100% + ${BADGE_SPACE_WIDTH})` : '100%'}`,
			badge.willPush && `clip-path: inset(0 ${BADGE_SPACE_WIDTH} 0 0)`,
			'height: 100%',
			'display: flex',
			`text-align: ${textAlign}`,
			'opacity: 1',
			'color: transparent',
			'pointer-events: all',
			'background: transparent',
			'caret-color: transparent',
			'border: 0 solid transparent',
			'outline: 0 solid transparent',
			'box-shadow: none',
			'line-height: 1',
			'letter-spacing: -.5em',
			'font-size: var(--root-height)',
			'font-family: monospace',
			'font-variant-numeric: tabular-nums'
		]
			.filter(Boolean)
			.join('; ')
	);
</script>

{#if noScriptCSSFallback !== null}
	<noscript><svelte:element this={"style"}>{noScriptCSSFallback}</svelte:element></noscript>
{/if}

<div
	bind:this={container}
	data-input-otp-container="true"
	style:position="relative"
	style:cursor={props.disabled ? 'default' : 'text'}
	style:user-select="none"
	style:-webkit-user-select="none"
	style:pointer-events="none"
	class={containerClass}
>
	{#if render}
		{@render render(renderProps)}
	{:else}
		{@render children?.()}
	{/if}

	<div style="position: absolute; inset: 0; pointer-events: none;">
		<input
			autocomplete="one-time-code"
			{...props}
			{@attach mountInput}
			data-input-otp="true"
			data-input-otp-placeholder-shown={code.length === 0 ? 'true' : undefined}
			data-input-otp-mss={mirrorSelectionStart}
			data-input-otp-mse={mirrorSelectionEnd}
			{inputmode}
			pattern={regexp?.source}
			aria-placeholder={placeholder}
			style={inputStyle}
			{maxlength}
			value={code}
			oninput={handleInput}
			onpaste={handlePaste}
			onmouseover={(event) => {
				isHoveringInput = true;
				onmouseover?.(event);
			}}
			onmouseleave={(event) => {
				isHoveringInput = false;
				onmouseleave?.(event);
			}}
			onfocus={handleFocus}
			onblur={(event) => {
				isFocused = false;
				onblur?.(event);
			}}
		/>
	</div>
</div>
