interface Lock { count: number; value: string; priority: string }
const locks = new WeakMap<Document, Lock>();
/** Per-document reference counting preserves prior inline locks and nested ownership. */
export function lockScroll(document: Document): () => void {
  let lock = locks.get(document);
  const style = document.documentElement.style;
  if (!lock) {
    lock = { count: 0, value: style.getPropertyValue('overflow'), priority: style.getPropertyPriority('overflow') };
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
        if (lock.value) style.setProperty('overflow', lock.value, lock.priority);
        else style.removeProperty('overflow');
      }
      locks.delete(document);
    }
  };
}
