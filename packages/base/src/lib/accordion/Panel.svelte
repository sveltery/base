<script lang="ts">
  // Adapted from mui/base-ui v1.8.0 AccordionPanel/useCollapsiblePanel,
  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
  import { onDestroy, tick, untrack } from 'svelte';
  import Element from '../dialog/Element.svelte';
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import { createChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
  import { getCollapsibleContext } from '../collapsible/context.js';
  import { getAccordionRootContext, getAccordionItemContext } from './context.js';
  import { stateAttributes } from './state.js';
  import {
    afterAnimations,
    getAnimationType,
    getDimensions,
    preserveUnchangedInlineStyles,
    requestFrame,
    resetLayoutStyles,
    setTemporaryStyle,
    warnOnce,
    type AnimationType,
  } from '../collapsible/animations.js';
  import type { AccordionPanelProps, AccordionPanelState } from './types.js';

  let {
    children,
    render,
    hiddenUntilFound: hiddenUntilFoundProp,
    keepMounted: keepMountedProp,
    id: idProp,
    class: classProp,
    style: styleProp,
    ref = $bindable(),
    ...props
  }: AccordionPanelProps = $props();
  const root = getAccordionRootContext();
  const context = getCollapsibleContext();
  const item = getAccordionItemContext();
  const hiddenUntilFound = $derived(hiddenUntilFoundProp ?? root.hiddenUntilFound);
  const keepMounted = $derived(keepMountedProp ?? root.keepMounted);
  const registeredId = $derived(idProp || undefined);
  const id = $derived(idProp ?? context.defaultPanelId);
  let node = $state<HTMLElement | null>(null);
  type Dimensions = { height: number | undefined; width: number | undefined };
  const emptyDimensions: Dimensions = { height: undefined, width: undefined };
  let dimensions = $state.raw<Dimensions>(emptyDimensions);
  let lastMeasuredDimensions = $state.raw<Dimensions>(emptyDimensions);
  let animationType = $state<AnimationType | null>(null);
  let shouldPreventMountAnimation = $state(untrack(() => context.open));
  let shouldSkipNextOpen = false;
  let forcePanelIdle = $state(false);
  let pendingTemporaryStyleRestore: (() => void) | undefined;

  const hidden = $derived(!context.open && !context.mounted);
  const panelTransitionStatus = $derived(forcePanelIdle ? 'idle' : context.transitionStatus);
  const shouldPreventOpenAnimation = $derived(context.open && shouldPreventMountAnimation);
  const renderedDimensions = $derived(
    !context.open &&
      context.mounted &&
      animationType === 'css-animation' &&
      dimensions.height === undefined &&
      dimensions.width === undefined
      ? lastMeasuredDimensions
      : dimensions,
  );
  const panelState: AccordionPanelState = $derived({
    ...item.state,
    transitionStatus: panelTransitionStatus,
  });
  const shouldRender = $derived(keepMounted || hiddenUntilFound || context.mounted || context.open);

  function setDimensions(next: Dimensions, cache = true) {
    if (cache) lastMeasuredDimensions = next;
    dimensions = next;
  }
  function restorePendingTemporaryStyle() {
    pendingTemporaryStyleRestore?.();
    pendingTemporaryStyleRestore = undefined;
  }
  function setPendingTemporaryStyleRestore(restore: () => void) {
    restorePendingTemporaryStyle();
    pendingTemporaryStyleRestore = () => {
      pendingTemporaryStyleRestore = undefined;
      restore();
    };
  }
  function attach(element: HTMLElement) {
    styledNode = element;
    previousStyle = mergedStyle;
    node = element;
    return () => {
      restorePendingTemporaryStyle();
      if (node === element) node = null;
    };
  }
  onDestroy(restorePendingTemporaryStyle);

  const internal = $derived({
    // The pin passes a boolean, then forces until-found in its state-owned
    // effect. A replacement host does not rerun that effect by itself.
    id,
    hidden,
    ...stateAttributes(panelState),
    role: 'region',
    'aria-labelledby': item.triggerId,
    'data-starting-style':
      panelTransitionStatus === 'starting' ||
      (hiddenUntilFound && hidden && animationType !== 'css-animation')
        ? ''
        : undefined,
    'data-ending-style': panelTransitionStatus === 'ending' ? '' : undefined,
    style: {
      '--accordion-panel-height':
        renderedDimensions.height === undefined ? 'auto' : `${renderedDimensions.height}px`,
      '--accordion-panel-width':
        renderedDimensions.width === undefined ? 'auto' : `${renderedDimensions.width}px`,
    },
  });
  const resolved = $derived.by(() => {
    const authoredStyle = typeof styleProp === 'function' ? styleProp(panelState) : styleProp;
    const classValue = typeof classProp === 'function' ? classProp(panelState) : classProp;
    return {
      ...props,
      class: classValue === undefined ? undefined : resolveClassValue(classValue),
      style: shouldPreventOpenAnimation
        ? `${authoredStyle ?? ''};animation-name:none`
        : authoredStyle,
    };
  });
  const mergedStyle = $derived(
    `--accordion-panel-height:${internal.style['--accordion-panel-height']};--accordion-panel-width:${internal.style['--accordion-panel-width']}${resolved.style ? `;${resolved.style}` : ''}`,
  );

  $effect(() => {
    if (hiddenUntilFound && keepMountedProp === false) {
      warnOnce(
        'The `keepMounted={false}` prop on an `Accordion.Panel` is ignored when `hiddenUntilFound` is enabled on the panel or root, since the panel must remain mounted while closed.',
      );
    }
  });

  $effect(() => {
    const registered = registeredId;
    untrack(() =>
      context.setPanelIdState((current) => registered ?? (current === null ? undefined : current)),
    );
    return () =>
      untrack(() =>
        context.setPanelIdState((current) => (current === registered ? null : current)),
      );
  });

  $effect(() => {
    if (forcePanelIdle && context.transitionStatus !== 'starting') forcePanelIdle = false;
  });

  let styledNode: HTMLElement | null = null;
  let previousStyle: string | undefined;
  let restoreUnchangedStyles: (() => void) | undefined;
  $effect.pre(() => {
    const panel = node;
    const nextStyle = mergedStyle;
    if (!panel) {
      styledNode = null;
      previousStyle = undefined;
      restoreUnchangedStyles = undefined;
      return;
    }
    restoreUnchangedStyles = preserveUnchangedInlineStyles(
      panel,
      styledNode === panel ? previousStyle : undefined,
      nextStyle,
    );
    styledNode = panel;
    previousStyle = nextStyle;
  });
  $effect(() => {
    // Track the same commit as the snapshot, then restore before measurement.
    const panel = node;
    const nextStyle = mergedStyle;
    untrack(() => {
      if (panel === styledNode && nextStyle === previousStyle) restoreUnchangedStyles?.();
      restoreUnchangedStyles = undefined;
    });
  });

  // This effect runs after the corresponding DOM commit, while close's ending
  // phase is deferred by Root for a frame. Measurements therefore precede it.
  $effect(() => {
    const panel = node;
    const open = context.open;
    const mounted = context.mounted;
    const status = context.transitionStatus;
    const preventOpenAnimation = shouldPreventOpenAnimation;
    // The pin returns when the custom host disappears; its Root ending status
    // remains retained. Finalizing here would correct shared source behavior.
    if (!panel) return;
    return untrack(() => {
      if (!open) restorePendingTemporaryStyle();
      const mode = getAnimationType(panel, preventOpenAnimation);
      animationType = mode;
      if (open && status === 'idle' && shouldPreventMountAnimation && mode === 'css-animation') {
        lastMeasuredDimensions = getDimensions(panel);
        return;
      }
      if (open && status === 'starting') {
        const skipOpen = shouldSkipNextOpen;
        shouldSkipNextOpen = false;
        if (mode === 'none') {
          setDimensions(getDimensions(panel));
          forcePanelIdle = true;
          return;
        }
        if (mode === 'css-transition') {
          const restoreLayout = resetLayoutStyles(panel);
          setDimensions(getDimensions(panel));
          if (skipOpen) {
            setPendingTemporaryStyleRestore(setTemporaryStyle(panel, 'transition-duration', '0s'));
            forcePanelIdle = true;
          }
          return restoreLayout;
        }
        setDimensions(getDimensions(panel));
        const restoreName = setTemporaryStyle(panel, 'animation-name', 'none');
        if (!skipOpen) {
          restoreName();
          return;
        }
        const restoreDuration = setTemporaryStyle(panel, 'animation-duration', '0s');
        restoreName();
        setPendingTemporaryStyleRestore(restoreDuration);
        forcePanelIdle = true;
        return;
      }
      if (!open && mounted && (status === 'idle' || status === 'starting')) {
        shouldPreventMountAnimation = false;
        if (mode === 'none') {
          setDimensions(emptyDimensions, false);
          context.setMounted(false);
          return;
        }
        setDimensions(getDimensions(panel));
        return;
      }
      if (status !== 'ending') return;
      if (mode === 'none') {
        context.setMounted(false);
        return;
      }
      const next = getDimensions(panel);
      if (!(next.height > 0 || next.width > 0)) {
        context.setMounted(false);
        return;
      }
      setDimensions(next);
      if (mode === 'css-animation') setTemporaryStyle(panel, 'animation-name', 'none')();
    });
  });

  $effect(() => {
    const panel = node;
    if (!panel || !context.open || !context.mounted || panelTransitionStatus !== 'idle') return;
    return untrack(() =>
      afterAnimations(
        panel,
        () => {
          // An animation microtask can run after close's commit but before cleanup.
          if (node === panel && context.open) setDimensions(emptyDimensions, false);
        },
        true,
      ),
    );
  });

  $effect(() => {
    const panel = node;
    if (!panel || context.open || !context.mounted || panelTransitionStatus !== 'ending') return;
    const abortController = new AbortController();
    let stopObserving: (() => void) | undefined;
    // The ending attribute is committed now. Give Chrome one additional frame
    // to register a transition before the animation helper's observation frame.
    const cancelEndingFrame = requestFrame(panel, () => {
      if (abortController.signal.aborted) return;
      stopObserving = afterAnimations(
        panel,
        () => {
          if (abortController.signal.aborted || node !== panel || context.open) return;
          context.setMounted(false);
          setDimensions(emptyDimensions, false);
        },
        false,
        abortController.signal,
      );
    });
    return () => {
      cancelEndingFrame();
      abortController.abort();
      stopObserving?.();
    };
  });

  $effect(() => {
    const isHidden = hidden;
    const untilFound = hiddenUntilFound;
    const panel = untrack(() => node);
    if (!panel || !untilFound || !isHidden) return;
    let canceled = false;
    // Restoration follows the same state dependencies as the pin, including
    // forcing the string over consumer overrides on those state commits.
    void tick().then(() => {
      if (!canceled && node === panel && hiddenUntilFound && hidden)
        panel.setAttribute('hidden', 'until-found');
    });
    return () => {
      canceled = true;
    };
  });

  // The source subscribes on the component effect lifetime, rather than the
  // changing host ref. Keep that ownership until replacement behavior is proven.
  $effect(() => {
    const onOpenChange = context.onOpenChange;
    const setOpen = context.setOpen;
    const panel = untrack(() => node);
    if (!panel) return;
    function beforeMatch(event: Event) {
      const details = createChangeEventDetails('none', event);
      onOpenChange(true, details);
      if (details.isCanceled) return;
      shouldSkipNextOpen = true;
      setOpen(true);
    }
    panel.addEventListener('beforematch', beforeMatch);
    return () => panel.removeEventListener('beforematch', beforeMatch);
  });
</script>

{#if shouldRender}
  <Element
    tag="div"
    {internal}
    props={resolved}
    state={panelState}
    {render}
    {children}
    bind:ref
    {attach}
  />
{/if}
