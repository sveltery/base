// Native transport for the two CSS variables in pinned CollapsiblePanel.tsx.
// Base UI v1.8.0 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
import type { Attachment } from 'svelte/attachments';
import { toNativeStyle, type NativeStyle } from '../../internals/nativeProps.js';
import * as CollapsiblePanelCssVars from './CollapsiblePanelCssVars.js';

/** Dimension updates must not replace Source's temporary layout/motion styles. */
export function useCollapsiblePanelDimensions(getParameters: () => {
  height: number | undefined;
  width: number | undefined;
  style: NativeStyle | undefined;
}): Attachment<HTMLElement> {
  return (element) => {
    // The browser parses authored string/object precedence. Only these two
    // named values/priorities are read; this detached parser never owns a host.
    const authored = element.ownerDocument.createElement('div');
    $effect(() => {
      const { height, width, style } = getParameters();
      authored.setAttribute('style', toNativeStyle(style) ?? '');
      for (const [property, dimension] of [
        [CollapsiblePanelCssVars.collapsiblePanelHeight, height],
        [CollapsiblePanelCssVars.collapsiblePanelWidth, width],
      ] as const) {
        const override = authored.style.getPropertyValue(property);
        element.style.setProperty(
          property,
          override || (dimension === undefined ? 'auto' : `${dimension}px`),
          authored.style.getPropertyPriority(property),
        );
      }
    });
    // Native attachment teardown disposes this child effect. Like Source's
    // rendered props, the last dimension declarations remain on a removed host.
  };
}
