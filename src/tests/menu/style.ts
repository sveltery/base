import { onTestFinished } from 'vitest';

/** Adds a stylesheet, such as an exit animation, for the rest of the current test. */
export function testStyle(css: string) {
	const style = document.createElement('style');
	style.textContent = css;
	document.head.append(style);
	onTestFinished(() => style.remove());
}
