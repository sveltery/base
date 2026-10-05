// Ported from Base UI v1.8.0 useCompositeItem; MIT: THIRD_PARTY_NOTICES.md.
import { createAttachmentKey } from 'svelte/attachments';
import { useCompositeRootContext } from '../root/CompositeRootContext.js';
import { useCompositeListItem } from '../list/useCompositeListItem.svelte.js';
export function useCompositeItem(
  getParameters: () => { metadata?: Record<string, unknown> } = () => ({}),
) {
  const root = useCompositeRootContext();
  const item = useCompositeListItem(getParameters);
  const itemRef = { current: null as HTMLElement | null };
  const attachmentKey = createAttachmentKey();
  function attachItem(node: HTMLElement) {
    itemRef.current = node;
    const unregister = item.attach(node);
    return () => {
      unregister();
      if (itemRef.current === node) itemRef.current = null;
    };
  }
  return {
    get compositeProps() {
      const isHighlighted = root.highlightedIndex === item.index();
      return {
        [attachmentKey]: attachItem,
        tabindex: isHighlighted ? 0 : -1,
        onfocusin() {
          root.onHighlightedIndexChange(item.index());
        },
        onmousemove() {
          const element = itemRef.current;
          if (!root.highlightItemOnHover || !element) return;
          const disabled =
            element.hasAttribute('disabled') || element.ariaDisabled === 'true';
          if (!isHighlighted && !disabled) element.focus();
        },
      };
    },
    index: item.index,
  };
}
