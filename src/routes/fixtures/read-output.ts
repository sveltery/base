import type { Page } from '@playwright/test';
import type { OpenCall } from './open-change.js';

export type { OpenCall };

export async function readOutput<T>(page: Page, testId = 'calls'): Promise<T> {
	return JSON.parse(await page.getByTestId(testId).innerText()) as T;
}

export function readOpenCalls(page: Page) {
	return readOutput<OpenCall[]>(page);
}

export type CheckedCall = { checked: boolean; reason: string; canceled: boolean };

export function readChecked(page: Page) {
	return readOutput<CheckedCall[]>(page);
}

export function readValues(page: Page) {
	return readOutput<(string | null)[]>(page, 'values');
}

export type ValueCall<T> = { value: T; reason: string; canceled: boolean };

export function readValueCalls<T>(page: Page) {
	return readOutput<ValueCall<T>[]>(page);
}
