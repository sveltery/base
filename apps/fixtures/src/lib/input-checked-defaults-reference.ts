// Independent actual Base UI 1.8.0 lifecycle supplements; MIT source attribution:
// parity/input/UPSTREAM_LICENSE. No ordinary Input/Field assertion credit.
import { createElement as h, type ComponentProps } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { Input } from '@base-ui/react/input';
type CheckedProps = Omit<ComponentProps<typeof Input>, 'checked'> & { checked?: boolean | null };
export function mountInputCheckedDefaultsReference(target: HTMLElement, props: CheckedProps, hydration: boolean) {
  // React's declaration omits null, but the actual native input treats it as uncontrolled.
  const element = h('form', null, h(Input, props as ComponentProps<typeof Input>));
  const root = hydration ? hydrateRoot(target, element) : createRoot(target);
  if (!hydration) root.render(element);
  return () => root.unmount();
}
