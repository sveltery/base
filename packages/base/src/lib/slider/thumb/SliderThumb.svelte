<script lang="ts">
  // Source SliderThumb.tsx bodies at Base UI 47b40521; MIT.
  import { untrack } from 'svelte';
  import { visuallyHidden } from '@sveltery/utils/visuallyHidden';
  import { ownerWindow } from '@sveltery/utils/owner';
  import { script as prehydrationScript } from './prehydrationScript.min.js';
  import { clamp } from '@sveltery/utils/clamp';
  import { formatNumber } from '@sveltery/utils/formatNumber';
  import { mergeProps } from '../../merge-props/index.js';
  import { useBaseUiId } from '../../internals/useBaseUiId.js';
  import { HydrationState } from '../../utils/useIsHydrating.svelte.js';
  import { mergeComponentProps } from '../../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import SliderThumbNativeInput from './SliderThumbNativeInput.svelte';
  import { valueToPercent } from '../../utils/valueToPercent.js';
  import {
    ARROW_DOWN,
    ARROW_UP,
    ARROW_RIGHT,
    ARROW_LEFT,
    HOME,
    END,
    COMPOSITE_KEYS,
    PAGE_UP,
    PAGE_DOWN,
  } from '../../internals/composite/composite.js';
  import { useCompositeListItem } from '../../internals/composite/list/useCompositeListItem.svelte.js';
  import { useDirection } from '../../direction-provider/context.js';
  import PrehydrationScript from '../../internals/PrehydrationScript.svelte';
  import { useFieldControlNativeName } from '../../internals/field-control-name/FieldControlNameContext.js';
  import { useFieldRootContext } from '../../internals/field-root-context/FieldRootContext.js';
  import { contains } from '@sveltery/utils/shadowDom';
  import { matchesFocusVisible } from '../../floating-ui/utils/matchesFocusVisible.js';
  import { useLabelableId } from '../../internals/labelable-provider/useLabelableId.svelte.js';
  import { getMidpoint } from '../utils/getMidpoint.js';
  import { getSliderValue } from '../utils/getSliderValue.js';
  import { getDecimalPrecision, roundValueToStep } from '../utils/roundValueToStep.js';
  import { useSliderRootContext } from '../root/SliderRootContext.js';
  import { sliderStateAttributesMapping } from '../root/stateAttributesMapping.js';
  import * as SliderThumbDataAttributes from './SliderThumbDataAttributes.js';
  import type { SliderThumbProps } from '../types.js';
  const ALL_KEYS = new Set([...COMPOSITE_KEYS, PAGE_UP, PAGE_DOWN]);

  function getDefaultAriaValueText(
    values: readonly number[],
    index: number,
    format: Intl.NumberFormatOptions | undefined,
    locale: Intl.LocalesArgument | undefined,
  ): string | undefined {
    if (index < 0) {
      return undefined;
    }

    if (values.length === 2) {
      return `${formatNumber(values[index], locale, format)} ${index === 0 ? 'start' : 'end'} range`;
    }

    return format ? formatNumber(values[index], locale, format) : undefined;
  }

  function getNewValue(
    thumbValue: number,
    increment: number,
    direction: number,
    min: number,
    max: number,
  ): number {
    const value = thumbValue + increment * direction;
    const roundedValue = Number(
      value.toFixed(
        Math.max(
          getDecimalPrecision(thumbValue),
          getDecimalPrecision(increment),
          getDecimalPrecision(min),
        ),
      ),
    );
    return clamp(roundedValue, min, max);
  }

  let {
    render,
    children,
    class: classProp,
    'aria-describedby': ariaDescribedByProp,
    'aria-label': ariaLabelProp,
    'aria-labelledby': ariaLabelledByProp,
    'aria-valuetext': ariaValueTextProp,
    disabled: disabledProp = false,
    getAriaLabel: getAriaLabelProp,
    getAriaValueText: getAriaValueTextProp,
    id: idProp,
    index: indexProp,
    inputRef: inputRefProp = $bindable(),
    onblur: onBlurProp,
    onfocus: onFocusProp,
    onkeydown: onKeyDownProp,
    tabindex: tabIndexProp,
    style,
    ref = $bindable(),
    ...elementProps
  }: SliderThumbProps = $props();
  const nativeId = $props.id();
  const id = $derived(useBaseUiId(idProp ?? undefined, nativeId));
  const context = useSliderRootContext();
  const getNativeName = useFieldControlNativeName();
  const {
    controlRef,
    validation,
    handleInputChange,
    pressedThumbCenterOffsetRef,
    pressedThumbIndexRef,
    setActive,
    setIndicatorPosition,
    thumbRefs,
  } = context;
  const activeIndex = $derived(context.active);
  const lastUsedThumbIndex = $derived(context.lastUsedThumbIndex);
  const contextDisabled = $derived(context.disabled);
  const format = $derived(context.format);
  const inset = $derived(context.inset);
  const labelId = $derived(context.labelId);
  const largeStep = $derived(context.largeStep);
  const locale = $derived(context.locale);
  const max = $derived(context.max);
  const min = $derived(context.min);
  const minStepsBetweenValues = $derived(context.minStepsBetweenValues);
  const form = $derived(context.form);
  const name = $derived(context.name);
  const orientation = $derived(context.orientation);
  const renderBeforeHydration = $derived(context.renderBeforeHydration);
  const sliderState = $derived(context.state);
  const step = $derived(context.step);
  const sliderValues = $derived(context.values);
  let thumbElement = $state<HTMLElement | null>(null);
  const getDirection = useDirection();
  const direction = $derived(getDirection());

  const disabled = $derived(disabledProp || contextDisabled);
  const range = $derived(sliderValues.length > 1);
  const vertical = $derived(orientation === 'vertical');
  const rtl = $derived(direction === 'rtl');

  const field = useFieldRootContext();
  const { setTouched, setFocused } = field;
  const validationMode = $derived(field.validationMode);

  const thumbRef = {
    get current() {
      return thumbElement;
    },
    set current(value: HTMLElement | null) {
      thumbElement = value;
    },
  };
  const inputRef = { current: null as HTMLInputElement | null };
  const restoringFocusVisibleRef = { current: false };

  // Attached to the `input` (not the thumb wrapper) so `event.currentTarget` is the
  // input, matching `onKeyDown`. The synthetic blur/focus dispatched while restoring
  // `:focus-visible` is internal and must not be forwarded to the user's handlers.
  const handleFocusProp = (event: Parameters<NonNullable<SliderThumbProps['onfocus']>>[0]) => {
    if (restoringFocusVisibleRef.current) {
      return;
    }
    onFocusProp?.(event);
  };

  const handleBlurProp = (event: Parameters<NonNullable<SliderThumbProps['onblur']>>[0]) => {
    if (restoringFocusVisibleRef.current) {
      return;
    }
    onBlurProp?.(event);
  };

  const defaultInputId = useBaseUiId(undefined, `${nativeId}-input`);
  const labelableId = useLabelableId(() => ({}), useBaseUiId(undefined, `${nativeId}-labelable`));
  const inputId = $derived(range ? defaultInputId : labelableId());

  const thumbMetadata = $derived({ inputId });

  const listItem = useCompositeListItem(() => ({ metadata: thumbMetadata }));

  const index = $derived(!range ? 0 : (indexProp ?? listItem.index()));
  const last = $derived(index === sliderValues.length - 1);
  const thumbValue = $derived(sliderValues[index]);
  const thumbValuePercent = $derived(valueToPercent(thumbValue, min, max));

  let positionPercent = $state<number>();
  const setPositionPercent = (value: number | undefined) => {
    positionPercent = value;
  };
  const isHydrating = new HydrationState().read;

  const safeLastUsedThumbIndex = $derived(
    lastUsedThumbIndex >= 0 && lastUsedThumbIndex < sliderValues.length ? lastUsedThumbIndex : -1,
  );

  const getInsetPosition = () => {
    const control = controlRef.current;
    const thumb = thumbRef.current;
    if (!control || !thumb) {
      return;
    }

    const thumbRect = thumb.getBoundingClientRect();
    const controlRect = control.getBoundingClientRect();

    const side = vertical ? 'height' : 'width';
    // the total travel distance adjusted to account for the thumb size
    const controlSize = controlRect[side] - thumbRect[side];
    // px distance from the starting edge (inline-start or bottom) to the thumb center
    const thumbOffsetFromControlEdge =
      thumbRect[side] / 2 + (controlSize * thumbValuePercent) / 100;
    const nextPositionPercent = (thumbOffsetFromControlEdge / controlRect[side]) * 100;
    const nextInsetPosition = Number.isFinite(nextPositionPercent)
      ? nextPositionPercent
      : undefined;

    setPositionPercent(nextInsetPosition);

    if (index === 0) {
      setIndicatorPosition((prevPosition) => [nextInsetPosition, prevPosition[1]]);
    } else if (last) {
      setIndicatorPosition((prevPosition) => [prevPosition[0], nextInsetPosition]);
    }
  };

  $effect(() => {
    if (inset) queueMicrotask(getInsetPosition);
  });
  $effect(() => {
    if (!inset) return;
    // Acquire actual geometry dependencies before the imperative publication.
    void thumbValuePercent;
    void vertical;
    void index;
    void last;
    void controlRef.current;
    void thumbRef.current;
    untrack(getInsetPosition);
  });
  $effect(() => {
    if (!inset) return;
    const control = controlRef.current;
    const thumb = thumbRef.current;
    if (!control || !thumb) return;
    const ResizeObserverCtor = ownerWindow(control).ResizeObserver;
    if (typeof ResizeObserverCtor !== 'function') return;
    const resizeObserver = new ResizeObserverCtor(getInsetPosition);
    resizeObserver.observe(control);
    resizeObserver.observe(thumb);
    return () => resizeObserver.disconnect();
  });

  const startEdge = $derived(vertical ? 'bottom' : 'insetInlineStart');
  const crossOffsetProperty = $derived(vertical ? 'left' : 'top');

  const zIndex = $derived.by(() => {
    let zIndex: number | undefined;
    if (range) {
      if (activeIndex === index) {
        zIndex = 2;
      } else if (safeLastUsedThumbIndex === index) {
        zIndex = 1;
      }
    } else if (activeIndex === index) {
      zIndex = 1;
    }

    return zIndex;
  });
  const thumbStyle = $derived.by(() => {
    let thumbStyle: Record<string, string | number | undefined>;
    if (!inset && !Number.isFinite(thumbValuePercent)) {
      thumbStyle = visuallyHidden;
    } else {
      thumbStyle = {
        position: 'absolute',
        [startEdge]: inset ? 'var(--position)' : `${thumbValuePercent}%`,
        [crossOffsetProperty]: '50%',
        translate: `${(vertical || !rtl ? -1 : 1) * 50}% ${(vertical ? 1 : -1) * 50}%`,
        zIndex,
        ...(inset && {
          ['--position' as string]: `${positionPercent ?? 0}%`,
          visibility:
            (renderBeforeHydration && isHydrating()) || positionPercent === undefined
              ? ('hidden' as const)
              : undefined,
        }),
      };
    }

    return thumbStyle;
  });
  const cssWritingMode = $derived.by(() => {
    let cssWritingMode: string | undefined;
    if (vertical) {
      cssWritingMode = rtl ? 'vertical-rl' : 'vertical-lr';
    }

    return cssWritingMode;
  });
  const ariaLabel = $derived(
    typeof getAriaLabelProp === 'function' ? getAriaLabelProp(index) : ariaLabelProp,
  );

  const inputProps = $derived(
    mergeProps(
      {
        'aria-label': ariaLabel,
        'aria-labelledby': ariaLabelledByProp ?? (ariaLabel == null ? labelId : undefined),
        'aria-describedby': ariaDescribedByProp,
        'aria-orientation': orientation,
        'aria-valuenow': thumbValue,
        'aria-valuetext':
          typeof getAriaValueTextProp === 'function'
            ? getAriaValueTextProp(formatNumber(thumbValue, locale, format), thumbValue, index)
            : (ariaValueTextProp ?? getDefaultAriaValueText(sliderValues, index, format, locale)),
        disabled,
        form,
        id: inputId,
        max,
        min,
        name: getNativeName(name),
        onchange(event: Event) {
          handleInputChange((event.currentTarget as HTMLInputElement).valueAsNumber, index, event);
        },
        oninput(event: Event) {
          handleInputChange((event.currentTarget as HTMLInputElement).valueAsNumber, index, event);
        },
        onfocus(event: FocusEvent) {
          const isRestoringFocusVisible = restoringFocusVisibleRef.current;
          restoringFocusVisibleRef.current = false;
          setActive(index);
          setFocused(true);

          if (isRestoringFocusVisible) {
            event.stopPropagation();
          }
        },
        onblur(event: FocusEvent) {
          if (restoringFocusVisibleRef.current) {
            event.stopPropagation();
            return;
          }

          setActive(-1);

          // Keep field-level blur logic from running while focus moves to another thumb
          // of the same slider, so validation doesn't commit mid-interaction.
          if (
            thumbRefs.current.some((thumb) =>
              contains(thumb, event.relatedTarget as Element | null),
            )
          ) {
            return;
          }

          setTouched(true);
          setFocused(false);

          if (validationMode === 'onBlur') {
            validation.commit(getSliderValue(thumbValue, index, min, max, range, sliderValues));
          }
        },
        onkeydown(event: KeyboardEvent) {
          if (event.defaultPrevented) {
            return;
          }

          if (!ALL_KEYS.has(event.key)) {
            return;
          }

          if (COMPOSITE_KEYS.has(event.key)) {
            event.stopPropagation();
          }

          let newValue = null;
          let direction = 0;
          let increment = event.shiftKey ? largeStep : step;
          const roundedValue = roundValueToStep(thumbValue, step, min);
          switch (event.key) {
            case ARROW_UP:
              direction = 1;
              break;
            case ARROW_RIGHT:
              direction = rtl ? -1 : 1;
              break;
            case ARROW_DOWN:
              direction = -1;
              break;
            case ARROW_LEFT:
              direction = rtl ? 1 : -1;
              break;
            case PAGE_UP:
              increment = largeStep;
              direction = 1;
              break;
            case PAGE_DOWN:
              increment = largeStep;
              direction = -1;
              break;
            case END:
              newValue =
                range && Number.isFinite(sliderValues[index + 1])
                  ? sliderValues[index + 1] - step * minStepsBetweenValues
                  : max;
              break;
            case HOME:
              newValue =
                range && Number.isFinite(sliderValues[index - 1])
                  ? sliderValues[index - 1] + step * minStepsBetweenValues
                  : min;
              break;
            default:
              break;
          }

          if (direction !== 0) {
            newValue = getNewValue(roundedValue, increment, direction, min, max);
          }

          if (newValue !== null) {
            const input = event.currentTarget as HTMLInputElement;

            if (!matchesFocusVisible(input)) {
              restoringFocusVisibleRef.current = true;
              input.blur();
              input.focus({
                preventScroll: true,
                // Show `:focus-visible` after keyboard interaction, even if the
                // thumb was previously focused by a pointer.
                focusVisible: true,
              } as Parameters<HTMLElement['focus']>[0]);
            }

            handleInputChange(newValue, index, event);
            event.preventDefault();
          }
        },
        step,
        style: {
          ...visuallyHidden,
          // So that VoiceOver's focus indicator matches the thumb's dimensions
          width: '100%',
          height: '100%',
          writingMode: cssWritingMode,
        },
        tabindex: tabIndexProp,
        type: 'range',
        value: thumbValue ?? '',
      },
      (props) => validation.getValidationProps(disabled, props),
      {
        onfocus: handleFocusProp,
        onblur: handleBlurProp,
        onkeydown: onKeyDownProp,
      },
    ),
  );

  const inputAttachmentKey = createAttachmentKey();
  function attachInput(host: HTMLInputElement) {
    return untrack(() => {
      inputRef.current = host;
      validation.inputRef.current = host;
      inputRefProp = host;
      return () =>
        untrack(() => {
          if (inputRef.current === host) inputRef.current = null;
          if (validation.inputRef.current === host) validation.inputRef.current = null;
          if (inputRefProp === host) inputRefProp = null;
        });
    });
  }
  const supplied = $derived({
    ...mergeComponentProps({}, {}, inputProps, false),
    [inputAttachmentKey]: attachInput,
  });
  const listAttachmentKey = createAttachmentKey();
  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      thumbRef.current = host;
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
          if (thumbRef.current === host) thumbRef.current = null;
        });
    });
  }
  const mergedProps = $derived({
    ...mergeComponentProps(
      sliderState,
      { class: classProp, style },
      [
        {
          [SliderThumbDataAttributes.index]: index,
          id,
          onpointerdown(event: PointerEvent) {
            if (disabled) return;
            pressedThumbIndexRef.current = index;
            const midpoint = getMidpoint(event.currentTarget as HTMLElement, vertical);
            pressedThumbCenterOffsetRef.current =
              (vertical ? event.clientY : event.clientX) - midpoint;
          },
          style: thumbStyle,
        },
        elementProps,
      ],
      sliderStateAttributesMapping,
    ),
    [hostAttachmentKey]: attachHost,
    [listAttachmentKey]: listItem.attach,
  });
</script>

{#snippet contents()}
  {@render children?.()}
  <SliderThumbNativeInput {supplied} />
  {#if inset && last && renderBeforeHydration}<PrehydrationScript
      script={prehydrationScript}
    />{/if}
{/snippet}
{#if render}
  {@render render(mergedProps, sliderState, contents)}
{:else}
  <div {...mergedProps}>{@render contents()}</div>
{/if}
