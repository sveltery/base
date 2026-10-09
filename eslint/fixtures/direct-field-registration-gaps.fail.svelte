<script lang="ts">
	const field = {
		registerControl(_source: symbol, _registration: unknown) {}
	};
	const { registerControl } = field;
	registerControl(Symbol(), undefined);
	const { registerControl: named } = field;
	named(Symbol(), undefined);
	let later: typeof field.registerControl;
	later = field.registerControl;
	later(Symbol(), undefined);
	field.registerControl.call(field, Symbol(), undefined);
	field.registerControl.apply(field, [Symbol(), undefined]);
	const bound = field.registerControl.bind(field);
	bound(Symbol(), undefined);
</script>
