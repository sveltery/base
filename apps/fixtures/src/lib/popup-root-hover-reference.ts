// Literal pinned regular Root controlled multiple-detached setup for transport characterization.
// MIT, Source47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. Supplement, zero Original credit.
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { PreviewCard } from '@base-ui/react/preview-card';
import { Tooltip } from '@base-ui/react/tooltip';
const h = React.createElement;
export function flushRootHoverReference(callback: () => void = () => {}) {
  flushSync(callback);
}
export async function actRootHoverReference(callback: () => void | Promise<void>) {
  await React.act(callback);
}
export function mountRootHoverReference(
  target: HTMLElement,
  family: 'preview-card' | 'tooltip',
  record: (open: boolean) => void,
) {
  const previewCard = PreviewCard.createHandle();
  const tooltip = Tooltip.createHandle();
  function Fixture() {
    const [open, setOpen] = React.useState(false);
    const onOpenChange = (nextOpen: boolean) => {
      record(open);
      setOpen(nextOpen);
    };
    if (family === 'preview-card')
      return h(
        React.Fragment,
        null,
        h(PreviewCard.Trigger, { id: 'trigger', href: '#', handle: previewCard }, 'Link'),
        h(
          PreviewCard.Trigger,
          { id: 'trigger-2', href: '#', handle: previewCard },
          'Toggle another',
        ),
        h(
          PreviewCard.Root,
          { handle: previewCard, open, onOpenChange },
          h(
            PreviewCard.Portal,
            null,
            h(
              PreviewCard.Positioner,
              { 'data-testid': 'positioner' } as React.HTMLAttributes<HTMLDivElement>,
              h(
                PreviewCard.Popup,
                { 'data-testid': 'popup' } as React.HTMLAttributes<HTMLDivElement>,
                'Content',
              ),
            ),
          ),
        ),
      );
    return h(
      React.Fragment,
      null,
      h(Tooltip.Trigger, { id: 'trigger', handle: tooltip }, 'Toggle'),
      h(Tooltip.Trigger, { id: 'trigger-2', handle: tooltip }, 'Toggle another'),
      h(
        Tooltip.Root,
        { handle: tooltip, open, onOpenChange },
        h(
          Tooltip.Portal,
          null,
          h(
            Tooltip.Positioner,
            { 'data-testid': 'positioner' } as React.HTMLAttributes<HTMLDivElement>,
            h(
              Tooltip.Popup,
              { 'data-testid': 'popup' } as React.HTMLAttributes<HTMLDivElement>,
              'Content',
            ),
          ),
        ),
      ),
    );
  }
  const root = createRoot(target);
  root.render(h(Fixture));
  return { stop: () => root.unmount() };
}
