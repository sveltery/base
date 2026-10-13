// Assertions follow Base UI v1.9.0 packages/react/src/toast/createToastManager.spec.tsx,
// packages/react/src/toast/useToastManager.spec.tsx, packages/react/src/toast/createToastManager.test.tsx
// ('returns a toast id'), and packages/react/src/toast/utils/isRenderableNode.test.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// The `@ts-expect-error` lines are checked by `pnpm check`. `isRenderable` takes `string | Snippet`,
// so upstream's number, bigint, and array cases have no counterpart, and `hasRenderableChildren`
// inspects React elements, which a snippet does not allow.
import { describe, expect, expectTypeOf, it } from 'vitest';
import type { Snippet } from 'svelte';
import { getToastManager } from './context.js';
import { createToastManager, toastManagerSubscribe } from './create-toast-manager.js';
import type { ToastManagerEvent } from './types.js';
import { isRenderable } from './utils.js';

type ToastPayload = {
	id: string;
	count: number;
};

type CallableData = () => string;

describe('createToastManager', () => {
	it('returns the id it generates, or the one it is given, and emits the toast', () => {
		const manager = createToastManager();
		const events: ToastManagerEvent[] = [];
		const unsubscribe = manager[toastManagerSubscribe]((event) => events.push(event));

		const generatedId = manager.add({ title: 'title' });
		expect(generatedId).toMatch(/^toast-[a-z0-9]+-\d+$/);
		expect(manager.add({ id: 'save', title: 'Saving…' })).toBe('save');

		expect(events).toEqual([
			{
				action: 'add',
				options: { title: 'title', id: generatedId, transitionStatus: 'starting' }
			},
			{
				action: 'add',
				options: { title: 'Saving…', id: 'save', transitionStatus: 'starting' }
			}
		]);

		unsubscribe();
		manager.close('save');
		expect(events).toHaveLength(2);
	});

	it('types the toast data from its type argument', () => {
		const typedManager = createToastManager<ToastPayload>();
		const events: ToastManagerEvent[] = [];
		typedManager[toastManagerSubscribe]((event) => events.push(event));

		const typedAddId = typedManager.add({ title: 'typed', data: { id: 'typed', count: 1 } });
		expectTypeOf(typedAddId).toEqualTypeOf<string>();

		typedManager.add({
			title: 'wrong-shape',
			data: {
				id: 'test',
				// @ts-expect-error - message is not a valid property
				message: 'not a number'
			}
		});

		typedManager.add({
			title: 'wrong-shape',
			// @ts-expect-error - count is a missing property
			data: { id: 'test' }
		});

		typedManager.update('typed', { data: { id: 'typed-update', count: 2 } });

		typedManager.update('typed', {
			// @ts-expect-error - id is a missing property, `data` replaces the whole value
			data: { count: 2 }
		});

		typedManager.update('typed', (prevToast) => {
			expectTypeOf(prevToast.data).toEqualTypeOf<ToastPayload | undefined>();
			return { data: { id: 'typed-update', count: 2 } };
		});

		// @ts-expect-error - count is a missing property, the updater returns the whole value
		typedManager.update('typed', () => ({ data: { id: 'typed-update' } }));

		void typedManager
			.promise(Promise.resolve(2), {
				loading: 'loading',
				success: (value) => ({
					title: `${value}`,
					data: { id: 'typed-success', count: value }
				}),
				error: 'error'
			})
			.catch(() => {});

		const legacyManager = createToastManager();
		const legacyAddId = legacyManager.add<ToastPayload>({
			title: 'legacy',
			data: { id: 'legacy', count: 3 }
		});
		expectTypeOf(legacyAddId).toEqualTypeOf<string>();
		legacyManager.update<ToastPayload>('legacy', { data: { id: 'legacy-update', count: 4 } });
		legacyManager.update<ToastPayload>('legacy', (prevToast) => ({
			data: { id: 'legacy', count: (prevToast.data?.count ?? 0) + 1 }
		}));
		void legacyManager
			.promise<number, ToastPayload>(Promise.resolve(5), {
				loading: 'loading',
				success: (value) => ({
					title: `${value}`,
					data: { id: 'legacy-success', count: value }
				}),
				error: 'error'
			})
			.catch(() => {});

		const callableManager = createToastManager<CallableData>();
		callableManager.add({ data: () => 'initial' });
		callableManager.update('callable', { data: () => 'replacement' });
		callableManager.update('callable', (prevToast) => {
			expectTypeOf(prevToast.data).toEqualTypeOf<CallableData | undefined>();
			return { data: prevToast.data };
		});
		void callableManager
			.promise(Promise.resolve(1), {
				loading: { data: () => 'loading' },
				success: { data: () => 'done' },
				error: 'failed'
			})
			.catch(() => {});

		expect(events.map((event) => event.action)).toEqual([
			'add',
			'add',
			'add',
			'update',
			'update',
			'update',
			'update',
			'promise'
		]);
	});
});

