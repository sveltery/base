---
title: SvelteKit
description: Notes on server rendering, form actions, and remote form functions when you use Sveltery Base in a SvelteKit app.
order: 5
---

Sveltery Base does not depend on SvelteKit. The components import nothing from `@sveltejs/kit` or `$app/*`, so they work in any Svelte 5 app. This page covers what changes when the app is a SvelteKit app: server rendering, form actions, remote form functions, and prerendering.

## Server rendering and hydration

Every part renders on the server, with its ARIA attributes and data attributes. Before the page hydrates, labels and native form submission already work. Interactive parts, such as triggers and sliders, respond once the page hydrates.

### Ids

Parts that need an id, such as `Field.Control` and `Field.Label`, generate one with Svelte's `$props.id()`. The server and the client generate the same ids, such as `base-ui-s3`, so the `for`, `aria-labelledby`, and `aria-describedby` references in the server HTML stay valid after hydration. An `id` you pass to a part replaces the generated one.

### Popups

Dialog and Popover render their popups in a portal, and a portal renders nothing on the server. A popup that is open on the first render appears when the page hydrates. Until then, its trigger has no `aria-controls`, and a Popover trigger has `aria-expanded="false"`.

### Form validation

Form turns off the browser's validation bubbles with `novalidate`, but only after it hydrates. The server HTML has no `novalidate` attribute, so before hydration, or with JavaScript off, the browser checks `required`, `type`, and the other constraints itself.

## Form actions and remote forms

Form binds to a SvelteKit [remote form](https://svelte.dev/docs/kit/remote-functions#form) through its `form` prop. Each `Field.Root` binds to one of the remote form's fields through its `field` prop:

```svelte
<Form form={f}>
	<Form.Error />
	<Field.Root field={f.fields.email} type="email">
		<Field.Label>Email</Field.Label>
		<Field.Control required />
		<Field.Error />
	</Field.Root>
	<button>Sign up</button>
</Form>
```

`f` is the remote form, such as `signup.preflight(signupSchema)`. You do not add `use:enhance`, set `name` on the controls, or pass `errors`.

With this setup:

- An invalid field stops the submit before any request.
- A server issue shows in its `Field.Error`, and Form focuses the field.
- The issue hides as soon as the user changes the field.
- With JavaScript off, the browser validates, the form posts, and the page renders the server issues and the submitted values.

A classic [form action](https://svelte.dev/docs/kit/form-actions) connects the way Base UI connects any server: the action returns its errors, the page passes them to `errors` on Form, and `use:enhance` goes on Form through `fromAction`. Its submit function calls `cancel()` when `isSubmitBlocked(formElement)` is true, because `use:enhance` posts a submit Form blocked. [Connect a form action](/handbook/forms#connect-a-form-action) shows it. Name each field with `name` on `Field.Root`. Server errors then show and clear the same way, and the form works with JavaScript off too.

[Forms](/handbook/forms#bind-a-sveltekit-remote-form) has the complete examples, with the `.remote.ts` file, the `+page.server.ts` file, and the pages.

## Prerendering

Pages that use Sveltery Base prerender like any other page. The prerendered HTML is the server-rendered HTML described above, and the parts hydrate on load.

## Without SvelteKit

Nothing in the library imports SvelteKit or `$app/*`. Lint rules in the repository keep it that way. Form, Field, and every other component work the same in a Svelte app built with Vite alone. Use `onFormSubmit` or `onsubmit` to send the values yourself, and pass the errors you get back to `errors`.
