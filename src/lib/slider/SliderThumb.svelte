<!--
	The draggable part of the slider at the tip of the indicator.
	Renders a `<div>` element and a nested `<input type="range">`.
	Derived from Base UI v1.8.0 packages/react/src/slider/thumb/SliderThumb.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	There is no inputRef. The input is in the DOM. Pass `{@attach}` to this part for the thumb.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { Attachment } from 'svelte/attachments';
	import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';
	import { useFieldContext } from '../field/context.svelte.js';
	import { useLabelableContext } from '../field/labelable.svelte.js';
	import { formatNumber } from '../internal/formatNumber.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { valueToPercent } from '../internal/valueToPercent.js';
	import { visuallyHidden } from '../internal/visuallyHidden.js';
	import { sliderStateAttributes } from './attributes.js';
	import { useSliderContext } from './context.svelte.js';
	import { ownerWindow } from '../internal/owner.js';
	import { prehydrationScript } from './prehydration.js';
	import { mergeCssStyle, toCssStyle } from '../internal/css-style.js';
	import type { SliderRootState, SliderThumbProps } from './types.js';

	function defaultAriaValueText(
		sliderValues: readonly number[],
		thumbIndex: number,
		format: Intl.NumberFormatOptions | undefined,
		locale: Intl.LocalesArgument | undefined
	) {
		if (thumbIndex < 0 || !Number.isFinite(sliderValues[thumbIndex])) return undefined;
		if (sliderValues.length === 2) {
			return `${formatNumber(sliderValues[thumbIndex], locale, format)} ${thumbIndex === 0 ? 'start' : 'end'} range`;
		}
		return format ? formatNumber(sliderValues[thumbIndex], locale, format) : undefined;
	}

	const uid = $props.id();
	const elementKey = createAttachmentKey();

	let {
		disabled: disabledProp = false,
		getAriaLabel,
		getAriaValueText,
		index: indexProp,
		id: idProp,
		render,
		children,
		style,
		onblur,
		onfocus,
		onkeydown,
		onpointerdown,
		'aria-describedby': ariaDescribedByProp,
		'aria-label': ariaLabelProp,
		'aria-labelledby': ariaLabelledByProp,
		'aria-valuetext': ariaValueTextProp,
		tabindex,
		...elementProps
	}: SliderThumbProps = $props();

	const model = useSliderContext();
	const field = useFieldContext();
	const labelable = useLabelableContext(true);

	let thumbEl: HTMLDivElement | null = $state(null);
	let inputEl: HTMLInputElement | null = $state(null);
	let positionPercent: number | undefined = $state(undefined);

	const generatedInputId = $derived(`base-ui-${uid}`);
	const inputId = $derived(
		model.range ? generatedInputId : labelable?.controlId || generatedInputId
	);
	const thumbId = $derived(idProp || `base-ui-${uid}-thumb`);
	const position = $derived(model.positionOf(thumbEl));
	const index = $derived(!model.range ? 0 : (indexProp ?? position));
	const values = $derived(model.values);
	const last = $derived(index >= 0 && index === values.length - 1);
	const thumbValue = $derived(values[index]);
	const percent = $derived(
		Number.isFinite(thumbValue) ? valueToPercent(thumbValue, model.min, model.max) : Number.NaN
	);
	const disabled = $derived(model.disabled || disabledProp);
	const partState: SliderRootState = $derived(model.snapshot());

	function remember(node: HTMLDivElement) {
		thumbEl = node;
		return () => {
			if (thumbEl === node) thumbEl = null;
		};
	}

	$effect(() => {
		const element = thumbEl;
		if (!element) return;
		model.trackElement(element);
		return () => model.untrackElement(element);
	});

	$effect(() => {
		const element = thumbEl;
		if (!element || index < 0) return;
		model.syncThumb(element, inputId, index);
	});

	$effect(() => {
		const input = inputEl;
		if (!input || index < 0) return;
		model.noteInput(input, index);
	});

	function measureInset(percentValue: number, thumbIndex: number, isLast: boolean) {
		if (!model.inset || thumbIndex < 0) return;
		const control = model.control;
		const thumb = thumbEl;
		if (!control || !thumb || !Number.isFinite(percentValue)) return;
		const thumbRect = thumb.getBoundingClientRect();
		const controlRect = control.getBoundingClientRect();
		const side = model.vertical ? 'height' : 'width';
		const controlSize = controlRect[side] - thumbRect[side];
		const thumbOffset = thumbRect[side] / 2 + (controlSize * percentValue) / 100;
		const next = (thumbOffset / controlRect[side]) * 100;
		const positionValue = Number.isFinite(next) ? next : undefined;
		positionPercent = positionValue;
		model.setIndicatorEdge(thumbIndex, isLast, positionValue);
	}

	$effect(() => {
		if (!model.inset) return;
		const percentValue = percent;
		const thumbIndex = index;
		const isLast = last;
		const run = () => measureInset(percentValue, thumbIndex, isLast);
		queueMicrotask(run);
		run();
	});

	$effect(() => {
		if (!model.inset) return;
		const control = model.control;
		const thumb = thumbEl;
		if (!control || !thumb) return;
		const Observer = ownerWindow(control).ResizeObserver;
		if (typeof Observer !== 'function') return;
		const observer = new Observer(() => measureInset(percent, index, last));
		observer.observe(control);
		observer.observe(thumb);
		return () => observer.disconnect();
	});

	const thumbStyle = $derived.by(() => {
		const rtl = model.direction === 'rtl';
		const vertical = model.vertical;
		const safeLast =
			model.lastUsedThumbIndex >= 0 && model.lastUsedThumbIndex < values.length
				? model.lastUsedThumbIndex
				: -1;
		let zIndex: number | undefined;
		if (model.range) {
			if (model.active === index) zIndex = 2;
			else if (safeLast === index) zIndex = 1;
		} else if (model.active === index) zIndex = 1;

		if (!model.inset && !Number.isFinite(percent)) return toCssStyle(visuallyHidden);

		const startEdge = vertical ? 'bottom' : 'insetInlineStart';
		const cross = vertical ? 'left' : 'top';
		const hidden =
			model.inset &&
			((model.renderBeforeHydration && model.hydrating) || positionPercent === undefined);
		return toCssStyle({
			position: 'absolute',
			[startEdge]: model.inset ? 'var(--position)' : `${percent}%`,
			[cross]: '50%',
			translate: `${(vertical || !rtl ? -1 : 1) * 50}% ${(vertical ? 1 : -1) * 50}%`,
			zIndex,
			...(model.inset ? { '--position': `${positionPercent ?? 0}%` } : {}),
			...(hidden ? { visibility: 'hidden' } : {})
		});
	});

	const writingMode = $derived(
		model.vertical ? (model.direction === 'rtl' ? 'vertical-rl' : 'vertical-lr') : undefined
	);
	const inputStyle = $derived(
		toCssStyle({
			...visuallyHidden,
			width: '100%',
			height: '100%',
			writingMode
		})
	);

	const ariaLabel = $derived(
		typeof getAriaLabel === 'function' ? getAriaLabel(index) : ariaLabelProp
	);
	const formatted = $derived(
		Number.isFinite(thumbValue) ? formatNumber(thumbValue, model.locale, model.format) : ''
	);
	const ariaValueText = $derived.by(() => {
		if (typeof getAriaValueText === 'function') {
			return getAriaValueText(formatted, thumbValue, index);
		}
		if (ariaValueTextProp != null) return ariaValueTextProp;
		return defaultAriaValueText(values, index, model.format, model.locale);
	});
	const describedBy = $derived(labelable?.describedBy(ariaDescribedByProp || undefined));
	const labelledBy = $derived(
		ariaLabelledByProp ?? (ariaLabel == null ? model.linkedLabel : undefined)
	);

	function handleInput(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		model.handleInputChange(event.currentTarget.valueAsNumber, index, event);
	}

	function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		if (model.onThumbFocus(event, index)) return;
		onfocus?.(event);
	}

	function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		if (model.onThumbBlur(event, index)) return;
		onblur?.(event);
	}

	function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		onkeydown?.(event);
		if (event.defaultPrevented) return;
		model.onThumbKeyDown(event, index);
	}

	function handlePointerDown(
		event: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }
	) {
		onpointerdown?.(event);
		if (event.defaultPrevented) return;
		model.onThumbPointerDown(event, index);
	}

	const inputProps: HTMLInputAttributes = $derived({
		...(ariaLabel != null ? { 'aria-label': ariaLabel } : {}),
		...(labelledBy ? { 'aria-labelledby': labelledBy } : {}),
		...(describedBy ? { 'aria-describedby': describedBy } : {}),
		'aria-orientation': model.vertical ? 'vertical' : 'horizontal',
		...(Number.isFinite(thumbValue) ? { 'aria-valuenow': thumbValue } : {}),
		...(ariaValueText != null ? { 'aria-valuetext': ariaValueText } : {}),
		disabled,
		...(model.formId ? { form: model.formId } : {}),
		id: inputId,
		max: model.max,
		min: model.min,
		...(model.linkedName ? { name: model.linkedName } : {}),
		step: model.step,
		style: inputStyle,
		tabindex,
		type: 'range',
		value: Number.isFinite(thumbValue) ? thumbValue : '',
		oninput: handleInput,
		onfocus: handleFocus,
		onblur: handleBlur,
		onkeydown: handleKeyDown,
		...(partState.valid === false && !field.disabled && !disabled
			? { 'aria-invalid': true as const }
			: {})
	});

	const hostProps: HTMLAttributes<HTMLDivElement> & Record<symbol, Attachment<HTMLDivElement>> =
		$derived.by(() => {
			const props: HTMLAttributes<HTMLDivElement> & Record<symbol, Attachment<HTMLDivElement>> = {
				...elementProps,
				...getStateAttributesProps(partState, sliderStateAttributes),
				id: thumbId,
				...(index >= 0 ? { 'data-index': String(index) } : {}),
				style: mergeCssStyle(thumbStyle, style),
				onpointerdown: handlePointerDown,
				[elementKey]: remember
			};
			return props;
		});

	const showScript = $derived(model.inset && model.renderBeforeHydration && last);
</script>

{#snippet content()}
	{@render children?.()}
	<input {...inputProps} bind:this={inputEl} />
	{#if showScript}
		<!-- Upstream's edge-alignment script. The string is static and contains no user input. -->
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html '<script>' + prehydrationScript + '</scr' + 'ipt>'}
	{/if}
{/snippet}

{#if render}
	{@render render(hostProps, partState, content)}
{:else}
	<div {...hostProps} bind:this={thumbEl}>{@render content()}</div>
{/if}