// `getToastManager` reads context, so it can only be called during component init. This
// function is never called: it exists for the type checker.
export function getToastManagerTypes() {
	const typedManager = getToastManager<ToastPayload>();

	const typedToastData = typedManager.toasts[0]?.data;
	expectTypeOf(typedToastData).toEqualTypeOf<ToastPayload | undefined>();

	const typedAddId = typedManager.add({ title: 'typed', data: { id: 'typed', count: 1 } });
	expectTypeOf(typedAddId).toEqualTypeOf<string>();

	typedManager.add({
		title: 'wrong-shape',
		data: {
			id: 'test',
			// @ts-expect-error - message is not a valid property
			message: 'not a number'
		}
	});

	typedManager.add({
		title: 'wrong-shape',
		// @ts-expect-error - count is a missing property
		data: { id: 'test' }
	});

	typedManager.update('typed', { data: { id: 'typed-update', count: 2 } });

	typedManager.update('typed', {
		// @ts-expect-error - id is a missing property, `data` replaces the whole value
		data: { count: 2 }
	});

	typedManager.update('typed', (prevToast) => {
		expectTypeOf(prevToast.data).toEqualTypeOf<ToastPayload | undefined>();
		return { data: { id: 'typed-update', count: 2 } };
	});

	// @ts-expect-error - count is a missing property, the updater returns the whole value
	typedManager.update('typed', () => ({ data: { id: 'typed-update' } }));

	typedManager.promise(Promise.resolve(2), {
		loading: 'loading',
		success: (value) => ({ title: `${value}`, data: { id: 'typed-success', count: value } }),
		error: 'error'
	});

	const legacyManager = getToastManager();
	const legacyAddId = legacyManager.add<ToastPayload>({
		title: 'legacy',
		data: { id: 'legacy', count: 3 }
	});
	expectTypeOf(legacyAddId).toEqualTypeOf<string>();
	legacyManager.update<ToastPayload>('legacy', { data: { id: 'legacy-update', count: 4 } });
	legacyManager.update<ToastPayload>('legacy', (prevToast) => ({
		data: { id: 'legacy', count: (prevToast.data?.count ?? 0) + 1 }
	}));
	legacyManager.promise<number, ToastPayload>(Promise.resolve(5), {
		loading: 'loading',
		success: (value) => ({ title: `${value}`, data: { id: 'legacy-success', count: value } }),
		error: 'error'
	});

	const callableManager = getToastManager<CallableData>();
	callableManager.add({ data: () => 'initial' });
	callableManager.update('callable', { data: () => 'replacement' });
	callableManager.update('callable', (prevToast) => {
		expectTypeOf(prevToast.data).toEqualTypeOf<CallableData | undefined>();
		return { data: prevToast.data };
	});
	callableManager.promise(Promise.resolve(1), {
		loading: { data: () => 'loading' },
		success: { data: () => 'done' },
		error: 'failed'
	});
}

describe('isRenderable', () => {
	it('treats text and snippets as content', () => {
		const snippet = (() => {}) as unknown as Snippet;
		expect(isRenderable('text')).toBe(true);
		expect(isRenderable(snippet)).toBe(true);
	});

	it('treats non-rendering values as empty', () => {
		expect(isRenderable(null)).toBe(false);
		expect(isRenderable(undefined)).toBe(false);
		expect(isRenderable(true)).toBe(false);
		expect(isRenderable(false)).toBe(false);
		expect(isRenderable('')).toBe(false);
	});
});
