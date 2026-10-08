// Shared panel host for Collapsible and Accordion.
// Derived from Base UI v1.8.0 packages/react/src/collapsible/panel/CollapsiblePanel.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { createAttachmentKey } from 'svelte/attachments';
import type { HTMLAttributes } from 'svelte/elements';
import { mergeCssStyle } from '../internal/css-style.js';
import {
	getStateAttributesProps,
	type StateAttributesMapping
} from '../internal/state-attributes.js';
import { startingStyle } from './attributes.js';
import type { CollapsibleRoot } from './context.svelte.js';
import { CollapsiblePanelMotion } from './panel-motion.svelte.js';
import { devWarn } from './warn.js';

export interface PanelShellConfig<State extends object> {
	root: CollapsibleRoot;
	hiddenUntilFound: () => boolean;
	keepMounted: () => boolean;
	registeredId: () => string | undefined;
	style: () => string | null | undefined;
	elementProps: () => HTMLAttributes<HTMLDivElement>;
	warnWhen: () => boolean;
	warnMessage: string;
	dimension: (motion: CollapsiblePanelMotion) => string;
	state: (motion: CollapsiblePanelMotion) => State;
	attributes: StateAttributesMapping<State>;
	extraProps: () => HTMLAttributes<HTMLDivElement>;
}

export class PanelShell<State extends object> {
	readonly motion: CollapsiblePanelMotion;
	readonly attachmentKey = createAttachmentKey();
	private readonly config: PanelShellConfig<State>;

	constructor(config: PanelShellConfig<State>) {
		this.config = config;
		this.motion = new CollapsiblePanelMotion(config.root);

		$effect(() => {
			if (!config.warnWhen()) return;
			devWarn(config.warnMessage);
		});

		$effect(() => {
			const current = config.registeredId();
			config.root.registerPanel(current);
			return () => config.root.unregisterPanel(current);
		});

		$effect(() => {
			const element = this.motion.panel;
			if (!element || !config.hiddenUntilFound()) return;
			if (this.hidden) element.setAttribute('hidden', 'until-found');
			else element.removeAttribute('hidden');
		});
	}

	get hidden() {
		return !this.config.root.open && !this.config.root.mounted;
	}

	get shouldRender() {
		return (
			this.config.keepMounted() ||
			this.config.hiddenUntilFound() ||
			this.config.root.mounted ||
			this.config.root.open
		);
	}

	private get persistHiddenTransition() {
		return (
			this.config.hiddenUntilFound() && this.hidden && this.motion.animationType !== 'css-animation'
		);
	}

	get state(): State {
		return this.config.state(this.motion);
	}

	get hostProps(): HTMLAttributes<HTMLDivElement> & { hidden?: boolean | 'until-found' } {
		const hidden = this.hidden;
		const hiddenUntilFound = this.config.hiddenUntilFound();
		const hiddenValue: boolean | 'until-found' | undefined =
			hiddenUntilFound && hidden ? 'until-found' : hidden ? true : undefined;
		const props: HTMLAttributes<HTMLDivElement> & { hidden?: boolean | 'until-found' } = {
			id: this.config.registeredId() ?? this.config.root.defaultPanelId,
			...this.config.extraProps(),
			...this.config.elementProps(),
			...getStateAttributesProps(this.state, this.config.attributes),
			...(this.persistHiddenTransition ? { [startingStyle]: '' } : {}),
			hidden: hiddenValue,
			[this.attachmentKey]: this.motion.attach
		};
		const css = [
			this.config.dimension(this.motion),
			this.config.style() ?? undefined,
			this.motion.shouldPreventOpenAnimation ? 'animation-name:none' : undefined
		].reduce<string | undefined>((base, part) => mergeCssStyle(base, part), undefined);
		if (css !== undefined) props.style = css;
		return props;
	}
}
