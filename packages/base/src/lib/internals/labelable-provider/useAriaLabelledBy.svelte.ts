// Source label association from Base UI v1.8.0 useAriaLabelledBy.ts at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
interface Parameters {
  explicitAriaLabelledBy?: string; labelId?: string;
  labelSource: (HTMLElement & { labels?: NodeListOf<HTMLLabelElement> | null }) | null;
  enableFallback?: boolean; generatedLabelId: string;
}
export function useAriaLabelledBy(getParameters: () => Parameters): () => string | undefined {
  let fallbackAriaLabelledBy = $state<string>();
  $effect(() => {
    const { explicitAriaLabelledBy, labelId, labelSource, enableFallback = true, generatedLabelId } = getParameters();
    const update = () => {
      const next = explicitAriaLabelledBy || labelId || !enableFallback ? undefined : getAriaLabelledBy(labelSource, generatedLabelId);
      if (fallbackAriaLabelledBy !== next) fallbackAriaLabelledBy = next;
    };
    update();
    if (!labelSource || explicitAriaLabelledBy || labelId || !enableFallback) return;
    // React's every-commit effect observes label DOM changes. The native port
    // observes the actual external label associations, including sibling mounts.
    const observer = new labelSource.ownerDocument.defaultView!.MutationObserver(update);
    observer.observe(labelSource.ownerDocument.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['id', 'for'] });
    return () => observer.disconnect();
  });
  return () => {
    const { explicitAriaLabelledBy, labelId } = getParameters();
    return explicitAriaLabelledBy ?? labelId ?? fallbackAriaLabelledBy;
  };
}
function getAriaLabelledBy(labelSource: Parameters['labelSource'], generatedLabelId: string) {
  const label = findAssociatedLabel(labelSource);
  if (!label) return undefined;
  if (!label.id) label.id = generatedLabelId;
  return label.id || undefined;
}
function findAssociatedLabel(labelSource: Parameters['labelSource']) {
  if (!labelSource) return undefined;
  const parent = labelSource.parentElement;
  if (parent?.tagName === 'LABEL') return parent as HTMLLabelElement;
  const controlId = labelSource.id;
  if (controlId) {
    const nextSibling = labelSource.nextElementSibling as HTMLLabelElement | null;
    if (nextSibling && nextSibling.htmlFor === controlId) return nextSibling;
  }
  return labelSource.labels?.[0];
}
