# Overlay foundation (internal)

Phase 1a utilities. There is no public component. `verify.sh` covers the spec, unit tests, and fixture. `verify-component.sh` does not, because these modules live under `src/lib/internal`.

| Primitive         | What the fixture and specs cover                               |
| ----------------- | -------------------------------------------------------------- |
| Portal            | Popup is mounted outside the anchor, on `document.body`        |
| Focus manager     | Initial focus, Tab stays inside, focus returns to the trigger  |
| Dismiss           | Escape, outside press, nested Escape stays on the child        |
| Click             | Trigger toggles open and closed                                |
| Scroll lock       | Modal lock, and the lock remains until every owner releases it |
| Open / transition | `data-open`, `data-closed`, `data-starting-style`, cancel      |
| Popup store       | `preventUnmountOnClose` sticks after a canceled close          |
| mergeProps        | Handler order, `defaultPrevented`, class, style, attachments   |

Not in this phase: positioning, hover, anchored scroll lock, Dialog, and Popover.
