<!--
	Groups all parts of an individual toast. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/toast/root/ToastRoot.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	The root writes its element into the toast as `element` (upstream `ref`), with its height.
-->
<script lang="ts">
	import { flushSync, untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import { activeElement, contains, ownerDocument } from '@sveltery/utils';
	import { toCssStyle } from '../internal/css-style.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import {
		getStateAttributesProps,
		transitionStatusMapping,
		type StateAttributesMapping
	} from '../internal/state-attributes.js';
	import { useOpenChangeComplete } from '../internal/useOpenChangeComplete.svelte.js';
	import { ToastRootCssVariables, ToastRootDataAttributes } from './constants.js';
	import { setToastRoot, useToastStore, type ToastRootContext } from './context.js';
	import { ToastSwipe } from './swipe.svelte.js';
	import type { ToastRootProps, ToastRootState, ToastSwipeDirection } from './types.js';

	const stateAttributesMapping: StateAttributesMapping<ToastRootState> = {
		...transitionStatusMapping,
		swipeDirection(value) {
			return value ? { [ToastRootDataAttributes.swipeDirection]: value } : null;
		}
	};

	let {
		toast,
		swipeDirection = ['down', 'right'],
		render,
		children,
		...elementProps
	}: ToastRootProps = $props();

	const store = useToastStore();
	const rootKey = createAttachmentKey();
	const touchKey = createAttachmentKey();

	let root = $state<HTMLElement | null>(null);
	let titleElementId = $state<string>();
	let descriptionElementId = $state<string>();

	const isAnchored = $derived(toast.positionerProps?.anchor !== undefined);
	const swipeDirections: ToastSwipeDirection[] = $derived.by(() => {
		if (isAnchored) return [];
		return Array.isArray(swipeDirection) ? swipeDirection : [swipeDirection];
	});
	const swipeEnabled = $derived(swipeDirections.length > 0);

	const domIndex = $derived(store.toastIndex(toast.id));
	const visibleIndex = $derived(store.toastVisibleIndex(toast.id));
	const offsetY = $derived(store.toastOffsetY(toast.id));
	const open = $derived(toast.transitionStatus !== 'ending');

	const swipe = new ToastSwipe(() => ({
		directions: swipeDirections,
		pauseTimers: () => store.pauseTimers(),
		press: () => {
			store.hovering = true;
		},
		dismiss: () => store.closeToast(toast.id)
	}));

	$effect(() => () => swipe.dispose());

	useOpenChangeComplete(() => ({
		open,
		element: root,
		onComplete() {
			if (toast.transitionStatus === 'ending') store.removeToast(toast.id);
		}
	}));

	// Measures the natural height and writes it, with the element, to the store.
	// `flush` avoids visual flickers when called from observer callbacks.
	// The store ignores this write while the toast is transitioning out.
	function recalculateHeight(flush = false) {
		const element = root;
		if (!element) return;

		const previousHeight = element.style.height;
		element.style.height = 'auto';
		const height = element.offsetHeight;
		element.style.height = previousHeight;

		const update = () =>
			store.updateToastInternal(toast.id, { element, height, transitionStatus: undefined });

		if (flush) flushSync(update);
		else update();
	}

	// Initialize the toast on mount, and again when it begins a new lifecycle: re-adding an
	// ending toast keeps the same root in a list keyed by id, and an unkeyed list can hand this
	// root a different toast. The store owns the toast, so there is no commit path here to hook.
	const toastId = $derived(toast.id);
	const starting = $derived(toast.transitionStatus === 'starting');
	let initializedId: string | undefined;
	$effect(() => {
		const id = toastId;
		const isStarting = starting;
		if (!root) return;
		untrack(() => {
			// `recalculateHeight` clears `starting` itself, so skip the resulting re-run and the
			// later `ending` one, which the store discards anyway.
			if (!isStarting && initializedId === id) return;
			// A reused root keeps swipe state from its previous lifecycle. Clear it so the toast
			// doesn't stay offset or exit in the swiped direction.
			if (initializedId !== undefined) swipe.reset();
			initializedId = id;
			recalculateHeight();
		});
	});

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key !== 'Escape') return;
		if (!root || !contains(root, activeElement(ownerDocument(root)))) return;
		store.closeToast(toast.id);
	}

	function attachRoot(node: HTMLElement) {
		root = node;
		return () => {
			if (root === node) root = null;
		};
	}

	const isHighPriority = $derived(toast.priority === 'high');

	const rootContext: ToastRootContext = {
		get toast() {
			return toast;
		},
		get visibleIndex() {
			return visibleIndex;
		},
		get expanded() {
			return store.expanded;
		},
		get titleElementId() {
			return titleElementId;
		},
		set titleElementId(id) {
			titleElementId = id;
		},
		get descriptionElementId() {
			return descriptionElementId;
		},
		set descriptionElementId(id) {
			descriptionElementId = id;
		},
		recalculateHeight
	};
	setToastRoot(rootContext);

	const rootState: ToastRootState = $derived({
		transitionStatus: toast.transitionStatus,
		expanded: store.expanded,
		limited: toast.limited || false,
		type: toast.type,
		swiping: swipe.swiping,
		swipeDirection: swipe.direction
	});

	const hostProps = $derived(
		mergeProps(
			{
				role: isHighPriority ? 'alertdialog' : 'dialog',
				tabindex: 0,
				'aria-modal': 'false' as const,
				'aria-labelledby': titleElementId,
				'aria-describedby': descriptionElementId,
				'aria-hidden': isHighPriority && !store.focused ? ('true' as const) : undefined,
				onpointerdown: swipeEnabled ? swipe.pointerdown : undefined,
				onpointermove: swipeEnabled ? swipe.pointermove : undefined,
				onpointerup: swipeEnabled ? swipe.end : undefined,
				onpointercancel: swipeEnabled ? swipe.end : undefined,
				onkeydown: handleKeyDown,
				inert: toast.limited ? true : undefined,
				style: toCssStyle({
					...swipe.style,
					[ToastRootCssVariables.index]:
						toast.transitionStatus === 'ending' ? domIndex : visibleIndex,
					[ToastRootCssVariables.offsetY]: `${offsetY}px`,
					[ToastRootCssVariables.height]: toast.height ? `${toast.height}px` : undefined
				}),
				...getStateAttributesProps(rootState, stateAttributesMapping),
				[rootKey]: attachRoot,
				...(swipeEnabled ? { [touchKey]: swipe.blockTouchScroll } : {})
			},
			elementProps
		)
	);
</script>

{#if render}
	{@render render(hostProps, rootState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
