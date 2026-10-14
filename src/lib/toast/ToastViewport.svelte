<!--
	A container viewport for toasts. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/toast/viewport/ToastViewport.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	React's `onFocus` and `onBlur` bubble, so they are `focusin` and `focusout` here.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import { on } from 'svelte/events';
	import {
		FocusGuard,
		ScopedTimeout,
		activeElement,
		contains,
		getTarget,
		matchesFocusVisible,
		ownerDocument,
		ownerWindow,
		visuallyHiddenStyle
	} from '@sveltery/utils';
	import { toCssStyle } from '../internal/css-style.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { ToastViewportCssVariables } from './constants.js';
	import { useToastStore } from './context.js';
	import ToastText from './ToastText.svelte';
	import type { ToastViewportProps, ToastViewportState } from './types.js';

	let { render, children, ...elementProps }: ToastViewportProps = $props();

	const store = useToastStore();
	const windowFocusTimeout = new ScopedTimeout();
	const viewportKey = createAttachmentKey();

	let handlingFocusGuard = false;
	let markedReadyForMouseLeave = false;
	let touchActive = false;

	const hasTransitioningToasts = $derived(
		store.toasts.some((toast) => toast.transitionStatus === 'ending')
	);
	const highPriorityToasts = $derived(store.toasts.filter((toast) => toast.priority === 'high'));
	const frontmostHeight = $derived(store.toasts[0]?.height);
	const showFocusGuards = $derived(!store.isEmpty && store.prevFocusElement != null);

	$effect(() => {
		// The viewport element arrives after the first render. Depending on `isEmpty` attaches the
		// listeners once toasts exist.
		const viewport = store.viewport;
		if (!viewport || store.isEmpty) return;

		const win = ownerWindow(viewport);
		const doc = ownerDocument(viewport);

		// Listen globally for F6 so we can force-focus the viewport.
		function handleGlobalKeyDown(event: KeyboardEvent) {
			if (event.key === 'F6' && getTarget(event) !== viewport) {
				event.preventDefault();
				store.prevFocusElement = activeElement(doc) as HTMLElement | null;
				viewport?.focus({ preventScroll: true });
				store.pauseTimers();
				store.focused = true;
			}
		}

		function handleWindowBlur(event: FocusEvent) {
			if (getTarget(event) !== win) return;
			store.isWindowFocused = false;
			store.pauseTimers();
		}

		function handleWindowFocus(event: FocusEvent) {
			if (event.relatedTarget) return;

			const target = getTarget(event);
			const activeEl = activeElement(ownerDocument(viewport));
			if (target === win || !contains(viewport, target) || !matchesFocusVisible(activeEl)) {
				store.resumeTimers();
			}

			// Wait for the viewport's focus handler to run.
			windowFocusTimeout.start(0, () => {
				store.isWindowFocused = true;
			});
		}

		const cleanups = [
			on(win, 'keydown', handleGlobalKeyDown),
			on(win, 'blur', handleWindowBlur, { capture: true }),
			on(win, 'focus', handleWindowFocus, { capture: true }),
			on(doc, 'pointerdown', store.handleDocumentPointerDown, { capture: true })
		];
		return () => cleanups.forEach((cleanup) => cleanup());
	});

	function handleFocusGuard(event: FocusEvent) {
		handlingFocusGuard = true;

		// Coming off the container, move to the first toast that can hold focus, skipping toasts
		// that are animating out or inert because they're limited.
		const firstFocusableToast =
			event.relatedTarget === store.viewport
				? store.toasts.find((toast) => toast.transitionStatus !== 'ending' && !toast.limited)
				: undefined;

		if (firstFocusableToast) firstFocusableToast.element?.focus();
		else store.restoreFocusToPrevElement();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Tab' && event.shiftKey && getTarget(event) === store.viewport) {
			event.preventDefault();
			// Restoring focus blurs the viewport, and `handleBlur` resumes the timers from there.
			// Resuming here as well would also fire when the previously focused element lives
			// inside the viewport, letting toasts dismiss out from under the keyboard.
			store.restoreFocusToPrevElement();
		}
	}

	function flushMouseLeave() {
		const hasEndingToasts = store.toasts.some((toast) => toast.transitionStatus === 'ending');
		if (hasEndingToasts || touchActive || !markedReadyForMouseLeave) return;

		// Apply any mouseleave that was deferred until transitions finished.
		store.hovering = false;
		if (!store.expandedOrOutOfFocus) store.resumeTimers();
		markedReadyForMouseLeave = false;
	}

	$effect(() => {
		if (hasTransitioningToasts) return;
		untrack(flushMouseLeave);
	});

	function handleMouseEnter() {
		store.pauseTimers();
		store.hovering = true;
		markedReadyForMouseLeave = false;
	}

	function handleMouseLeave() {
		// While toasts are transitioning out or a touch gesture is active, record the intent and
		// collapse later. Otherwise collapse now.
		markedReadyForMouseLeave = true;
		flushMouseLeave();
	}

	function handlePointerDown(event: PointerEvent) {
		if (event.pointerType === 'touch') touchActive = true;
	}

	function handlePointerEnd(event: PointerEvent) {
		if (event.pointerType !== 'touch') return;
		touchActive = false;
		flushMouseLeave();
	}

	function handleFocus() {
		if (handlingFocusGuard) {
			handlingFocusGuard = false;
			return;
		}
		if (store.focused) return;

		// Only expand when the active element is focus-visible, so a click inside without
		// keyboard navigation does not keep the viewport expanded.
		if (matchesFocusVisible(activeElement(ownerDocument(store.viewport)))) {
			store.focused = true;
			store.pauseTimers();
		}
	}

	function handleBlur(event: FocusEvent) {
		if (!store.focused || contains(store.viewport, event.relatedTarget)) return;
		store.focused = false;
		if (!store.expandedOrOutOfFocus) store.resumeTimers();
	}

	function attachViewport(node: HTMLElement) {
		store.viewport = node;
		return () => {
			if (store.viewport === node) store.viewport = null;
		};
	}

	const state: ToastViewportState = $derived({ expanded: store.expanded });

	const hostProps = $derived(
		mergeProps(
			{
				tabindex: -1,
				role: 'region',
				'aria-live': 'polite' as const,
				'aria-atomic': 'false' as const,
				'aria-relevant': 'additions text' as const,
				'aria-label': 'Notifications',
				onmouseenter: handleMouseEnter,
				onmousemove: handleMouseEnter,
				onmouseleave: handleMouseLeave,
				onfocusin: handleFocus,
				onfocusout: handleBlur,
				onkeydown: handleKeyDown,
				onclick: handleFocus,
				onpointerdown: handlePointerDown,
				onpointerup: handlePointerEnd,
				onpointercancel: handlePointerEnd,
				style: toCssStyle({
					[ToastViewportCssVariables.frontmostHeight]: frontmostHeight
						? `${frontmostHeight}px`
						: undefined
				}),
				...getStateAttributesProps(state),
				[viewportKey]: attachViewport
			},
			elementProps
		)
	);
</script>

{#snippet content()}
	{#if showFocusGuards}<FocusGuard onfocus={handleFocusGuard} />{/if}
	{@render children?.()}
	{#if showFocusGuards}<FocusGuard onfocus={handleFocusGuard} />{/if}
{/snippet}

{#if showFocusGuards}<FocusGuard onfocus={handleFocusGuard} />{/if}
{#if render}
	{@render render(hostProps, state, content)}
{:else}
	<div {...hostProps}>{@render content()}</div>
{/if}
{#if !store.focused && highPriorityToasts.length > 0}
	<div style={visuallyHiddenStyle}>
		{#each highPriorityToasts as toast (toast.id)}
			<div role="alert" aria-atomic="true">
				<div><ToastText value={toast.title} /></div>
				<div><ToastText value={toast.description} /></div>
			</div>
		{/each}
	</div>
{/if}
