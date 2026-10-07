<script lang="ts">
	import { DirectionProvider, Toolbar } from '#lib';
	import type { ToolbarOrientation } from '#lib/toolbar/types.js';

	type Scenario =
		| 'keyboard'
		| 'disabled-root'
		| 'focusable'
		| 'skip-one'
		| 'skip-first'
		| 'flag-only'
		| 'blocked'
		| 'hover'
		| 'custom'
		| 'group-disabled'
		| 'link'
		| 'render'
		| 'attach'
		| 'activate';

	let {
		scenario = 'keyboard',
		orientation = 'horizontal',
		dir = 'ltr',
		loopFocus = true,
		veto = 'none',
		onclick,
		onmousedown,
		onpointerdown,
		onkeydown,
		onmousemove,
		onancestor,
		oncapture,
		onrender
	}: {
		scenario?: Scenario;
		orientation?: ToolbarOrientation;
		dir?: 'ltr' | 'rtl';
		loopFocus?: boolean;
		veto?: 'none' | 'root' | 'child';
		onclick?: (event: MouseEvent) => void;
		onmousedown?: (event: MouseEvent) => void;
		onpointerdown?: (event: PointerEvent) => void;
		onkeydown?: (event: KeyboardEvent) => void;
		onmousemove?: (event: MouseEvent) => void;
		onancestor?: (event: MouseEvent) => void;
		oncapture?: (event: MouseEvent) => void;
		onrender?: (event: MouseEvent) => void;
	} = $props();

	let host = $state<HTMLElement | null>(null);
	let clicks = $state(0);

	function capture(node: HTMLElement) {
		host = node;
		return () => {
			host = null;
		};
	}

	function countClick() {
		clicks += 1;
	}

	function rootKeydown(event: KeyboardEvent) {
		if (veto === 'root') event.preventDefault();
	}

	function childKeydown(event: KeyboardEvent) {
		onkeydown?.(event);
		if (veto === 'child') event.preventDefault();
	}
</script>

<DirectionProvider direction={dir}>
	<div {dir}>
		{#if scenario === 'keyboard'}
			<Toolbar.Root aria-label="Tools" {orientation} {loopFocus} onkeydown={rootKeydown}>
				<Toolbar.Button onkeydown={childKeydown}>One</Toolbar.Button>
				<Toolbar.Link href="https://base-ui.com">Link</Toolbar.Link>
				<Toolbar.Group>
					<Toolbar.Button>Two</Toolbar.Button>
					<Toolbar.Button>Three</Toolbar.Button>
				</Toolbar.Group>
			</Toolbar.Root>
		{:else if scenario === 'disabled-root'}
			<Toolbar.Root aria-label="Tools" disabled>
				<Toolbar.Button>One</Toolbar.Button>
				<Toolbar.Link href="https://base-ui.com">Link</Toolbar.Link>
				<Toolbar.Group>
					<Toolbar.Button>Two</Toolbar.Button>
					<Toolbar.Link href="https://base-ui.com">Docs</Toolbar.Link>
				</Toolbar.Group>
			</Toolbar.Root>
		{:else if scenario === 'focusable'}
			<Toolbar.Root aria-label="Tools">
				<Toolbar.Button disabled>One</Toolbar.Button>
				<Toolbar.Group>
					<Toolbar.Button disabled>Two</Toolbar.Button>
					<Toolbar.Button disabled>Three</Toolbar.Button>
				</Toolbar.Group>
			</Toolbar.Root>
		{:else if scenario === 'skip-one'}
			<Toolbar.Root aria-label="Tools">
				<Toolbar.Button disabled>One</Toolbar.Button>
				<Toolbar.Group>
					<Toolbar.Button disabled>Two</Toolbar.Button>
					<Toolbar.Button disabled focusableWhenDisabled={false}>Three</Toolbar.Button>
				</Toolbar.Group>
			</Toolbar.Root>
		{:else if scenario === 'skip-first'}
			<Toolbar.Root aria-label="Tools">
				<Toolbar.Button disabled focusableWhenDisabled={false}>One</Toolbar.Button>
				<Toolbar.Button>Two</Toolbar.Button>
				<Toolbar.Button>Three</Toolbar.Button>
			</Toolbar.Root>
		{:else if scenario === 'flag-only'}
			<Toolbar.Root aria-label="Tools">
				<Toolbar.Button>One</Toolbar.Button>
				<Toolbar.Button focusableWhenDisabled={false}>Two</Toolbar.Button>
				<Toolbar.Button>Three</Toolbar.Button>
			</Toolbar.Root>
		{:else if scenario === 'blocked' || scenario === 'hover'}
			<Toolbar.Root aria-label="Tools">
				<Toolbar.Button
					disabled
					{onclick}
					{onmousedown}
					{onpointerdown}
					{onkeydown}
					{onmousemove}
				/>
			</Toolbar.Root>
		{:else if scenario === 'custom'}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div onclick={onancestor}>
				<Toolbar.Root aria-label="Tools">
					<Toolbar.Button nativeButton={false} {onclick}>
						{#snippet render(props)}
							<!-- React merges the render element's click with the button's. The snippet composes both. -->
							<span
								{...props}
								onclickcapture={oncapture}
								onclick={(event) => {
									onrender?.(event);
									props.onclick?.(event);
								}}>Save</span
							>
						{/snippet}
					</Toolbar.Button>
				</Toolbar.Root>
			</div>
		{:else if scenario === 'group-disabled'}
			<Toolbar.Root aria-label="Tools">
				<Toolbar.Group disabled>
					<Toolbar.Button>One</Toolbar.Button>
					<Toolbar.Link href="https://base-ui.com">Link</Toolbar.Link>
				</Toolbar.Group>
			</Toolbar.Root>
		{:else if scenario === 'link'}
			<Toolbar.Root aria-label="Tools">
				<Toolbar.Link data-testid="link" href="https://base-ui.com">Link</Toolbar.Link>
			</Toolbar.Root>
		{:else if scenario === 'render'}
			<Toolbar.Root aria-label="Tools">
				{#snippet render(props, rootState)}
					<div {...props} data-testid="custom-root" data-orientation-state={rootState.orientation}>
						<Toolbar.Button>
							{#snippet render(buttonProps, buttonState)}
								<button
									{...buttonProps}
									data-testid="custom-button"
									data-focusable-state={buttonState.focusable ? 'yes' : 'no'}
								>
									Save
								</button>
							{/snippet}
						</Toolbar.Button>
					</div>
				{/snippet}
			</Toolbar.Root>
		{:else if scenario === 'attach'}
			<Toolbar.Root aria-label="Tools" class="root-host" {@attach capture}>
				<Toolbar.Button class="button-host">Save</Toolbar.Button>
			</Toolbar.Root>
			<output data-testid="host">{host?.className ?? 'none'}</output>
		{:else if scenario === 'activate'}
			<Toolbar.Root aria-label="Tools">
				<Toolbar.Button onclick={countClick}>One</Toolbar.Button>
				<Toolbar.Button disabled onclick={countClick}>Two</Toolbar.Button>
			</Toolbar.Root>
			<output data-testid="clicks">{clicks}</output>
		{/if}
	</div>
</DirectionProvider>
