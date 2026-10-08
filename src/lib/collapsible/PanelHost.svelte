<!--
	Shared panel host for Collapsible and Accordion. Renders a `<div>`.
	Derived from Base UI v1.8.0 packages/react/src/collapsible/panel/CollapsiblePanel.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts" generics="State extends object">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { mergeCssStyle } from '../internal/css-style.js';
	import {
		getStateAttributesProps,
		type StateAttributesMapping
	} from '../internal/state-attributes.js';
	import { startingStyle } from './attributes.js';
	import { useCollapsibleRootContext } from './context.svelte.js';
	import { CollapsiblePanelMotion } from './panel-motion.svelte.js';
	import type { TransitionStatus } from './types.js';
	import { devWarn } from './warn.js';

	type HostProps = HTMLAttributes<HTMLDivElement> & { hidden?: boolean | 'until-found' };

	let {
		hiddenUntilFound = false,
		keepMounted = false,
		id,
		style,
		warnWhen = false,
		warnMessage,
		dimensionStyle,
		attributes,
		buildState,
		extra = {},
		elementProps,
		render,
		children
	}: {
		hiddenUntilFound?: boolean;
		keepMounted?: boolean;
		id?: string | null;
		style?: string | null;
		warnWhen?: boolean;
		warnMessage: string;
		dimensionStyle: (height: number | undefined, width: number | undefined) => string;
		attributes: StateAttributesMapping<State>;
		buildState: (status: TransitionStatus) => State;
		extra?: HTMLAttributes<HTMLDivElement>;
		elementProps: HTMLAttributes<HTMLDivElement>;
		render?: Snippet<[HostProps, State, Snippet]>;
		children?: Snippet;
	} = $props();

	const root = useCollapsibleRootContext();
	const motion = new CollapsiblePanelMotion(root);
	const attachmentKey = createAttachmentKey();
	const registeredId = $derived(id ? id : undefined);
	const panelId = $derived(registeredId ?? root.defaultPanelId);

	$effect(() => {
		if (!warnWhen) return;
		devWarn(warnMessage);
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
	const persistHidden = $derived(
		hiddenUntilFound && hidden && motion.animationType !== 'css-animation'
	);
	const state: State = $derived(buildState(motion.panelStatus));

	const hostProps: HostProps = $derived.by(() => {
		const hiddenValue: boolean | 'until-found' | undefined =
			hiddenUntilFound && hidden ? 'until-found' : hidden ? true : undefined;
		const props: HostProps = {
			id: panelId,
			...extra,
			...elementProps,
			...getStateAttributesProps(state, attributes),
			...(persistHidden ? { [startingStyle]: '' } : {}),
			hidden: hiddenValue,
			[attachmentKey]: motion.attach
		};
		const css = [
			dimensionStyle(motion.renderedHeight, motion.renderedWidth),
			style ?? undefined,
			motion.shouldPreventOpenAnimation ? 'animation-name:none' : undefined
		].reduce<string | undefined>((base, part) => mergeCssStyle(base, part), undefined);
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
