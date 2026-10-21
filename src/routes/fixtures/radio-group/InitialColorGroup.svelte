<script lang="ts">
	import { Radio, RadioGroup } from '#lib';

	const box = 'display: inline-block; width: 16px; height: 16px';
</script>

<RadioGroup aria-label="Colors" value="b">
	<Radio.Root value="a" data-testid="a" aria-label="A" style={box} />
	<Radio.Root value="b" data-testid="b" aria-label="B" style={box} />
</RadioGroup>
