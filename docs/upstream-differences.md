# Upstream differences

Intentional differences from Base UI v1.8.0 (`47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`). Each component section is owned by the pull request that ports that component.

## Popover

### Cloned radio keeps its name

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/react/src/utils/usePopupViewport.tsx`. The previous pane is `cloneNode(true)` of the current content. Control state is not rewritten.

Upstream: a checked radio in that clone keeps its `name`. Inserting the clone into the document unchecks the live radio, because one name can have only one checked radio.

Local: `PopoverViewport` removes `name` from radio inputs in the copy before the previous pane is inserted. The live radio stays checked. The clone is `inert` and `aria-hidden`, so it does not submit with the form.

Rationale: the previous pane is a visual cross-fade, not a second form control. Unchecking the radio the user just set is not the behavior the cross-fade should have.

Test: `src/lib/popover/Popover.svelte.spec.ts` (`keeps the live radio checked when the viewport switches triggers`).

## Dialog

Source: `packages/react/src/dialog`. Upstream shares `PopupHandle` and `COMPOSITE_KEYS`; they live in `src/lib/internal/popups/popupHandle.svelte.ts` and `src/lib/internal/composite-keys.ts`. Portal, focus, dismiss, scroll lock, `mergeProps`, and the popup store are the landed overlay foundation. How the dialog opened is `PopupStore.openMethod`. Final focus uses the shared `returnFocus` callback: it receives how the popup closed, and `null` focuses the trigger.

| Upstream                                                             | Local                                                                                                  |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `open` / `defaultOpen`, `triggerId` / `defaultTriggerId`             | `createControllableValue` with `$bindable` `open` / `triggerId` and `defaultOpen` / `defaultTriggerId` |
| `actionsRef`                                                         | `bind:this` on `Dialog.Root` (`close` and `unmount`)                                                   |
| `initialFocus` / `finalFocus` ref objects                            | element or function, called when focus moves                                                           |
| `children` render function `{ payload }`                             | snippet argument `{ payload }`                                                                         |
| React `useButton`                                                    | existing `Button`                                                                                      |
| `useDismiss` outside press, including separate mouse and touch modes | one dialog listener, because the shared dismiss hook treats the portal host as inside                  |

Not ported: Alert Dialog, Drawer, and ref objects. Mouse and touch use separate outside-press modes. A backdrop is `intentional` for both. Without one, touch is `sloppy` and mouse is `sloppy` only for `trap-focus`. The lasting outside-press fix is for `useDismiss` to test the floating element and track `pressStartedInside`, then delete the dialog listener. `defaultTriggerId` selects the trigger for `aria-expanded` and is not written back into `triggerId`.
