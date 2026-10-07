/** The only library function allowed to read `getComputedStyle(...).direction`. */
export function elementTextDirection(element: Element | null | undefined): 'ltr' | 'rtl' {
	if (!element || typeof getComputedStyle !== 'function') return 'ltr';
	return getComputedStyle(element).direction === 'rtl' ? 'rtl' : 'ltr';
}
