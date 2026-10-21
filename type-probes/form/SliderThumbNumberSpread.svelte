<!-- expect-error: Type '"number"' is not assignable to type '"range"' -->
<!-- Slider.Thumb types its input as `range`, so a number-input spread is a type error. -->
<script lang="ts">
	import type { RemoteForm } from '$app/server';
	import { Slider } from '#lib';

	const f = {} as RemoteForm<{ volume: number }, unknown>;
</script>

<Slider.Root>
	<Slider.Control><Slider.Thumb {...f.fields.volume.as('number')} /></Slider.Control>
</Slider.Root>
