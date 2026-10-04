// Test-only actual published Original1.8 private helper boundary; never imported by runtime.
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import type { BaseUIChangeEventDetails } from '../../src/lib/internals/createBaseUIEventDetails.js';
// Package DOM tests run with packages/base as cwd; Vite gives import.meta.url a browser URL.
const require = createRequire(resolve(process.cwd(), '../../apps/fixtures/package.json'));
const React: typeof import('../../../../apps/fixtures/node_modules/@types/react/index.js') = require('react');
const { createRoot }: typeof import('../../../../apps/fixtures/node_modules/@types/react-dom/client.js') = require('react-dom/client');
const packageRoot = dirname(require.resolve('@base-ui/react/package.json'));
// Published private declarations refer to unshipped @base-ui/utils and react-dom
// types. This test-only protocol names only the actual Source members consumed;
// require still loads the real published classes/hooks. Native contracts stay strict.
type SourceState = { open: boolean; floatingId: string | undefined };
interface SourceStore {
  set<Key extends keyof SourceState>(key: Key, value: SourceState[Key]): void;
  useState<Key extends keyof SourceState>(key: Key): SourceState[Key];
  select<Key extends keyof SourceState>(key: Key): SourceState[Key];
  setOpen(open: boolean, details: BaseUIChangeEventDetails<string>): void;
}
interface SourceGroup { activeIdRef: { current: string | null | undefined }; isInstantPhase: boolean }
interface SourceGroupProps {
  delay: { open: number; close: number }; timeoutMs: number;
  children?: import('../../../../apps/fixtures/node_modules/@types/react/index.js').ReactNode;
}
const { FloatingDelayGroup, useDelayGroup }: {
  FloatingDelayGroup(props: SourceGroupProps): import('../../../../apps/fixtures/node_modules/@types/react/index.js').ReactElement;
  useDelayGroup(store: SourceStore, options: { open: boolean }): SourceGroup;
} = require(resolve(packageRoot, 'floating-ui-react/components/FloatingDelayGroup.js'));
const { FloatingRootStore }: { FloatingRootStore: new (options: {
  open: boolean; floatingId: string; transitionStatus: undefined; referenceElement: null; floatingElement: null;
  triggerElements: object; syncOnly: false; nested: false;
  onOpenChange(open: boolean, details: BaseUIChangeEventDetails<string>): void;
}) => SourceStore } = require(resolve(packageRoot, 'floating-ui-react/components/FloatingRootStore.js'));
const { PopupTriggerMap }: { PopupTriggerMap: new () => object } = require(resolve(packageRoot, 'utils/popups/popupTriggerMap.js'));
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
