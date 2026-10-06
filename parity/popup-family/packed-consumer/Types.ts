import type { ComponentProps, Snippet } from 'svelte';
import * as Popover from '@sveltery/base/popover';
import * as PreviewCard from '@sveltery/base/preview-card';
import * as Tooltip from '@sveltery/base/tooltip';
import PayloadTypes from './PayloadTypes.svelte';
const popover = Popover.createHandle<number>();
const previewCard = PreviewCard.createHandle<number>();
const tooltip = Tooltip.createHandle<number>();
const direct: Snippet = null as unknown as Snippet;
const popoverRoot: ComponentProps<typeof Popover.Root<number>> = { handle: popover, children: direct, actions: undefined, open: undefined, modal: undefined, triggerId: undefined, defaultTriggerId: undefined, onOpenChange: undefined, onOpenChangeComplete: undefined, defaultOpen: undefined };
const previewRoot: PreviewCard.Root.Props<number> = { handle: previewCard, children: direct, actions: undefined };
const tooltipRoot: Tooltip.Root.Props<number> = { handle: tooltip, children: direct, disabled: undefined, disableHoverablePopup: undefined, trackCursorAxis: undefined };
// Source popover/root/PopoverRoot.spec.tsx negative payload directive.
// @ts-expect-error Number Handle rejects the string payload.
const wrongPopover: ComponentProps<typeof Popover.Trigger<number>> = { handle: popover, payload: 'hello' };
// Source preview-card/root/PreviewCardRoot.spec.tsx negative payload directive.
// @ts-expect-error Number Handle rejects the string payload.
const wrongPreview: ComponentProps<typeof PreviewCard.Trigger<number>> = { handle: previewCard, payload: 'hello' };
// Source popover/positioner/PopoverPositioner.spec.tsx mounting policy directive.
// @ts-expect-error keepMounted belongs to Portal.
const wrongPopoverPositioner: Popover.Positioner.Props = { keepMounted: true };
// Source preview-card/positioner/PreviewCardPositioner.spec.tsx mounting policy directive.
// @ts-expect-error keepMounted belongs to Portal.
const wrongPreviewPositioner: PreviewCard.Positioner.Props = { keepMounted: true };
// Source tooltip/positioner/TooltipPositioner.spec.tsx mounting policy directive.
// @ts-expect-error keepMounted belongs to Portal.
const wrongTooltipPositioner: Tooltip.Positioner.Props = { keepMounted: true };
const optionalPositioner: Popover.Positioner.Props = { anchor: undefined, positionMethod: undefined, side: undefined, align: undefined, sideOffset: undefined, alignOffset: undefined, collisionBoundary: undefined, collisionPadding: undefined, sticky: undefined, arrowPadding: undefined, disableAnchorTracking: undefined, collisionAvoidance: undefined, ref: undefined, children: undefined, class: undefined, style: undefined, render: undefined };
const previewOptional: PreviewCard.Trigger.Props<number> = { handle: previewCard, payload: undefined, delay: undefined, closeDelay: undefined, render: undefined, href: null };
const tooltipOptional: Tooltip.Trigger.Props<number> = { handle: tooltip, payload: undefined, delay: undefined, closeDelay: undefined, closeOnClick: undefined, disabled: undefined };
const portal: Popover.Portal.Props = { container: undefined, keepMounted: undefined };
const popup: Popover.Popup.Props = { initialFocus: undefined, finalFocus: undefined };
const provider: Tooltip.Provider.Props = { children: undefined, delay: undefined, closeDelay: undefined, timeout: undefined };
// Extra native API negative, separate from the five Source directives.
// @ts-expect-error Tooltip Handle retains its numeric payload.
const wrongTooltip: Tooltip.Trigger.Props<number> = { handle: tooltip, payload: 'hello' };
const callbacks: Popover.Trigger.Props = { class: state => ['trigger', { open: state.open }], style: state => state.open ? 'opacity: 1' : undefined, onclick(event) { event.preventBaseUIHandler(); const element: HTMLButtonElement = event.currentTarget; void element; } };
void [PayloadTypes, popoverRoot, previewRoot, tooltipRoot, wrongPopover, wrongPreview, wrongPopoverPositioner, wrongPreviewPositioner, wrongTooltipPositioner, optionalPositioner, previewOptional, tooltipOptional, portal, popup, provider, wrongTooltip, callbacks];

import type * as Root from '@sveltery/base';
function namespaceParity(props: Root.PopoverRoot.Props<number>) { const actual: Popover.Root.Props<number> = props; return actual; }
void namespaceParity;
