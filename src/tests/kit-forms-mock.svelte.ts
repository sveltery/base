// A stand-in for `$app/forms` `enhance`, `$app/state` `page` and the page's `form` prop, for
// actionForm specs.
// It follows Kit 3.0.1's use:enhance: the submit function may cancel, then the request goes
// out, then the returned callback receives the result and an `update` that applies it.
import type { ActionResult, SubmitFunction } from '$app/forms';

type Respond = (formData: FormData) => ActionResult | Promise<ActionResult>;

export const server = $state({
	/** The page's `form` prop. */
	form: undefined as unknown,
	/** Entries of every request that reached the "server". */
	requests: [] as [string, string][][],
	/** Options of every `update()` call. */
	updates: [] as (Record<string, unknown> | undefined)[],
	respond: (() => ({ type: 'success', status: 200, data: {}, location: '/' })) as Respond
});

/** `$app/state`'s `page`: the URL and status of the page a submission without JavaScript renders. */
export const page = $state({ url: pageUrl('/signup'), status: 200 });

function pageUrl(path: string) {
	return new URL(path, 'http://localhost');
}

/** Renders the page as Kit does after a submission to `path` made without JavaScript. */
export function landOn(path: string, status = 200) {
	page.url = pageUrl(path);
	page.status = status;
}

export function resetServer() {
	landOn('/signup');
	server.form = undefined;
	server.requests = [];
	server.updates = [];
	server.respond = () => ({ type: 'success', status: 200, data: {}, location: '/' });
}

export function enhance(form: HTMLFormElement, submit: SubmitFunction) {
	const handle = async (event: SubmitEvent) => {
		event.preventDefault();
		const formData = new FormData(form, event.submitter);
		let cancelled = false;
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- a request URL, never mutated
		const action = new URL(form.action);
		const callback = await submit({
			action,
			formData,
			formElement: form,
			controller: new AbortController(),
			submitter: event.submitter,
			cancel: () => (cancelled = true)
		});
		if (cancelled) return;
		server.requests.push([...formData].map(([key, value]) => [key, String(value)]));
		const result = await server.respond(formData);
		await callback?.({
			action,
			formData,
			formElement: form,
			result,
			update: async (options) => {
				server.updates.push(options);
				if (result.type === 'success' && options?.reset !== false) form.reset();
				if (result.type === 'success' || result.type === 'failure') server.form = result.data;
			}
		});
	};
	form.addEventListener('submit', handle);
	return { destroy: () => form.removeEventListener('submit', handle) };
}
