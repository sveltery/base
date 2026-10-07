# Live Dialog

The Dialog page's preview. Opening it shows a modal with a title, a description, a note field, and a close button. The note is only on screen; nothing stores it.

## Sub-features

- Open from "Explore a dialog".
- Focus moves to "Your note". Tab and Shift+Tab stay inside the dialog (covered by `tests/browser/docs.spec.ts`; the shipped drive script checks initial focus).
- Type a note.
- Close with "Done exploring". Focus returns to the trigger. Escape also closes (`tests/browser/docs.spec.ts`).
- Reload shows no dialog and drops the note.

## How to get to it (user POV)

From `/docs`, choose "Try Dialog →" or the sidebar link "Dialog" under Components. The preview sits in the "Live example" section under the label "PREVIEW / SVELTE 5". Direct URL: `/docs/components/dialog`.

## Driving it with Playwright

Wait until `.sveltery-docs` has `data-hydrated="true"`. Then:

```js
const trigger = page.getByRole('button', { name: 'Explore a dialog' });
await trigger.click();
const popup = page.getByRole('dialog', { name: 'A little room to focus' });
await popup.waitFor();
const note = page.getByRole('textbox', { name: 'Your note' });
await note.fill('keep this');
await page.getByRole('button', { name: 'Done exploring' }).click();
await popup.waitFor({ state: 'detached' });
```

The maintained script is `scripts/drive-live-dialog.mjs`, invoked by `session.sh drive`. It also checks the description text inside the dialog (`.example-description`), that the note is focused, that no write request is sent, that focus returns to the trigger, and that a reload drops the note.

End state that proves it: dialog role appears only after the click, the typed value is in the textbox, "Done exploring" removes the dialog and focuses the trigger, and a reload has no dialog and no typed text.

## Gotchas

- Clicking "Explore a dialog" before `data-hydrated="true"` does not open the dialog. SSR HTML includes the trigger and omits `role="dialog"`.
- The example source is in the page inside `details`. A page-wide text query for the description matches the source and the live paragraph. Query inside the dialog.
- The note is not saved. Confirm with the request log (no POST, PUT, PATCH, or DELETE) and with a reload, not by the sentence in the docs.
- "Done exploring" returns focus to the trigger. That is the end state, not merely an empty page.
