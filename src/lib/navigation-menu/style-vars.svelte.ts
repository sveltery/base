// The size variables upstream writes with `style.setProperty` on the popup and the positioner.
// Svelte replaces the whole style attribute when a part's style changes, which would drop them.
// Each write lands on the element at once, so the next measurement sees it, and in state,
// so the style the part renders keeps it.

/** CSS variables of one element, kept across style attribute updates. */
export class StyleVars {
	values = $state.raw<Record<string, string>>({});

	/** Writes the variables to `element` now. A `null` value removes one. */
	set(element: HTMLElement, entries: Record<string, string | null>) {
		const next = { ...this.values };
		for (const [name, value] of Object.entries(entries)) {
			if (value == null) {
				element.style.removeProperty(name);
				delete next[name];
			} else {
				element.style.setProperty(name, value);
				next[name] = value;
			}
		}
		this.values = next;
	}

	clear() {
		if (Object.keys(this.values).length > 0) this.values = {};
	}
}
