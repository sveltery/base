<!--
	Groups all parts of the slider.
	Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/slider/root/SliderRoot.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	There is no ref. Field registration uses the thumb input element.
	Native input props and handlers go to every thumb's `<input type="range">`. `class`,
	`style` and `host` go to this element. There is no `onValueChange` or `onValueCommitted`:
	each thumb input fires `input` while the value moves and `change` when it settles.
-->
<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import type { Attachment } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useFieldContext } from '../internal/field-root-context.js';
	import { useLabelableContext } from '../internal/labelable-provider.svelte.js';
	import { useFormContext } from '../internal/form-context.js';
	import { clamp } from '../internal/clamp.js';
	import { watchFieldControl } from '../internal/field-register-control.svelte.js';
	import { useValueChanged } from '../internal/useValueChanged.svelte.js';
	import { restoreOnReset } from '../internal/form-reset.svelte.js';
	import { useDirection } from '../internal/direction-context.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { watchSpreadPath } from '../field/watch-spread-path.svelte.js';
	import { readSliderValue } from './read-value.js';
	import { asc } from './asc.js';
	import { sliderStateAttributes } from './attributes.js';
	import { setSliderContext } from './context.svelte.js';
	import { areArraysEqual, ownerDocument, activeElement, contains, warn } from '@sveltery/utils';
	import { areValuesEqual } from './getSliderValue.js';
	import { SliderRootModel } from './model.svelte.js';
	import type { SliderRootProps, SliderRootState, SliderValue } from './types.js';

	const uid = $props.id();
	const elementKey = createAttachmentKey();

	let {
		id: idProp,
		defaultValue,
		disabled: disabledProp,
		required,
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
		value = $bindable<SliderValue | string | undefined>(),
		type: _type,
		class: className,
		style,
		host,
		'aria-labelledby': ariaLabelledByProp,
		'aria-describedby': ariaDescribedByProp,
		render,
		children,
		...inputProps
	}: SliderRootProps = $props();

	const field = useFieldContext();
	const reading = useDirection();
	const form = useFormContext();
	const labelable = useLabelableContext();
	watchSpreadPath(field, form, () => nameProp);

	// Functions, not deriveds: a thumb's own value writes the root's value while the server
	// renders, after the root has read it, and a derived there keeps its first value.
	const currentValue = () => readSliderValue(value);
	const valueUnwrapped = (): SliderValue => currentValue() ?? min;
	const parsedDefault = $derived(readSliderValue(defaultValue));
	// `defaultValue` is the initial value of an empty binding, as in HTML. A bare slider in a
	// remote form starts at the value the form holds, which a failed submit echoes back.
	untrack(() => {
		if (currentValue() !== undefined) return;
		const echoed =
			nameProp === undefined && form.remote ? readSliderValue(field.remoteValue) : undefined;
		const initial = echoed ?? parsedDefault;
		if (initial !== undefined) value = initial;
	});

	useValueChanged(valueUnwrapped, (next) => commitFieldValue(clampedFieldValue(next)));
	const disabled = $derived(Boolean(field.disabled) || (disabledProp ?? false));
	// The slider's own name wins: a remote form encodes the value type and its id in it.
	const name = $derived(nameProp ?? (form.remote ? undefined : field.name) ?? undefined);
	const inputAttributes = $derived({ ...inputProps, name, required: required ?? undefined });
	const rootId = $derived(idProp || `base-ui-${uid}`);

	function writeValue(next: SliderValue) {
		value = next;
	}

	function clampedFieldValue(raw: SliderValue): SliderValue {
		if (typeof raw === 'number') return clamp(raw, min, max);
		return raw.map((item) => clamp(item, min, max)).sort(asc);
	}

	// A thumb without a name in a named Field of a remote form binds itself to the field. The
	// root's value decides the shape: a number binds the field, an array one item per thumb.
	function bindThumb(index: number) {
		if (nameProp !== undefined) return undefined;
		const defaults = untrack(() => parsedDefault);
		if (!Array.isArray(untrack(currentValue) ?? defaults)) {
			const single = typeof defaults === 'number' ? defaults : undefined;
			return index === 0 ? field.bindRemote('range', single) : undefined;
		}
		const item = Array.isArray(defaults) ? defaults[index] : undefined;
		return field.bindRemote('range', item, index);
	}

	const model = new SliderRootModel({
		getValue: currentValue,
		getValueUnwrapped: valueUnwrapped,
		getDefaultValue: () => parsedDefault,
		writeValue,
		getMin: () => min,
		getMax: () => max,
		getStep: () => step,
		getLargeStep: () => largeStep,
		getMinSteps: () => minStepsBetweenValues,
		getOrientation: () => orientation,
		getDisabled: () => disabled,
		getInputAttributes: () => inputAttributes,
		bindThumb,
		getFormId: () => formId ?? undefined,
		getRootId: () => rootId,
		getFormat: () => format,
		getLocale: () => locale,
		getThumbAlignment: () => thumbAlignment,
		getCollision: () => thumbCollisionBehavior,
		getAriaLabelledBy: () => ariaLabelledByProp || undefined,
		getFieldLabelId: () => labelable.labelId || undefined,
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

	restoreOnReset(() => model.fieldInput ?? model.root, {
		restore: () => {
			const next = model.range ? model.defaultValues : model.defaultValues[0];
			const current = currentValue();
			if (current !== undefined && areValuesEqual(current, next)) return;
			value = Array.isArray(next) ? [...next] : next;
		}
	});

	onMount(() => {
		model.hydrating = false;
	});

	$effect(() => {
		if (min < max) return;
		warn('Slider `max` must be greater than `min`.');
	});

	$effect(() => {
		if (!disabled) return;
		const activeEl = activeElement(ownerDocument(model.root));
		if (contains(model.root, activeEl) && activeEl instanceof HTMLElement) activeEl.blur();
		if (model.active !== -1) model.setActive(-1);
	});

	function commitFieldValue(next: SliderValue) {
		field.clearExternalErrors();
		const initial = field.validityData.initialValue;
		const isDirty =
			Array.isArray(next) && Array.isArray(initial)
				? !areArraysEqual(next, initial)
				: next !== initial;
		field.setDirty(isDirty);
		// `change` validates on change, and otherwise revalidates a field that is
		// already invalid. An on-blur error can clear while the thumb is still moving.
		field.change(next);
	}

	watchFieldControl(field, {
		enabled: () => !disabled,
		id: () => rootId,
		name: () => nameProp ?? undefined,
		element: () => model.fieldInput,
		getValue: () => model.fieldValue
	});

	// A range input always has a value, so the Field is filled. Upstream never sets it.
	$effect(() => {
		field.setFilled(true);
	});

	const partState: SliderRootState = $derived(model.snapshot());
	const describedBy = $derived(labelable.describedBy(ariaDescribedByProp || undefined));

	const hostProps: HTMLAttributes<HTMLDivElement> & Record<symbol, Attachment<HTMLDivElement>> =
		$derived.by(() => {
			const props: HTMLAttributes<HTMLDivElement> & Record<symbol, Attachment<HTMLDivElement>> = {
				...getStateAttributesProps(partState, sliderStateAttributes),
				id: rootId,
				role: 'group',
				...(linkedLabel ? { 'aria-labelledby': linkedLabel } : {}),
				...(describedBy ? { 'aria-describedby': describedBy } : {}),
				...(partState.valid === false && !field.disabled && !disabled
					? { 'aria-invalid': true as const }
					: {})
			};
			props[elementKey] = remember;
			return mergeProps(host, { class: className, style: style ?? undefined }, props);
		});
</script>

{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
