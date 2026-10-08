<!--
	Groups all parts of the slider.
	Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/slider/root/SliderRoot.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	There is no ref. Field registration uses the thumb input element.
-->
<script lang="ts">
	import { DEV } from 'esm-env';
	import { onMount, untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import type { Attachment } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useFieldContext } from '../field/context.svelte.js';
	import { useLabelableContext } from '../field/labelable.svelte.js';
	import { useFormContext } from '../form/context.js';
	import { clamp } from '../internal/clamp.js';
	import { createControllableValue } from '../internal/controllable-value.svelte.js';
	import { useDirection } from '../internal/direction-context.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { asc } from './asc.js';
	import { sliderStateAttributes } from './attributes.js';
	import { setSliderContext } from './context.svelte.js';
	import { ownerDocument } from '../internal/owner.js';
	import { activeElement, contains } from '../internal/shadow-dom.js';
	import { areArraysEqual } from './getSliderValue.js';
	import { SliderRootModel } from './model.svelte.js';
	import type { SliderRootProps, SliderRootState, SliderValue } from './types.js';

	const uid = $props.id();
	const fieldSource = Symbol('slider-field');
	const elementKey = createAttachmentKey();

	let {
		id: idProp,
		defaultValue,
		disabled: disabledProp = false,
		format,
		locale,
		max = 100,
		min = 0,
		minStepsBetweenValues = 0,
		name: nameProp,
		form: formId,
		orientation = 'horizontal',
		step = 1,
		largeStep = 10,
		thumbAlignment = 'center',
		thumbCollisionBehavior = 'push',
		value = $bindable<SliderValue | undefined>(),
		onValueChange,
		onValueCommitted,
		'aria-labelledby': ariaLabelledByProp,
		render,
		children,
		...elementProps
	}: SliderRootProps = $props();

	const reading = useDirection();
	const field = useFieldContext(true);
	const form = useFormContext();
	const labelable = useLabelableContext(true);

	const controllable = createControllableValue<SliderValue>({
		getProp: () => value,
		setProp: (next) => {
			value = next;
		},
		getDefault: () => defaultValue ?? min,
		onChange(next) {
			if (next === undefined) return;
			const clamped = clampedFieldValue(next);
			// Registration is read by validation. Write it before the notice so
			// `validate` sees this value, not the one from the previous commit.
			if (field && !disabled) {
				field.registerControl(fieldSource, {
					id: rootId,
					name: nameProp,
					value: clamped,
					element: model.fieldInput
				});
			}
			commitFieldValue(clamped);
		}
	});
	const valueUnwrapped = $derived(controllable.value as SliderValue);
	const disabled = $derived(Boolean(field?.disabled) || disabledProp);
	const name = $derived(field?.name ?? nameProp);
	const rootId = $derived(idProp || `base-ui-${uid}`);

	function writeValue(next: SliderValue) {
		controllable.set(next);
	}

	function clampedFieldValue(raw: SliderValue): SliderValue {
		if (typeof raw === 'number') return clamp(raw, min, max);
		return raw.map((item) => clamp(item, min, max)).sort(asc);
	}

	const model = new SliderRootModel({
		getValueUnwrapped: () => valueUnwrapped,
		writeValue,
		getMin: () => min,
		getMax: () => max,
		getStep: () => step,
		getLargeStep: () => largeStep,
		getMinSteps: () => minStepsBetweenValues,
		getOrientation: () => orientation,
		getDisabled: () => disabled,
		getName: () => name,
		getFormId: () => formId,
		getRootId: () => rootId,
		getFormat: () => format,
		getLocale: () => locale,
		getThumbAlignment: () => thumbAlignment,
		getCollision: () => thumbCollisionBehavior,
		getAriaLabelledBy: () => ariaLabelledByProp || undefined,
		getFieldLabelId: () => labelable?.labelId || undefined,
		getOnValueChange: () => onValueChange,
		getOnValueCommitted: () => onValueCommitted,
		getField: () => field,
		getFormContext: () => form,
		getDirection: () => reading.direction
	});
	setSliderContext(model);

	const linkedLabel = $derived(model.linkedLabel);

	function remember(node: HTMLElement) {
		model.root = node;
		return () => {
			if (model.root === node) model.root = null;
		};
	}

	onMount(() => {
		model.hydrating = false;
	});

	$effect(() => {
		if (!DEV || min < max) return;
		console.warn('Base UI: Slider `max` must be greater than `min`.');
	});

	$effect(() => {
		if (!disabled) return;
		const activeEl = activeElement(ownerDocument(model.root));
		if (contains(model.root, activeEl) && activeEl instanceof HTMLElement) activeEl.blur();
		if (model.active !== -1) model.setActive(-1);
	});

	function commitFieldValue(next: SliderValue) {
		form.clearErrors(name);
		field?.change(next);
		const initial = field?.validityData.initialValue;
		const isDirty =
			Array.isArray(next) && Array.isArray(initial)
				? !areArraysEqual(next, initial)
				: next !== initial;
		field?.setDirty(isDirty);
	}

	$effect(() => {
		if (!field) return;
		const inactive = disabled;
		const input = model.fieldInput;
		const id = rootId;
		const controlName = nameProp;
		if (inactive) {
			field.registerControl(fieldSource, undefined);
			return () => field.registerControl(fieldSource, undefined);
		}
		// The value is registered in the change notice, before validation. This
		// effect keeps the element, id, and name current without reordering that notice.
		untrack(() => {
			field.registerControl(fieldSource, {
				id,
				name: controlName,
				value: model.fieldValue,
				element: input
			});
		});
		return () => field.registerControl(fieldSource, undefined);
	});

	const partState: SliderRootState = $derived(model.snapshot());
	const describedBy = $derived(
		labelable?.describedBy(elementProps['aria-describedby'] || undefined)
	);

	const hostProps: HTMLAttributes<HTMLDivElement> & Record<symbol, Attachment<HTMLDivElement>> =
		$derived.by(() => {
			const props: HTMLAttributes<HTMLDivElement> & Record<symbol, Attachment<HTMLDivElement>> = {
				...elementProps,
				...getStateAttributesProps(partState, sliderStateAttributes),
				id: rootId,
				role: 'group',
				...(linkedLabel ? { 'aria-labelledby': linkedLabel } : {}),
				...(describedBy ? { 'aria-describedby': describedBy } : {}),
				...(partState.valid === false && !field?.disabled && !disabled
					? { 'aria-invalid': true as const }
					: {})
			};
			props[elementKey] = remember;
			return props;
		});
</script>

{#snippet sliderContent()}
	{@render children?.()}
{/snippet}

{#if render}
	{@render render(hostProps, partState, sliderContent)}
{:else}
	<div {...hostProps}>{@render sliderContent()}</div>
{/if}
