# Upstream differences

Intentional differences from Base UI v1.8.0 (`47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`). Each component section is owned by the pull request that ports that component.

## Popover

### Cloned radio keeps its name

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/react/src/utils/usePopupViewport.tsx`. The previous pane is `cloneNode(true)` of the current content. Control state is not rewritten.

Upstream: a checked radio in that clone keeps its `name`. Inserting the clone into the document unchecks the live radio, because one name can have only one checked radio.

Local: `PopoverViewport` removes `name` from radio inputs in the copy before the previous pane is inserted. The live radio stays checked. The clone is `inert` and `aria-hidden`, so it does not submit with the form.

Rationale: the previous pane is a visual cross-fade, not a second form control. Unchecking the radio the user just set is not the behavior the cross-fade should have.

Test: `src/lib/popover/Popover.svelte.spec.ts` (`keeps the live radio checked when the viewport switches triggers`).
