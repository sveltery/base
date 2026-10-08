<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { mergeProps } from '#lib/internal/mergeProps.js';
	import { createControllableValue } from '#lib/internal/controllable-value.svelte.js';
	import {
		CLICK_TRIGGER_IDENTIFIER,
		FloatingFocusManager,
		FloatingPortal,
		useClick,
		useDismiss
	} from '#lib/internal/floating-ui/index.js';
	import {
		popupTransitionStateMapping,
		PopupStore,
		triggerOpenStateMapping,
		useScrollLock
	} from '#lib/internal/popups/index.js';
	import type { PopupChangeEventDetails } from '#lib/internal/popups/index.js';
	import type { OpenInteractionType } from '#lib/internal/openInteraction.js';
	import { getStateAttributesProps } from '#lib/internal/state-attributes.js';

	let {
		scenario = 'modal' as
			| 'modal'
			| 'modeless'
			| 'cancel'
			| 'stuck'
			| 'drag'
			| 'return'
			| 'null-return'
			| 'fn-return'
			| 'close-type'
			| 'initial'
			| 'initial-skip',
		defaultOpen = false
	}: {
		scenario?:
			| 'modal'
			| 'modeless'
			| 'cancel'
			| 'stuck'
			| 'drag'
			| 'return'
			| 'null-return'
			| 'fn-return'
			| 'close-type'
			| 'initial'
			| 'initial-skip';
		defaultOpen?: boolean;
	} = $props();

	let open = $state<boolean | undefined>(undefined);
	let closeAttempts = 0;
	let calls = $state<{ open: boolean; reason: string; canceled: boolean }[]>([]);
	let statusLog = $state('[]');
	const seenStatuses: string[] = [];
	const modal = $derived(
		scenario !== 'modeless' &&
			scenario !== 'drag' &&
			scenario !== 'return' &&
			scenario !== 'null-return' &&
			scenario !== 'fn-return'
	);

	function focusReturn(kind: OpenInteractionType | null) {
		closeKind = kind ?? '';
		return true;
	}
	let explicit = $state<HTMLButtonElement | null>(null);
	let returnCalls = $state(0);

	function countReturn(_kind: OpenInteractionType | null) {
		returnCalls += 1;
		return explicit;
	}
	let chosen = $state<HTMLButtonElement | null>(null);
	let closeKind = $state('');
	let initialCalls = $state(0);
	let initialKind = $state('');
	let nudge = $state(0);

	function initialTarget(kind: OpenInteractionType) {
		void nudge;
		initialCalls += 1;
		initialKind = kind;
		if (scenario === 'initial-skip') return false;
		return chosen;
	}

	const openValue = createControllableValue<boolean>({
		getProp: () => open,
		setProp: (next) => {
			open = next;
		},
		getDefault: () => defaultOpen
	});

	function handleOpen(next: boolean, details: PopupChangeEventDetails<string>) {
		if (scenario === 'cancel') details.cancel();
		if (scenario === 'stuck' && !next) {
			closeAttempts += 1;
			if (closeAttempts === 1) {
				details.preventUnmountOnClose();
				details.cancel();
			}
		}
		calls.push({ open: next, reason: details.reason, canceled: details.isCanceled });
	}

	const store = new PopupStore<string>({
		open: openValue,
		floatingId: 'foundation-popup',
		floatingElement: 'popup',
		onOpenChange: () => handleOpen,
		onOpenChangeComplete: () => () => {},
		animateInitialOpen: false
	});

	const click = useClick(store, () => ({ enabled: true }));
	const dismiss = useDismiss(store, () => ({
		escapeKey: true,
		outsidePress:
			scenario === 'return' || scenario === 'null-return' || scenario === 'fn-return'
				? false
				: modal
					? false
					: true,
		outsidePressEvent:
			scenario === 'drag' ? ({ mouse: 'intentional', touch: 'sloppy' } as const) : 'sloppy'
	}));
	useScrollLock(() => ({
		enabled: modal && store.open,
		referenceElement: store.popupElement
	}));

	const triggerProps = $derived(
		mergeProps(
			dismiss.reference,
			click.reference,
			getStateAttributesProps({ open: store.open }, triggerOpenStateMapping),
			{ id: 'open-trigger', type: 'button', [CLICK_TRIGGER_IDENTIFIER]: '' }
		) as HTMLButtonAttributes
	);
	const popupProps = $derived(
		getStateAttributesProps(
			{ open: store.open, anchorHidden: false, transitionStatus: store.transitionStatus },
			popupTransitionStateMapping
		)
	);

	$effect(() => {
		const status = store.transitionStatus ?? 'rest';
		seenStatuses.push(status);
		statusLog = JSON.stringify(seenStatuses);
	});

	function bindPopup(node: HTMLElement) {
		store.popupElement = node;
		store.floatingElement = node;
		return () => {
			if (store.popupElement === node) store.popupElement = null;
			if (store.floatingElement === node) store.floatingElement = null;
		};
	}
</script>

<div
	data-testid="anchor"
	data-prevent-unmount={store.preventUnmountingOnClose ? '' : undefined}
	data-open-state={store.open ? 'open' : 'closed'}
>
	<button {...triggerProps}>Open</button>
	<button type="button" data-testid="explicit" bind:this={explicit}>Explicit</button>
	<button type="button" data-testid="other">Other</button>
	<button type="button" data-testid="nudge" onclick={() => (nudge += 1)}>Nudge</button>
	<div data-testid="outside">Outside</div>
	<pre data-testid="calls">{JSON.stringify(calls)}</pre>
	<pre data-testid="close-kind">{closeKind}</pre>
	<pre data-testid="initial-calls">{initialCalls}</pre>
	<pre data-testid="initial-kind">{initialKind}</pre>
	<pre data-testid="return-calls">{returnCalls}</pre>
	<pre data-testid="statuses">{statusLog}</pre>
	{#if store.mounted}
		<FloatingPortal {store}>
			<FloatingFocusManager
				{store}
				{modal}
				initialFocus={scenario === 'initial' || scenario === 'initial-skip' ? initialTarget : true}
				returnFocus={scenario === 'return'
					? explicit
					: scenario === 'null-return'
						? null
						: scenario === 'fn-return'
							? countReturn
							: scenario === 'close-type'
								? focusReturn
								: true}
			>
				<div
					role="dialog"
					aria-labelledby="popup-title"
					tabindex="-1"
					data-testid="popup"
					{...popupProps}
					{@attach bindPopup}
				>
					<h2 id="popup-title">Notice</h2>
					<button type="button">Inside</button>
					<button type="button" data-testid="chosen" bind:this={chosen}>Chosen</button>
				</div>
			</FloatingFocusManager>
		</FloatingPortal>
	{/if}
</div>
