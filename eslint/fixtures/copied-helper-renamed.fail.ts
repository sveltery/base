// Renamed copies. cssText and Later previously kept the owner body under a new name.
function cssText(nativeEvent: Event) {
	nativeEvent.preventDefault();
	nativeEvent.stopPropagation();
}

class Later<Payload = unknown> extends PopupHandle<Payload, PopoverStore> {
	constructor() {
		super(true, 'Popover.Handle');
	}
}
