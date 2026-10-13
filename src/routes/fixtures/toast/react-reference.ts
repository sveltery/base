// React Base UI 1.8.0 counterpart of ToastFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Toast } from '@base-ui/react/toast';
import { caseOptions, type ToastCase } from './cases.js';

type Manager = ReturnType<typeof Toast.useToastManager>;

export function mountToastReference(node: HTMLElement, scenario: ToastCase, onReady: () => void) {
	const options = caseOptions[scenario];
	const globalManager = Toast.createToastManager();

	function Controls(props: { log: (entry: string) => void }) {
		const { log } = props;
		const manager = Toast.useToastManager();
		const count = useRef(0);
		const lastId = useRef('');
		const anchor = useRef<HTMLButtonElement>(null);
		const pending = useRef<{ resolve: (value: string) => void; reject: (error: Error) => void }>(
			undefined
		);

		const closeLogger = (title: string) => () => log(`close:${title}`);

		function add() {
			count.current += 1;
			const title = `Toast ${count.current}`;
			lastId.current = manager.add({
				title,
				description: `Description ${count.current}`,
				onClose: closeLogger(title),
				onRemove: () => log(`remove:${title}`)
			});
		}

		function addGlobal() {
			count.current += 1;
			const title = `Global ${count.current}`;
			lastId.current = globalManager.add({
				title,
				description: `Description ${count.current}`,
				onClose: closeLogger(title)
			});
		}

		function addWithAction() {
			count.current += 1;
			const title = `Toast ${count.current}`;
			lastId.current = manager.add({
				title,
				description: `Description ${count.current}`,
				onClose: closeLogger(title),
				actionProps: { children: 'Undo', onClick: () => log(`action:${title}`) }
			});
		}

		function addHigh() {
			count.current += 1;
			const title = `Urgent ${count.current}`;
			lastId.current = manager.add({
				title,
				description: `Description ${count.current}`,
				priority: 'high',
				onClose: closeLogger(title)
			});
		}

		function addAnchored() {
			count.current += 1;
			const title = `Copied ${count.current}`;
			lastId.current = manager.add({
				title,
				description: 'Copied to clipboard',
				positionerProps: { anchor: anchor.current, sideOffset: 10 },
				onClose: closeLogger(title)
			});
		}

		function updateLast() {
			manager.update(lastId.current, {
				title: 'Updated',
				description: 'Updated description',
				type: 'info'
			});
		}

		function startPromise() {
			const promise = new Promise<string>((resolve, reject) => {
				pending.current = { resolve, reject };
			});
			manager
				.promise(promise, {
					loading: { title: 'Saving', description: 'Please wait' },
					success: (result: string) => ({ title: 'Saved', description: result }),
					error: (error: Error) => ({ title: 'Failed', description: error.message })
				})
				.catch(() => {});
		}

		const button = (testId: string, label: string, onClick: () => void) =>
			h('button', { type: 'button', 'data-testid': testId, onClick }, label);

		return h(
			Fragment,
			null,
			button('add', 'Add', add),
			button('add-global', 'Add global', addGlobal),
			button('add-action', 'Add action', addWithAction),
			button('add-high', 'Add high', addHigh),
			button('add-anchored', 'Add anchored', addAnchored),
			button('update', 'Update', updateLast),
			button('promise', 'Promise', startPromise),
			button('resolve', 'Resolve', () => pending.current?.resolve('All good')),
			button('reject', 'Reject', () => pending.current?.reject(new Error('Went wrong'))),
			button('close-all', 'Close all', () => manager.close()),
			button('close-global', 'Close global', () => globalManager.close()),
			h(
				'button',
				{
					type: 'button',
					'data-testid': 'anchor',
					style: { position: 'absolute', top: 300, left: 200 },
					ref: anchor
				},
				'Anchor'
			)
		);
	}

	function toastBody(toast: Manager['toasts'][number]) {
		return h(
			Toast.Root,
			{ toast, 'data-testid': 'toast' } as never,
			options.anchored ? h(Toast.Arrow, { 'data-testid': 'arrow' } as never) : null,
			h(
				Toast.Content,
				{ 'data-testid': 'content' } as never,
				h(Toast.Title, { 'data-testid': 'title' } as never),
				h(Toast.Description, { 'data-testid': 'description' } as never),
				h(Toast.Action, { 'data-testid': 'action' } as never),
				h(Toast.Close, { 'data-testid': 'close' } as never, 'Close')
			)
		);
	}

	function List() {
		const { toasts } = Toast.useToastManager();
		return toasts.map((toast) =>
			options.anchored
				? h(
						Toast.Positioner,
						{ key: toast.id, toast, 'data-testid': 'positioner' } as never,
						toastBody(toast)
					)
				: h(Fragment, { key: toast.id }, toastBody(toast))
		);
	}

	function App() {
		const [log, setLog] = useState<string[]>([]);
		useEffect(onReady, []);
		return h(
			Fragment,
			null,
			h(
				Toast.Provider,
				{ timeout: options.timeout, limit: options.limit, toastManager: globalManager },
				h(Controls, { log: (entry: string) => setLog((previous) => previous.concat(entry)) }),
				h(
					Toast.Portal,
					null,
					h(
						Toast.Viewport,
						{
							'data-testid': 'viewport',
							className: [options.anchored && 'anchored', options.slowExit && 'slow']
								.filter(Boolean)
								.join(' ')
						} as never,
						h(List)
					)
				)
			),
			h('output', { 'data-testid': 'log' }, JSON.stringify(log))
		);
	}

	const root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}
