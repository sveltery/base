// Original Base UI 1.8.0 isOutsideMenuEvent (MIT).
import type { FloatingTreeType } from '../../floating-ui/types.js';
import { contains } from '../../floating-ui/utils/element.js';
import { getNodeChildren } from '../../floating-ui/utils/nodes.js';

interface Targets {
  currentTarget: HTMLElement | null;
  relatedTarget: HTMLElement | null;
}

interface Params {
  popupElement: HTMLElement | null;
  rootRef: { current: HTMLElement | null };
  tree: FloatingTreeType | null;
  nodeId: string | undefined;
}

export function isOutsideMenuEvent({ currentTarget, relatedTarget }: Targets, params: Params) {
  const { popupElement, rootRef, tree, nodeId } = params;

  const nodeChildrenContains = tree
    ? getNodeChildren(tree.nodesRef.current, nodeId).some((node) =>
        contains(node.context?.elements.floating, relatedTarget),
      )
    : false;

  if (!popupElement) {
    return !contains(rootRef.current, relatedTarget) && !nodeChildrenContains;
  }

  return (
    !contains(popupElement, currentTarget) &&
    !contains(popupElement, relatedTarget) &&
    !contains(rootRef.current, relatedTarget) &&
    !nodeChildrenContains
  );
}
