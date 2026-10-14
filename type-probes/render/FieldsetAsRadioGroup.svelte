<!-- expect-error: Type 'HTMLDivElement' is missing the following properties from type 'HTMLFieldSetElement' -->
<!-- Handlers typed for a `<fieldset>` cannot move to the `<div>` a radio group renders. -->
<script lang="ts">
	import { Fieldset, RadioGroup } from '#lib';
</script>

<Fieldset.Root>
	{#snippet render(props)}<RadioGroup {...props} />{/snippet}
</Fieldset.Root>
