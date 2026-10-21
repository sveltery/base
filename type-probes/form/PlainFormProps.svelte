<!-- A plain form takes errors, values, onsubmit, method and action. -->
<script lang="ts">
	import { Field, Form, Input } from '#lib';
</script>

<Form
	method="POST"
	action="?/save"
	errors={{ email: 'Taken', '': 'Try again' }}
	values={{ email: 'a@b.c' }}
	onsubmit={(event) => event.currentTarget.reset()}
>
	<Field.Root name="email"><Input type="email" /></Field.Root>
	<Form.Error />
</Form>
