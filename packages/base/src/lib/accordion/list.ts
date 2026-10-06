// Private automatic-index closure of CompositeList/useCompositeListItem.
// mui/base-ui v1.8.0, 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT.
// Accordion exposes no explicit-index, label or navigation registration API.
export function createItemList() {
  const registrations = new Set<HTMLElement>();
  // Every item subscribes independently, including replacement Items sharing a host.
  const subscribers = new Set<{ node: HTMLElement; publishIndex: (index: number) => void }>();
  let observer: MutationObserver | undefined;
  let queued = false;
  let destroyed = false;
  function schedule() {
    if (queued || destroyed) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      if (!destroyed) flush();
    });
  }
  function flush() {
    observer?.disconnect();
    observer = undefined;
    const nodes = [...registrations]
      .filter((node) => node.isConnected)
      .sort((first, last) => (first.compareDocumentPosition(last) & 4 ? -1 : 1));
    const indexes = new Map(nodes.map((node, index) => [node, index]));
    subscribers.forEach(({ node, publishIndex }) => {
      const index = indexes.get(node);
      if (index !== undefined) publishIndex(index);
    });
    if (nodes.length < 2) return;
    const Observer = nodes[0].ownerDocument.defaultView?.MutationObserver;
    if (!Observer) return;
    observer = new Observer((entries) => {
      if (!entries.some((entry) => [...entry.removedNodes].some((node) => node.isConnected)))
        return;
      let previous: HTMLElement | undefined;
      for (const node of nodes) {
        if (!node.isConnected) continue;
        if (previous && !(previous.compareDocumentPosition(node) & 4)) {
          observer?.disconnect();
          schedule();
          return;
        }
        previous = node;
      }
    });
    const roots = new Set<HTMLElement>();
    for (let index = 1; index < nodes.length; index += 1) {
      let ancestor = nodes[index - 1].parentElement;
      while (ancestor && !ancestor.contains(nodes[index])) ancestor = ancestor.parentElement;
      if (ancestor) roots.add(ancestor);
    }
    roots.forEach((root) => observer?.observe(root, { childList: true }));
  }
  return {
    register(node: HTMLElement, publishIndex: (index: number) => void) {
      const subscriber = { node, publishIndex };
      subscribers.add(subscriber);
      registrations.add(node);
      schedule();
      // Like the pin, detaching any shared-host registration deletes that node.
      return () => {
        subscribers.delete(subscriber);
        registrations.delete(node);
        schedule();
      };
    },
    destroy() {
      destroyed = true;
      observer?.disconnect();
      registrations.clear();
      subscribers.clear();
    },
  };
}
