<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';

  // Adapted from mui/base-ui v1.8.0 CollapsiblePanel/useCollapsiblePanel,
  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
  import { onDestroy, tick, untrack } from 'svelte';
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import { createChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
  import { getCollapsibleContext } from './context.js';
  import {
    afterAnimations,
    getAnimationType,
    getDimensions,
    requestFrame,
    resetLayoutStyles,
    setTemporaryStyle,
    warnOnce,
    type AnimationType,
  } from './animations.js';
  import type {
    CollapsiblePanelProps,
    CollapsiblePanelState,
  } from './types.js';

  let {
    children,
    render,
    hiddenUntilFound = false,
    keepMounted: keepMountedProp,
    id: idProp,
    class: classProp,
    style: styleProp,
    ref = $bindable(),
    ...props
  }: CollapsiblePanelProps = $props();
  const context = getCollapsibleContext();
  const keepMounted = $derived(keepMountedProp ?? false);
  const registeredId = $derived(idProp || undefined);
  const id = $derived(registeredId ?? context.defaultPanelId);
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
  const panelTransitionStatus = $derived(
    forcePanelIdle ? 'idle' : context.transitionStatus,
  );
  const shouldPreventOpenAnimation = $derived(
    context.open && shouldPreventMountAnimation,
  );
  const renderedDimensions = $derived(
    !context.open &&
      context.mounted &&
      animationType === 'css-animation' &&
      dimensions.height === undefined &&
      dimensions.width === undefined
      ? lastMeasuredDimensions
      : dimensions,
  );
  const panelState: CollapsiblePanelState = $derived({
    ...context.state,
    transitionStatus: panelTransitionStatus,
  });
  const shouldRender = $derived(
    keepMounted || hiddenUntilFound || context.mounted || context.open,
  );

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
    node = element;
    return () => {
      restorePendingTemporaryStyle();
      if (node === element) node = null;
    };
  }
  onDestroy(restorePendingTemporaryStyle);

  const internal = $derived({
    // SSR retains the source boolean attribute; the attached client host can
    // express the browser's native string without React's coercion workaround.
    id,
    hidden: hidden && hiddenUntilFound && node ? 'until-found' : hidden,
    'data-open': context.open ? '' : undefined,
    'data-closed': context.open ? undefined : '',
    'data-disabled': context.disabled ? '' : undefined,
    'data-starting-style':
      panelTransitionStatus === 'starting' ||
      (hiddenUntilFound && hidden && animationType !== 'css-animation')
        ? ''
        : undefined,
    'data-ending-style': panelTransitionStatus === 'ending' ? '' : undefined,
    style: {
      '--collapsible-panel-height':
        renderedDimensions.height === undefined
          ? 'auto'
          : `${renderedDimensions.height}px`,
      '--collapsible-panel-width':
        renderedDimensions.width === undefined
          ? 'auto'
          : `${renderedDimensions.width}px`,
    },
  });
  const resolved = $derived.by(() => {
    const authoredStyle =
      typeof styleProp === 'function' ? styleProp(panelState) : styleProp;
    const classValue =
      typeof classProp === 'function' ? classProp(panelState) : classProp;
    return {
      ...props,
      class:
        classValue === undefined ? undefined : resolveClassValue(classValue),
      style: shouldPreventOpenAnimation
        ? `${authoredStyle ?? ''};animation-name:none`
        : authoredStyle,
    };
  });

  $effect(() => {
    if (hiddenUntilFound && keepMountedProp === false) {
      warnOnce(
        'The `keepMounted={false}` prop on `Collapsible.Panel` is ignored when `hiddenUntilFound` is enabled, since the panel must remain mounted while closed.',
      );
    }
  });

  $effect(() => {
    const registered = registeredId;
    untrack(() =>
      context.setPanelIdState(
        (current) => registered ?? (current === null ? undefined : current),
      ),
    );
    return () =>
      untrack(() =>
        context.setPanelIdState((current) =>
          current === registered ? null : current,
        ),
      );
  });

  $effect(() => {
    if (forcePanelIdle && context.transitionStatus !== 'starting')
      forcePanelIdle = false;
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
      if (
        open &&
        status === 'idle' &&
        shouldPreventMountAnimation &&
        mode === 'css-animation'
      ) {
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
            setPendingTemporaryStyleRestore(
              setTemporaryStyle(panel, 'transition-duration', '0s'),
            );
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
        const restoreDuration = setTemporaryStyle(
          panel,
          'animation-duration',
          '0s',
        );
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
      if (mode === 'css-animation')
        setTemporaryStyle(panel, 'animation-name', 'none')();
    });
  });

  $effect(() => {
    const panel = node;
    if (
      !panel ||
      !context.open ||
      !context.mounted ||
      panelTransitionStatus !== 'idle'
    )
      return;
    return untrack(() =>
      afterAnimations(
        panel,
        () => {
          // An animation microtask can run after close's commit but before cleanup.
          if (node === panel && context.open)
            setDimensions(emptyDimensions, false);
        },
        true,
      ),
    );
  });

  $effect(() => {
    const panel = node;
    if (
      !panel ||
      context.open ||
      !context.mounted ||
      panelTransitionStatus !== 'ending'
    )
      return;
    const abortController = new AbortController();
    let stopObserving: (() => void) | undefined;
    // The ending attribute is committed now. Give Chrome one additional frame
    // to register a transition before the animation helper's observation frame.
    const cancelEndingFrame = requestFrame(panel, () => {
      if (abortController.signal.aborted) return;
      stopObserving = afterAnimations(
        panel,
        () => {
          if (abortController.signal.aborted || node !== panel || context.open)
            return;
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
    const panel = node;
    if (!panel || !hiddenUntilFound || !hidden) return;
    let canceled = false;
    // Svelte supports the string directly. The post-commit restoration also
    // retains the source's forced-until-found behavior over consumer overrides.
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

  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      const disposeHost = attach(host);
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
          disposeHost?.();
        });
    });
  }
  const mergedProps = $derived.by(() => {
    const { class: className, style, ...attributes } = resolved;
    return {
      ...mergeComponentProps(
        panelState,
        { class: className, style },
        [internal, attributes],
        false,
      ),
      [hostAttachmentKey]: attachHost,
    };
  });
</script>

{#if shouldRender}
  {#if render}
    {@render render(mergedProps, panelState, children)}
  {:else}
    <div {...mergedProps}>{@render children?.()}</div>
  {/if}
{/if}
