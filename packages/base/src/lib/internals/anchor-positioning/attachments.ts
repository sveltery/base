import type { Attachment } from 'svelte/attachments';
import type { AnchorPositioningController } from './controller.svelte.js';

/** Stable attachments register hosts and release only the registration they own. */
export function positioningAttachments(controller: AnchorPositioningController) {
  const reference: Attachment<Element> = (node) => {
    controller.setReference(node);
    return () => {
      if (controller.elements.domReference === node) controller.setReference(null);
    };
  };
  const floating: Attachment<HTMLElement> = (node) => {
    // Seed once. Reactive output never rewrites these middleware-owned properties.
    node.style.setProperty('--available-width', '100vw');
    node.style.setProperty('--available-height', '100vh');
    controller.setFloating(node);
    return () => {
      if (controller.elements.floating === node) controller.setFloating(null);
    };
  };
  const arrow: Attachment<HTMLElement> = (node) => {
    controller.setArrow(node);
    return () => {
      if (controller.elements.arrow === node) controller.setArrow(null);
    };
  };
  return { reference, floating, arrow };
}
