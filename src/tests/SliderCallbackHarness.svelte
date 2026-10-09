<script lang="ts">
	import type { FieldRootModel } from '../lib/field/model.svelte.js';
	import { SliderRootModel, type SliderModelOptions } from '../lib/slider/model.svelte.js';

	const changeLog: string[] = [];
	const commitLog: string[] = [];
	let changes = $state(0);
	let commits = $state(0);
	let onValueChange = $state<(value: number | readonly number[]) => void>(() => {
		changeLog.push('change');
	});
	let onValueCommitted = $state<(value: number | readonly number[]) => void>(() => {
		commitLog.push('commit');
	});

	function publish() {
		queueMicrotask(() => {
			changes = changeLog.length;
			commits = commitLog.length;
		});
	}

	const options: SliderModelOptions = {
		getValueUnwrapped: () => 10,
		writeValue: () => {},
		getMin: () => 0,
		getMax: () => 100,
		getStep: () => 1,
		getLargeStep: () => 10,
		getMinSteps: () => 0,
		getOrientation: () => 'horizontal',
		getDisabled: () => false,
		getName: () => undefined,
		getFormId: () => undefined,
		getRootId: () => 'slider',
		getFormat: () => undefined,
		getLocale: () => undefined,
		getThumbAlignment: () => 'center',
		getCollision: () => 'none',
		getAriaLabelledBy: () => undefined,
		getFieldLabelId: () => undefined,
		getOnValueChange: () => onValueChange,
		getOnValueCommitted: () => onValueCommitted,
		getField: () => ({ setTouched() {} }) as FieldRootModel,
		getFormContext: () => ({}) as ReturnType<SliderModelOptions['getFormContext']>,
		getDirection: () => 'ltr'
	};

	const model = new SliderRootModel(options);
	const control = document.createElement('div');
	const thumb = document.createElement('div');
	control.getBoundingClientRect = () => new DOMRect(0, 0, 100, 10);
	thumb.getBoundingClientRect = () => new DOMRect(0, 0, 10, 10);
	model.control = control;
	model.thumbs = [{ element: thumb, inputId: undefined, index: 0 }];
	model.captureStyles(control);
	control.addEventListener('pointerdown', (event) => {
		model.onPointerDown(event as PointerEvent);
	});

	function swap() {
		onValueChange = () => {
			changeLog.push('change');
		};
		onValueCommitted = () => {
			commitLog.push('commit');
		};
		publish();
	}

	$effect(() => {
		model.handleInputChange(30, 0, new Event('input'));
		control.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				cancelable: true,
				button: 0,
				clientX: 40,
				clientY: 5,
				pointerId: 1,
				pointerType: 'mouse'
			})
		);
		document.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				cancelable: true,
				button: 0,
				clientX: 40,
				clientY: 5,
				pointerId: 1,
				pointerType: 'mouse'
			})
		);
		publish();
		return () => {
			model.stopListening();
		};
	});
</script>

<button type="button" onclick={swap}>Swap</button>
<output data-testid="changes">{changes}</output>
<output data-testid="commits">{commits}</output>
