// `stopEvent` is preventDefault plus stopPropagation from
// packages/react/src/floating-ui-react/utils/event.ts.
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// `contains`, `ownerDocument`, and `findAssociatedLabel` live in `src/lib/internal`.

export function stopEvent(event: Event) {
	event.preventDefault();
	event.stopPropagation();
}
