<!--
	An interactive area where the user can click and drag to change the field value.
	Renders a `<span>` element.
	Derived from Base UI v1.9.0 packages/react/src/number-field/scrub-area/NumberFieldScrubArea.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	The virtual cursor is portaled by NumberField.ScrubAreaCursor. This is not a floating overlay.
-->
<script lang="ts">
	import { flushSync } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		createGenericEventDetails,
		REASONS,
		ownerDocument,
		ownerWindow,
		platform,
		ScopedTimeout,
		getTarget
	} from '@sveltery/utils';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { numberFieldStateAttributes } from './attributes.js';
	import { ScrubAreaState, setScrubAreaContext, useNumberFieldContext } from './context.svelte.js';
	import { on } from 'svelte/events';
	import { mergeCssStyle } from '../internal/css-style.js';
	import type { NumberFieldScrubAreaProps, NumberFieldScrubAreaState } from './types.js';
	import { getViewportRect } from './viewport.js';

	const SCRUB_STYLE = 'touch-action: none; -webkit-user-select: none; user-select: none';
	const elementKey = createAttachmentKey();

	let {
		direction = 'horizontal',
		pixelSensitivity = 2,
		teleportDistance,
		render,
		children,
		style,
		onpointerdown,
		onclickcapture,
		...elementProps
	}: NumberFieldScrubAreaProps = $props();

	const model = useNumberFieldContext();
	const scrub = new ScrubAreaState();
	setScrubAreaContext(scrub);

	let areaEl: HTMLElement | null = $state(null);
	let scrubbingActive = false;
	let didMove = false;
	let pointerDownTarget: EventTarget | null = null;
	let nativeClickReceived = false;
	const cursorPoint = { x: 0, y: 0 };
	const exitTimer = new ScopedTimeout();
	const syntheticClickTimer = new ScopedTimeout();

	const scrubState: NumberFieldScrubAreaState = $derived(model.state);

	function remember(node: HTMLElement) {
		areaEl = node;
		return () => {
			if (areaEl === node) areaEl = null;
		};
	}

	function updateCursorTransform(cursor: HTMLElement, x: number, y: number) {
		const scale = ownerWindow(cursor).visualViewport?.scale ?? 1;
		cursor.style.transform = `translate3d(${x}px,${y}px,0) scale(${1 / scale})`;
	}

	function positionCursor(event: PointerEvent) {
		const cursor = scrub.cursor;
		const area = areaEl;
		if (!cursor || !area) return;
		const rect = getViewportRect(teleportDistance, area);
		const wrap = (coord: number, half: number, low: number, high: number) => {
			if (coord + half < low) return high - half;
			if (coord + half > high) return low - half;
			return coord;
		};
		const next = {
			x: wrap(
				Math.round(cursorPoint.x + event.movementX),
				cursor.offsetWidth / 2,
				rect.left,
				rect.right
			),
			y: wrap(
				Math.round(cursorPoint.y + event.movementY),
				cursor.offsetHeight / 2,
				rect.top,
				rect.bottom
			)
		};
		cursorPoint.x = next.x;
		cursorPoint.y = next.y;
		updateCursorTransform(cursor, next.x, next.y);
	}

	function onScrubbingChange(next: boolean, event: PointerEvent) {
		flushSync(() => {
			scrub.scrubbing = next;
			model.scrubbing = next;
		});
		const cursor = scrub.cursor;
		if (!cursor || !next) return;
		cursorPoint.x = event.clientX - cursor.offsetWidth / 2;
		cursorPoint.y = event.clientY - cursor.offsetHeight / 2;
		updateCursorTransform(cursor, cursorPoint.x, cursorPoint.y);
	}

	function finishScrub(event: PointerEvent) {
		try {
			ownerDocument(areaEl).exitPointerLock();
		} catch {
			// Pointer lock may already be gone.
		} finally {
			scrubbingActive = false;
			onScrubbingChange(false, event);
			model.commit(
				model.lastChangedValue ?? model.baseValue,
				createGenericEventDetails(REASONS.scrub, event)
			);
			// A locked pointer sends its click to the lock element, so dispatch one here. Without a
			// lock (WebKit, or a denied request) the native click follows pointerup in the same task,
			// so wait one task and dispatch only if it never reached the scrub area.
			const target = pointerDownTarget;
			const input = model.inputElement;
			if (!didMove && target != null && input) {
				const view = ownerWindow(input) as Window & { MouseEvent: typeof MouseEvent };
				syntheticClickTimer.start(0, () => {
					if (nativeClickReceived) return;
					target.dispatchEvent(new view.MouseEvent('click', { bubbles: true, cancelable: true }));
				});
			}
			didMove = false;
			pointerDownTarget = null;
		}
	}

	$effect(() => {
		const input = model.inputElement;
		const active = scrub.scrubbing;
		const disabled = model.options.getDisabled();
		const readOnly = model.options.getReadOnly();
		const axis = direction;
		const sensitivity = pixelSensitivity;
		if (!input || disabled || readOnly || !active) return;

		let cumulativeDelta = 0;

		function handlePointerUp(event: PointerEvent) {
			if (platform.engine.gecko) exitTimer.start(20, () => finishScrub(event));
			else finishScrub(event);
		}

		function handlePointerMove(event: PointerEvent) {
			if (!scrubbingActive) return;
			event.preventDefault();
			positionCursor(event);
			const { movementX, movementY } = event;
			cumulativeDelta += axis === 'vertical' ? movementY : movementX;
			if (Math.abs(cumulativeDelta) < sensitivity) return;
			cumulativeDelta = 0;
			didMove = true;
			const delta = axis === 'vertical' ? -movementY : movementX;
			const raw = delta * model.getStepAmount(event);
			if (raw === 0) return;
			model.followInputValue();
			model.incrementValue(Math.abs(raw), {
				direction: raw >= 0 ? 1 : -1,
				event,
				reason: REASONS.scrub
			});
		}

		const view = ownerWindow(input);
		const stopUp = on(view, 'pointerup', handlePointerUp, { capture: true });
		const stopMove = on(view, 'pointermove', handlePointerMove, { capture: true });
		return () => {
			exitTimer.clear();
			stopUp();
			stopMove();
		};
	});

	$effect(() => {
		return () => {
			if (!scrubbingActive) return;
			scrubbingActive = false;
			model.scrubbing = false;
			scrub.scrubbing = false;
			try {
				ownerDocument(areaEl).exitPointerLock();
			} catch {
				// Pointer lock may already be gone.
			}
		};
	});

	$effect(() => {
		const element = areaEl;
		if (!element || model.options.getDisabled() || model.options.getReadOnly()) return;
		return on(element, 'touchstart', (event) => {
			if (event.touches.length === 1) event.preventDefault();
		});
	});

	async function handlePointerDown(
		event: PointerEvent & { currentTarget: EventTarget & HTMLSpanElement }
	) {
		if (
			event.defaultPrevented ||
			model.options.getReadOnly() ||
			event.button ||
			model.options.getDisabled()
		) {
			return;
		}
		onpointerdown?.(event);
		if (event.defaultPrevented) return;

		const touch = event.pointerType === 'touch';
		scrub.touchInput = touch;
		scrub.pointerLockDenied = false;
		if (event.pointerType === 'mouse') {
			event.preventDefault();
			model.focusInput();
		}
		scrubbingActive = true;
		didMove = false;
		nativeClickReceived = false;
		syntheticClickTimer.clear();
		pointerDownTarget = getTarget(event);
		onScrubbingChange(true, event);

		if (touch || platform.engine.webkit) return;
		try {
			await ownerDocument(areaEl).body.requestPointerLock();
			scrub.pointerLockDenied = false;
		} catch {
			scrub.pointerLockDenied = true;
		} finally {
			if (scrubbingActive) onScrubbingChange(true, event);
		}
	}

	function handleClickCapture(
		event: MouseEvent & { currentTarget: EventTarget & HTMLSpanElement }
	) {
		onclickcapture?.(event);
		nativeClickReceived = true;
	}

	const hostProps: HTMLAttributes<HTMLSpanElement> = $derived({
		role: 'presentation',
		style: mergeCssStyle(SCRUB_STYLE, style),
		...getStateAttributesProps(scrubState, numberFieldStateAttributes),
		...elementProps,
		onpointerdown: handlePointerDown,
		onclickcapture: handleClickCapture,
		[elementKey]: remember
	});
</script>

{#if render}
	{@render render(hostProps, scrubState, children)}
{:else}
	<span {...hostProps}>{@render children?.()}</span>
{/if}
