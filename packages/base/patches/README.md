# SvelteKit 2.70.3 submit and reset compatibility patch

This patch is required for Kit 2.70.3 applications relying on synchronous Form validation, authored submit cancellation, or remote field synchronization after a trusted native reset. It makes the remote form attachment return when a submit event is already canceled. It adds exactly one `event.defaultPrevented` guard before Kit's own `preventDefault`, validation, enhancement and request, plus one native-task await after reset's existing `tick()` so its FormData snapshot follows the browser default action. Prevented resets retain Kit's existing edited-value preservation and issues/touched clearing. Reset synchronization is asynchronous; `tick()` alone is not a completion guarantee. It does not replace enhancement callbacks or alter Sveltery runtime code.

Source: SvelteKit `@sveltejs/kit@2.70.3`, immutable release commit [`39e8e1fbd4feba7f22dd46bfdf7335362c38de16`](https://github.com/sveltejs/kit/blob/39e8e1fbd4feba7f22dd46bfdf7335362c38de16/packages/kit/src/runtime/client/remote-functions/form.svelte.js). Original source SHA-256: `40ef548ea4da3e79a305ae25113506f1e019c4a7ef78d526c69dea23ee440401`. Patched source SHA-256: `59111bd0acd8a9264ff2340395d32e22696ee5c6249f31b3ff7877bed39d2202`.

The patch is generated with pnpm 12.6.0. Applications must explicitly configure their package manager to apply it; installing Sveltery alone does not patch an application's Kit dependency. See the repository's [setup and compatibility contract](https://github.com/sveltery/base/blob/main/docs/sveltekit-submit-compat.md).

Kit source and patch context are MIT licensed, copyright (c) 2020 [SvelteKit contributors](https://github.com/sveltejs/kit/graphs/contributors). The complete upstream license is included in `LICENSE.sveltekit`.
