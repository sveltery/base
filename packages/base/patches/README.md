# SvelteKit 2.70.3 submit cancellation patch

This patch is required for Kit 2.70.3 applications relying on synchronous Form validation or authored submit cancellation. It makes the remote form attachment return when a submit event is already canceled. It adds exactly one `event.defaultPrevented` guard, before Kit's own `preventDefault`, validation, enhancement and request. It does not replace enhancement callbacks or alter Sveltery runtime code.

Source: SvelteKit `@sveltejs/kit@2.70.3`, immutable release commit [`39e8e1fbd4feba7f22dd46bfdf7335362c38de16`](https://github.com/sveltejs/kit/blob/39e8e1fbd4feba7f22dd46bfdf7335362c38de16/packages/kit/src/runtime/client/remote-functions/form.svelte.js). Original source SHA-256: `40ef548ea4da3e79a305ae25113506f1e019c4a7ef78d526c69dea23ee440401`. Patched source SHA-256: `00b87303b7d268906809f889b2e342fdee89bd03dd417023a5fd055d94b518b1`.

The patch is generated with pnpm 12.6.0. Applications must explicitly configure their package manager to apply it; installing Sveltery alone does not patch an application's Kit dependency. See the repository's [setup and compatibility contract](https://github.com/sveltery/base/blob/main/docs/sveltekit-submit-compat.md).

Kit source and patch context are MIT licensed, copyright (c) 2020 [SvelteKit contributors](https://github.com/sveltejs/kit/graphs/contributors). The complete upstream license is included in `LICENSE.sveltekit`.
