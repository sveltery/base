// Native default-message ownership for the pinned Base UI FieldError message keys.
// Ordered key reuse/deletion/placement follows react-dom 19.3.0; MIT: parity/field-form/REACT_LICENSE.
// Track logical children separately from native rows: duplicate overwritten keys lose deletion ownership.
export class ErrorMessageOwnership {
  private active: { id: number; key: string; index: number }[] = [];
  private dom: { id: number; key: string; index: number }[] = [];
  private nextId = 0;
  update(keys: string[]) {
    if (keys.length < 2) { this.active = []; this.dom = []; return []; }
    const old = this.active;
    const next: typeof old = [], deleted = new Set<number>(), placements = new Set<number>();
    let index = 0, lastPlacedIndex = 0;
    const add = (key: string, prior?: (typeof old)[number]) => {
      const row = { id: prior?.id ?? ++this.nextId, key, index };
      if (!prior || prior.index < lastPlacedIndex) placements.add(row.id);
      else lastPlacedIndex = prior.index;
      next.push(row); index++;
    };
    while (index < old.length && index < keys.length && old[index].key === keys[index]) add(keys[index], old[index]);
    if (index === keys.length) for (const row of old.slice(index)) deleted.add(row.id);
    else {
      const remaining = new Map(old.slice(index).map(row => [row.key, row]));
      while (index < keys.length) {
        const key = keys[index], prior = remaining.get(key);
        if (prior) remaining.delete(key);
        add(key, prior);
      }
      for (const row of remaining.values()) deleted.add(row.id);
    }
    const dom = this.dom.filter(row => !deleted.has(row.id));
    for (let i = 0; i < next.length; i++) {
      const row = next[i];
      if (!placements.has(row.id)) continue;
      const current = dom.findIndex(item => item.id === row.id);
      if (current !== -1) dom.splice(current, 1);
      const anchor = next.slice(i + 1).find(item => !placements.has(item.id));
      const before = anchor ? dom.findIndex(item => item.id === anchor.id) : -1;
      dom.splice(before === -1 ? dom.length : before, 0, row);
    }
    this.active = next; this.dom = dom;
    return dom.map(({ id, key }) => ({ id, key }));
  }
}
