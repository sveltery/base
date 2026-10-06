// Ported from Base UI v1.8.0 useCompositeItem; MIT: THIRD_PARTY_NOTICES.md.
import { createAttachmentKey } from 'svelte/attachments';
import { useCompositeRootContext } from '../root/CompositeRootContext.js';
import { useCompositeListItem } from '../list/useCompositeListItem.svelte.js';
export class useCompositeItem {
  private root = useCompositeRootContext();
  private item: useCompositeListItem;
  private itemRef = { current: null as HTMLElement | null };
  private attachmentKey = createAttachmentKey();

  constructor(getParameters: () => { metadata?: Record<string, unknown> } = () => ({})) {
    this.item = new useCompositeListItem(getParameters);
  }

  private attachItem = (node: HTMLElement) => {
    this.itemRef.current = node;
    const unregister = this.item.attach(node);
    return () => {
      unregister();
      if (this.itemRef.current === node) this.itemRef.current = null;
    };
  };

  get compositeProps() {
    const isHighlighted = this.root.highlightedIndex === this.item.index();
    return {
      [this.attachmentKey]: this.attachItem,
      tabindex: isHighlighted ? 0 : -1,
      onfocusin: () => {
        this.root.onHighlightedIndexChange(this.item.index());
      },
      onmousemove: () => {
        const element = this.itemRef.current;
        if (!this.root.highlightItemOnHover || !element) return;
        const disabled = element.hasAttribute('disabled') || element.ariaDisabled === 'true';
        if (!isHighlighted && !disabled) element.focus();
      },
    };
  }

  index = () => this.item.index();
}
