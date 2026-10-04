// Test-only actual published Original1.8 private helper boundary; never imported by runtime.
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
const require = createRequire(new URL('../../../../apps/fixtures/package.json', import.meta.url));
const React: typeof import('../../../../apps/fixtures/node_modules/@types/react/index.js') = require('react');
const { createRoot }: typeof import('../../../../apps/fixtures/node_modules/@types/react-dom/client.js') = require('react-dom/client');
const packageRoot = dirname(require.resolve('@base-ui/react/package.json'));
const { FloatingDelayGroup, useDelayGroup }: typeof import('../../../../apps/fixtures/node_modules/@base-ui/react/floating-ui-react/components/FloatingDelayGroup.js') = require(resolve(packageRoot, 'floating-ui-react/components/FloatingDelayGroup.js'));
const { FloatingRootStore }: typeof import('../../../../apps/fixtures/node_modules/@base-ui/react/floating-ui-react/components/FloatingRootStore.js') = require(resolve(packageRoot, 'floating-ui-react/components/FloatingRootStore.js'));
const { PopupTriggerMap }: typeof import('../../../../apps/fixtures/node_modules/@base-ui/react/utils/popups/popupTriggerMap.js') = require(resolve(packageRoot, 'utils/popups/popupTriggerMap.js'));
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

export async function mountOriginalDelayOwnership(target: HTMLElement, closedSecond = false) {
  const requests: { owner: string; open: boolean; reason: string }[] = [];
  function makeStore(id: string, open = true) {
    return new FloatingRootStore({
      open, transitionStatus: undefined, referenceElement: null, floatingElement: null,
      triggerElements: new PopupTriggerMap(), floatingId: id, syncOnly: false, nested: false,
      onOpenChange(open, details) { requests.push({ owner: id, open, reason: details.reason }); },
    });
  }
  const first = makeStore('one'); const second = makeStore('two', !closedSecond);
  let group: ReturnType<typeof useDelayGroup> | undefined;
  function Consumer({ store }: { store: InstanceType<typeof FloatingRootStore> }) {
    const open = store.useState('open'); group = useDelayGroup(store, { open });
    return React.createElement('output', null, group.isInstantPhase ? 'instant' : 'normal');
  }
  const root = createRoot(target);
  const render = (store: InstanceType<typeof FloatingRootStore>) => React.createElement(
    FloatingDelayGroup, { delay: { open: 1000, close: 200 }, timeoutMs: 500 }, React.createElement(Consumer, { store }),
  );
  await React.act(async () => root.render(render(first)));
  return {
    async changeId() { await React.act(async () => first.set('floatingId', 'two')); },
    async switchStore() { await React.act(async () => root.render(render(second))); },
    async closeFirst() { await React.act(async () => first.set('open', false)); },
    async reopenFirst() { await React.act(async () => first.set('open', true)); },
    async changeIdAndClose() { await React.act(async () => { first.set('floatingId', 'two'); first.set('open', false); }); },
    read() { if (!group) throw Error('Original group did not mount'); return { activeId: group.activeIdRef.current, instant: group.isInstantPhase, requests: requests.slice() }; },
    async stop() { await React.act(async () => root.unmount()); },
  };
}
export async function advanceOriginalDelayTime(callback: () => void) { await React.act(callback); }
