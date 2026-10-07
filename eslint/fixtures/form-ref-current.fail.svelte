<!--
	Fixture the no-react-refs rule must reject.
	Copied from the Form port's React-style holders before they moved to
	$state, bind:this, and attachments: Form.svelte, context.ts, types.ts,
	and tests/FormField.svelte.
-->
<script lang="ts">
	interface FormField {
		controlRef: { current: HTMLElement | null };
	}

	const formRef: { current: { fields: Map<string, FormField> } } = {
		current: { fields: new Map() }
	};
	const elementRef: { current: HTMLFormElement | null } = { current: null };
	const submitCountRef: { current: number } = { current: 0 };
	const controlRef: FormField['controlRef'] = {
		get current() {
			return null;
		}
	};

	const defaults = {
		elementRef: { current: null },
		formRef: { current: { fields: new Map() } },
		submitCountRef: { current: 0 }
	};

	function rememberForm(node: HTMLFormElement) {
		elementRef.current = node;
		return () => {
			if (elementRef.current === node) elementRef.current = null;
		};
	}

	function focusFirstInvalid(field: FormField) {
		for (const entry of formRef.current.fields.values()) {
			const control = entry.controlRef.current;
			void control;
		}
		const selected = field.controlRef.current;
		void selected;
	}

	function handleSubmit(form: { submitCountRef: { current: number } }) {
		submitCountRef.current += 1;
		form.submitCountRef.current += 1;
		formRef.current.fields.forEach((field) => {
			field.controlRef.current = null;
		});
	}

	void defaults;
	void controlRef;
	void rememberForm;
	void focusFirstInvalid;
	void handleSubmit;
</script>
