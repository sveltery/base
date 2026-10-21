<!-- expect-error: Type '"tooBig"' is not assignable to type -->
<!-- Form.Error's `match` takes a ValidityState key, as Field.Error's does. -->
<script lang="ts">
	import { Form } from '#lib';
</script>

<Form><Form.Error match="tooBig" /></Form>
