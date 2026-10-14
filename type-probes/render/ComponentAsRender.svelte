<!-- expect-error: is not assignable to type 'Snippet<[props: HTMLFieldsetAttributes -->
<!-- `render` takes a snippet. A component is called differently, so passing one stays an error. -->
<script lang="ts">
	import { Fieldset, RadioGroup } from '#lib';
</script>

<Fieldset.Root render={RadioGroup} />
