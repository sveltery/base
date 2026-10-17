<!-- expect-error: '"keepHighlight"' does not exist in type 'ComboboxRootProps -->
<!-- Combobox.Root omits keepHighlight and submitOnItemClick, as upstream does. Autocomplete keeps them. -->
<script lang="ts">
	import { Combobox } from '#lib';
</script>

<Combobox.Root keepHighlight />
