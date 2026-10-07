<!--
	A panel with the collapsible contents. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/collapsible/panel/CollapsiblePanel.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { collapsibleStateAttributesMapping, startingStyle } from './attributes.js';
	import { useCollapsibleRootContext } from './context.svelte.js';
	import { dimensionStyle, joinStyles } from './motion.js';
	import { CollapsiblePanelMotion } from './panel-motion.svelte.js';
	import type { CollapsiblePanelProps, CollapsiblePanelState } from './types.js';
	import { devWarn } from './warn.js';

	let {
		hiddenUntilFound = false,
		keepMounted: keepMountedProp,
		id,
		style,
		render,
		children,
		...elementProps
	}: CollapsiblePanelProps = $props();

	const root = useCollapsibleRootContext();
	const motion = new CollapsiblePanelMotion(root);
	const attachmentKey = createAttachmentKey();
	const keepMounted = $derived(keepMountedProp ?? false);
	const registeredId = $derived(id ? id : undefined);
	const panelId = $derived(registeredId ?? root.defaultPanelId);

	$effect(() => {
		if (hiddenUntilFound && keepMountedProp === false) {
			devWarn(
				'The `keepMounted={false}` prop on `Collapsible.Panel` is ignored when `hiddenUntilFound` is enabled, since the panel must remain mounted while closed.'
			);
		}
	});

	$effect(() => {
		const current = registeredId;
		root.registerPanel(current);
		return () => root.unregisterPanel(current);
	});

	// Svelte may booleanize `hidden`. Page search needs the string value `until-found`.
	$effect(() => {
		const element = motion.panel;
		if (!element || !hiddenUntilFound) return;
		if (hidden) element.setAttribute('hidden', 'until-found');
		else element.removeAttribute('hidden');
	});

	const hidden = $derived(!root.open && !root.mounted);
	const shouldRender = $derived(keepMounted || hiddenUntilFound || root.mounted || root.open);
	const shouldPersistHiddenTransitionStyles = $derived(
		hiddenUntilFound && hidden && motion.animationType !== 'css-animation'
	);

	const state: CollapsiblePanelState = $derived({
		open: root.open,
		disabled: root.disabled,
		transitionStatus: motion.panelStatus
	});

	const hostProps: HTMLAttributes<HTMLDivElement> & { hidden?: boolean | 'until-found' } =
		$derived.by(() => {
			const hiddenValue: boolean | 'until-found' | undefined =
				hiddenUntilFound && hidden ? 'until-found' : hidden ? true : undefined;
			const props: HTMLAttributes<HTMLDivElement> & { hidden?: boolean | 'until-found' } = {
				id: panelId,
				...elementProps,
				...getStateAttributesProps(state, collapsibleStateAttributesMapping),
				...(shouldPersistHiddenTransitionStyles ? { [startingStyle]: '' } : {}),
				hidden: hiddenValue,
				[attachmentKey]: motion.attach
			};
			const css = joinStyles(
				dimensionStyle(motion.renderedHeight, motion.renderedWidth),
				style ?? undefined,
				motion.shouldPreventOpenAnimation ? 'animation-name:none' : undefined
			);
			if (css !== undefined) props.style = css;
			return props;
		});
</script>

{#snippet content()}
	{@render children?.()}
{/snippet}

{#if shouldRender}
	{#if render}
		{@render render(hostProps, state, content)}
	{:else}
		<div {...hostProps}>{@render content()}</div>
	{/if}
{/if}
