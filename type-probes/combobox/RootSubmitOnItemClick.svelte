<!-- expect-error: '"submitOnItemClick"' does not exist in type 'ComboboxRootProps -->
<!-- Combobox.Root omits submitOnItemClick, as upstream does. -->
<script lang="ts">
	import { Combobox } from '#lib';
</script>

<Combobox.Root submitOnItemClick />
