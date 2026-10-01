interface Property { value: string; priority: string }
interface Lock { count: number; properties: Record<string, Property> }
const locks = new WeakMap<Document, Lock>();
const names = ['overflow', 'overflow-x', 'overflow-y'];
/** Per-document reference counting preserves prior inline locks and nested ownership. */
export function lockScroll(document: Document): () => void {
  let lock = locks.get(document);
  const style = document.documentElement.style;
  if (!lock) {
    lock = { count: 0, properties: Object.fromEntries(names.map(name => [name, { value: style.getPropertyValue(name), priority: style.getPropertyPriority(name) }])) };
    locks.set(document, lock);
    style.setProperty('overflow', 'hidden');
  }
  lock.count++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--lock.count === 0) {
      // Do not clobber an external owner which changed the lock after us.
      if (style.getPropertyValue('overflow') === 'hidden' && style.getPropertyPriority('overflow') === '') {
        style.removeProperty('overflow');
        for (const name of names) {
          const prior = lock.properties[name];
          if (prior.value) style.setProperty(name, prior.value, prior.priority);
        }
      }
      locks.delete(document);
    }
  };
}
