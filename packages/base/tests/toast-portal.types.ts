import type { Snippet } from 'svelte';
import type { ToastPortalProps, ToastPortalState } from '../src/lib/toast/index.js';
const portal: ToastPortalProps = {
  container: { current: null },
  id: 'portal',
  lang: 'fr',
  class: (state: ToastPortalState) => {
    void state;
    return 'portal';
  },
  style: () => 'color:green',
  onclick(event) {
    event.preventBaseUIHandler();
  },
};
function replacement(
  render: Snippet<[Record<string | symbol, unknown>, ToastPortalState, Snippet | undefined]>,
) {
  portal.render = render;
}
void replacement;
// @ts-expect-error -- Toast.Portal has no Dialog presence prop.
portal.keepMounted = true;
// @ts-expect-error -- Native Svelte class is the accepted framework substitution.
portal.className = 'portal';
// @ts-expect-error -- CSS strings are the accepted style substitution.
portal.style = { color: 'green' };
