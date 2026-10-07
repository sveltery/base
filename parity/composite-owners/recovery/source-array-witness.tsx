// Newly authored supplement from the immutable CompositeList contract. MIT.
// Source199 remains separately archived and executed without assertion changes.
import * as React from 'react';
import { CompositeList } from './original/packages/react/src/internals/composite/list/CompositeList';
import { useCompositeListItem } from './original/packages/react/src/internals/composite/list/useCompositeListItem';

export function createArrayWitness() {
  const elements = { current: [] as Array<HTMLElement | null> };
  const labels = { current: [] as Array<string | null> };
  const control: Record<string, () => void> = {};
  function Item({ id, revision }: { id: string; revision: number }) {
    const metadata = React.useMemo(() => ({ revision }), [revision]);
    const { ref } = useCompositeListItem({ label: id, metadata });
    return <div ref={ref} data-testid={id}>{id}</div>;
  }
  function App() {
    const [ids, setIds] = React.useState(['item']);
    const [revision, setRevision] = React.useState(0);
    control.add = () => setIds(['item', 'other']);
    control.reorder = () => setIds(['other', 'item']);
    control.updateMetadata = () => setRevision((value) => value + 1);
    control.remove = () => setIds(['item']);
    return <CompositeList elementsRef={elements} labelsRef={labels}>{ids.map((id) => <Item key={id} id={id} revision={revision} />)}</CompositeList>;
  }
  return { App, elements, labels, control };
}
