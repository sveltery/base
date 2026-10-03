<script lang="ts">
  // Source business body: Base UI v1.8.0 TabsIndicator.tsx at 47b40521. MIT.
  import { untrack } from 'svelte';
  import {
    getParentNode,
    isHTMLElement,
    isLastTraversableNode,
  } from '@floating-ui/utils/dom';
  import { ownerWindow } from '../../utils/owner.js';
  import { getCssDimensions } from '../../utils/getCssDimensions.js';
  import { getElementTransform } from '../../utils/getElementTransform.js';
  import RenderElement from '../../internals/RenderElement.svelte';
  import PrehydrationScript from '../../internals/PrehydrationScript.svelte';
  import { script as prehydrationScript } from './prehydrationScript.min.js';
  import { useTabsRootContext } from '../root/TabsRootContext.js';
  import { useTabsListContext } from '../list/TabsListContext.js';
  import { tabsStateAttributesMapping } from '../root/stateAttributesMapping.js';
  import * as TabsIndicatorCssVars from './TabsIndicatorCssVars.js';
  import type { TabsIndicatorProps, TabsIndicatorState } from '../types.js';
  const stateAttributesMapping = {
    ...tabsStateAttributesMapping,
    activeTabPosition: () => null,
    activeTabSize: () => null,
  };
  const MAX_LAYOUT_ROUNDING_ERROR = 2;
  let {
    class: classProp,
    render,
    renderBeforeHydration = false,
    style,
    ref = $bindable(),
    children,
    ...elementProps
  }: TabsIndicatorProps = $props();
  const root = useTabsRootContext(),
    list = useTabsListContext();
  let revision = $state(0);
  function rerender() {
    untrack(() => {
      revision += 1;
    });
  }
  $effect(() => list.registerIndicatorUpdateListener(rerender));
  const geometry = $derived.by(() => {
    void revision;
    let left = 0;
    let right = 0;
    let top = 0;
    let bottom = 0;
    let width = 0;
    let height = 0;

    let isTabSelected = false;

    if (root.value != null && list.tabsListElement != null) {
      const tabsListElement = list.tabsListElement;
      const activeTab = root.getTabElementBySelectedValue(root.value);

      if (activeTab != null) {
        isTabSelected = true;

        const { width: computedWidth, height: computedHeight } =
          getCssDimensions(activeTab);
        const { width: tabListWidth, height: tabListHeight } =
          getCssDimensions(tabsListElement);
        const tabRect = activeTab.getBoundingClientRect();
        const tabsListRect = tabsListElement.getBoundingClientRect();
        const scaleX = tabListWidth > 0 ? tabsListRect.width / tabListWidth : 1;
        const scaleY =
          tabListHeight > 0 ? tabsListRect.height / tabListHeight : 1;

        // Layout offsets are immune to transforms, but lose sub-pixel precision.
        const layoutOffset = getLayoutOffset(activeTab, tabsListElement);
        left = layoutOffset.left;
        top = layoutOffset.top;

        const rectLeft =
          (tabRect.left - tabsListRect.left) / scaleX +
          tabsListElement.scrollLeft -
          tabsListElement.clientLeft;
        const rectTop =
          (tabRect.top - tabsListRect.top) / scaleY +
          tabsListElement.scrollTop -
          tabsListElement.clientTop;

        // The rect-based offset is sub-pixel-precise but is derived from projected viewport
        // geometry: a rotation, skew, flip, perspective, or 3D transform on the tab or any
        // ancestor warps it beyond what the scale division can undo. When it agrees with the
        // layout offset (up to layout rounding), no distortion is in effect and the more
        // precise value is safe to use. A tab list scaled to zero divides by zero just above,
        // and the resulting `NaN`/`Infinity` fails this same check, leaving the layout offset
        // in place — so a degenerate scale needs no guard of its own.
        //
        // The active tab's own translation moves the rect but not the layout offset, so
        // strip it from the comparison. This lets the indicator follow tab-local animations
        // (e.g. `transform: translateX(12px)` on the selected tab) — the indicator is a
        // sibling of the tab and does not inherit its transform.
        const tabTranslation = getActiveTabTranslation(activeTab);
        if (
          Math.abs(rectLeft - tabTranslation.x - left) <=
            MAX_LAYOUT_ROUNDING_ERROR &&
          Math.abs(rectTop - tabTranslation.y - top) <= MAX_LAYOUT_ROUNDING_ERROR
        ) {
          left = rectLeft;
          top = rectTop;
        }

        width = computedWidth;
        height = computedHeight;
        right = tabsListElement.scrollWidth - left - width;
        bottom = tabsListElement.scrollHeight - top - height;
      }
    }

    const activeTabPosition = isTabSelected ? { left, right, top, bottom } : null;

    const activeTabSize = isTabSelected ? { width, height } : null;

    const style: Record<string, string> | undefined = isTabSelected
      ? ({
          [TabsIndicatorCssVars.activeTabLeft]: `${left}px`,
          [TabsIndicatorCssVars.activeTabRight]: `${right}px`,
          [TabsIndicatorCssVars.activeTabTop]: `${top}px`,
          [TabsIndicatorCssVars.activeTabBottom]: `${bottom}px`,
          [TabsIndicatorCssVars.activeTabWidth]: `${width}px`,
          [TabsIndicatorCssVars.activeTabHeight]: `${height}px`,
        } as Record<string, string>)
      : undefined;

    const displayIndicator = isTabSelected && width > 0 && height > 0;

    return { activeTabPosition, activeTabSize, style, displayIndicator };
  });
  const partState: TabsIndicatorState = $derived({
    orientation: root.orientation,
    activeTabPosition: geometry.activeTabPosition,
    activeTabSize: geometry.activeTabSize,
    tabActivationDirection: root.tabActivationDirection,
  });
  const forwardedRef = {
    get current() {
      return ref ?? null;
    },
    set current(element: HTMLElement | null) {
      ref = element;
    },
  };
  const componentProps = $derived({ render, class: classProp, style });
  const params = $derived({
    state: partState,
    ref: forwardedRef,
    props: [
      {
        role: 'presentation',
        style: geometry.style,
        hidden: !geometry.displayIndicator,
      },
      elementProps,
    ],
    stateAttributesMapping,
  });
  function getLayoutOffset(element: HTMLElement, ancestor: HTMLElement) {
    const elementOffset = getCumulativeOffset(element);
    const ancestorOffset = getCumulativeOffset(ancestor);

    let left = elementOffset.left - ancestorOffset.left - ancestor.clientLeft;
    let top = elementOffset.top - ancestorOffset.top - ancestor.clientTop;

    // `offsetLeft`/`offsetTop` describe layout, and scrolling doesn't change layout: a scroll
    // container between the tab and the list moves the tab on screen while its layout slot stays
    // put. Subtract that scroll so this offset remains comparable with the rect-based one below —
    // otherwise the difference reads as transform distortion, the rect offset is rejected, and the
    // indicator is left behind by the full scroll amount. The list's own scroll is deliberately
    // excluded: the indicator sits inside it and scrolls along with the tab.
    //
    // `getParentNode` crosses shadow boundaries (and slots), so a tab inside a shadow root still
    // reaches the scroll containers between it and the list.
    let node: Node | null = getParentNode(element);
    while (
      isHTMLElement(node) &&
      node !== ancestor &&
      !isLastTraversableNode(node)
    ) {
      left -= node.scrollLeft;
      top -= node.scrollTop;
      node = getParentNode(node);
    }

    return { left, top };
  }

  function getCumulativeOffset(element: HTMLElement) {
    let left = 0;
    let top = 0;
    let currentElement: HTMLElement | null = element;

    while (currentElement != null) {
      left += currentElement.offsetLeft;
      top += currentElement.offsetTop;

      const offsetParent = currentElement.offsetParent as HTMLElement | null;
      if (offsetParent != null) {
        left += offsetParent.clientLeft;
        top += offsetParent.clientTop;
      }

      currentElement = offsetParent;
    }

    return { left, top };
  }

  // Returns the active tab's own 2D translation, in CSS pixels: the translation component of
  // the computed `transform` matrix plus the `translate` longhand. CSS composes the two as
  // `translate → rotate → scale → transform`, so adding them is only exact when no rotation or
  // scale is in play. That is enough here: with either of those present the caller's agreement
  // check rejects the rect-based offset regardless of the translation, and the tab's layout
  // slot is used instead.
  function getActiveTabTranslation(element: HTMLElement) {
    const computedStyle = ownerWindow(element).getComputedStyle(element);
    const { x, y } = getElementTransform(element, computedStyle);
    let translateX = x;
    let translateY = y;

    // The `translate` longhand is a separate property and is not reflected in the
    // computed `transform` matrix that `getElementTransform` reads. `getComputedStyle`
    // resolves absolute and font-relative lengths to pixels but keeps percentages, which
    // resolve against the tab's border box.
    const { translate } = computedStyle;
    if (translate && translate !== 'none') {
      const parts = translate.split(' ');
      translateX += resolveTranslateLength(parts[0], element.offsetWidth);
      translateY += resolveTranslateLength(parts[1], element.offsetHeight);
    }

    return { x: translateX, y: translateY };
  }

  // Resolves a single `translate` longhand component to pixels. Percentages resolve against
  // the given border-box size; anything that isn't a plain number or percentage (e.g.
  // `calc(...)`) is treated as no translation, so the indicator falls back to the tab's
  // layout slot rather than guessing.
  function resolveTranslateLength(
    value: string | undefined,
    referenceSize: number,
  ): number {
    if (!value) {
      return 0;
    }
    const numeric = parseFloat(value);
    if (!Number.isFinite(numeric)) {
      return 0;
    }
    return value.endsWith('%') ? (numeric / 100) * referenceSize : numeric;
  }
</script>
{#if root.value != null}
  <RenderElement tag="span" {componentProps} {params} {children} />
  {#if renderBeforeHydration}<PrehydrationScript script={prehydrationScript} />{/if}
{/if}
