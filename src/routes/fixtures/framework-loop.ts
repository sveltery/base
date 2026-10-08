/** Runs the same cases against the Svelte fixture and the React reference. */
export function forEachFramework(define: (reference: boolean, framework: string) => void) {
	for (const reference of [false, true]) {
		define(reference, reference ? 'react' : 'svelte');
	}
}
