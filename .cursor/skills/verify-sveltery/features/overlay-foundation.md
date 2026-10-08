# Overlay foundation (internal)

Internal utilities through phase 1b. There is no public component. `verify.sh` covers the spec, unit tests, and fixture. `verify-component.sh` does not, because these modules live under `src/lib/internal`.

| Primitive         | What the fixture and specs cover                                                                                |
| ----------------- | --------------------------------------------------------------------------------------------------------------- |
| Portal            | Popup is mounted outside the anchor, on `document.body`                                                         |
| Focus manager     | Initial focus, Tab stays inside, focus returns to the trigger                                                   |
| Dismiss           | Escape, outside press, nested Escape stays on the child                                                         |
| Click             | Trigger toggles open and closed                                                                                 |
| Scroll lock       | Modal lock, and the lock remains until every owner releases it                                                  |
| Open / transition | `data-open`, `data-closed`, `data-starting-style`, cancel                                                       |
| Popup store       | `preventUnmountOnClose` sticks after a canceled close                                                           |
| mergeProps        | Handler order, `defaultPrevented`, class, style, attachments                                                    |
| Positioning       | Popup sits under the trigger, stays there while closing, and rounds to device pixels                            |
| Hover             | Opens on hover, switches the trigger before `onOpenChange`, keeps a pending close, and can block pointer events |
| Anchored scroll   | Pointer open locks; hover does not; a touch pointer locks only when wide                                        |

`disableAnchorTracking` leaves `ancestorResize` on. That matches Base UI v1.8.0.

Not in this phase: Dialog and Popover.
