<script lang="ts">
	import { Checkbox } from '@sveltery/base/checkbox';
	import { CheckboxGroup } from '@sveltery/base/checkbox-group';

	const mainPermissions = ['view-dashboard', 'manage-users', 'access-reports'];
	const userManagementPermissions = ['create-user', 'edit-user', 'delete-user', 'assign-roles'];

	const id = $props.id();
	let mainValue = $state<string[]>([]);
	let managementValue = $state<string[]>([]);
</script>

<CheckboxGroup
	aria-labelledby={id}
	value={mainValue}
	onValueChange={(value) => {
		if (value.includes('manage-users')) {
			managementValue = userManagementPermissions;
		} else if (managementValue.length === userManagementPermissions.length) {
			managementValue = [];
		}
		mainValue = value;
	}}
	allValues={mainPermissions}
	class="flex flex-col items-start gap-1 text-neutral-950 dark:text-white"
	style="margin-left: 1rem"
>
	<label class="flex items-center gap-2 text-sm font-normal" {id} style="margin-left: -1rem">
		<Checkbox.Root
			class="flex size-4 shrink-0 items-center justify-center border rounded-none p-0 border-neutral-950 bg-white text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950 data-indeterminate:bg-neutral-950 data-indeterminate:text-white dark:data-indeterminate:bg-white dark:data-indeterminate:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
			parent
			indeterminate={managementValue.length > 0 &&
				managementValue.length !== userManagementPermissions.length}
		>
			<Checkbox.Indicator class="flex data-unchecked:hidden">
				{#snippet render(props, state)}
					<span {...props}>
						{#if state.indeterminate}
							<svg
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="currentColor"
								stroke-width="1"
								style="display: block"
							>
								<line
									x1="3"
									y1="12"
									x2="21"
									y2="12"
									stroke="currentColor"
									vector-effect="non-scaling-stroke"
								/>
							</svg>
						{:else}
							<svg
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="none"
								stroke="currentColor"
								style="display: block"
							>
								<path d="m2.5 8.5 4 4 7-9" />
							</svg>
						{/if}
					</span>
				{/snippet}
			</Checkbox.Indicator>
		</Checkbox.Root>
		User Permissions
	</label>

	<label class="flex items-center gap-2 text-sm font-normal">
		<Checkbox.Root
			value="view-dashboard"
			class="flex size-4 shrink-0 items-center justify-center border rounded-none p-0 border-neutral-950 bg-white text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
		>
			<Checkbox.Indicator class="flex data-unchecked:hidden">
				<svg
					width="16"
					height="16"
					viewBox="0 0 16 16"
					fill="none"
					stroke="currentColor"
					style="display: block"
				>
					<path d="m2.5 8.5 4 4 7-9" />
				</svg>
			</Checkbox.Indicator>
		</Checkbox.Root>
		View Dashboard
	</label>

	<label class="flex items-center gap-2 text-sm font-normal">
		<Checkbox.Root
			value="access-reports"
			class="flex size-4 shrink-0 items-center justify-center border rounded-none p-0 border-neutral-950 bg-white text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
		>
			<Checkbox.Indicator class="flex data-unchecked:hidden">
				<svg
					width="16"
					height="16"
					viewBox="0 0 16 16"
					fill="none"
					stroke="currentColor"
					style="display: block"
				>
					<path d="m2.5 8.5 4 4 7-9" />
				</svg>
			</Checkbox.Indicator>
		</Checkbox.Root>
		Access Reports
	</label>

	<CheckboxGroup
		aria-labelledby="manage-users-caption"
		class="flex flex-col items-start gap-1 text-neutral-950 dark:text-white"
		value={managementValue}
		onValueChange={(value) => {
			if (value.length === userManagementPermissions.length) {
				mainValue = Array.from(new Set([...mainValue, 'manage-users']));
			} else {
				mainValue = mainValue.filter((v) => v !== 'manage-users');
			}
			managementValue = value;
		}}
		allValues={userManagementPermissions}
		style="margin-left: 1rem"
	>
		<label
			class="flex items-center gap-2 text-sm font-normal"
			id="manage-users-caption"
			style="margin-left: -1rem"
		>
			<Checkbox.Root
				class="flex size-4 shrink-0 items-center justify-center border rounded-none p-0 border-neutral-950 bg-white text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950 data-indeterminate:bg-neutral-950 data-indeterminate:text-white dark:data-indeterminate:bg-white dark:data-indeterminate:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
				parent
			>
				<Checkbox.Indicator class="flex data-unchecked:hidden">
					{#snippet render(props, state)}
						<span {...props}>
							{#if state.indeterminate}
								<svg
									width="12"
									height="12"
									viewBox="0 0 24 24"
									fill="currentColor"
									stroke-width="1"
									style="display: block"
								>
									<line
										x1="3"
										y1="12"
										x2="21"
										y2="12"
										stroke="currentColor"
										vector-effect="non-scaling-stroke"
									/>
								</svg>
							{:else}
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="none"
									stroke="currentColor"
									style="display: block"
								>
									<path d="m2.5 8.5 4 4 7-9" />
								</svg>
							{/if}
						</span>
					{/snippet}
				</Checkbox.Indicator>
			</Checkbox.Root>
			Manage Users
		</label>

		<label class="flex items-center gap-2 text-sm font-normal">
			<Checkbox.Root
				value="create-user"
				class="flex size-4 shrink-0 items-center justify-center border rounded-none p-0 border-neutral-950 bg-white text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
			>
				<Checkbox.Indicator class="flex data-unchecked:hidden">
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						stroke="currentColor"
						style="display: block"
					>
						<path d="m2.5 8.5 4 4 7-9" />
					</svg>
				</Checkbox.Indicator>
			</Checkbox.Root>
			Create User
		</label>

		<label class="flex items-center gap-2 text-sm font-normal">
			<Checkbox.Root
				value="edit-user"
				class="flex size-4 shrink-0 items-center justify-center border rounded-none p-0 border-neutral-950 bg-white text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
			>
				<Checkbox.Indicator class="flex data-unchecked:hidden">
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						stroke="currentColor"
						style="display: block"
					>
						<path d="m2.5 8.5 4 4 7-9" />
					</svg>
				</Checkbox.Indicator>
			</Checkbox.Root>
			Edit User
		</label>

		<label class="flex items-center gap-2 text-sm font-normal">
			<Checkbox.Root
				value="delete-user"
				class="flex size-4 shrink-0 items-center justify-center border rounded-none p-0 border-neutral-950 bg-white text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
			>
				<Checkbox.Indicator class="flex data-unchecked:hidden">
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						stroke="currentColor"
						style="display: block"
					>
						<path d="m2.5 8.5 4 4 7-9" />
					</svg>
				</Checkbox.Indicator>
			</Checkbox.Root>
			Delete User
		</label>

		<label class="flex items-center gap-2 text-sm font-normal">
			<Checkbox.Root
				value="assign-roles"
				class="flex size-4 shrink-0 items-center justify-center border rounded-none p-0 border-neutral-950 bg-white text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
			>
				<Checkbox.Indicator class="flex data-unchecked:hidden">
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						stroke="currentColor"
						style="display: block"
					>
						<path d="m2.5 8.5 4 4 7-9" />
					</svg>
				</Checkbox.Indicator>
			</Checkbox.Root>
			Assign Roles
		</label>
	</CheckboxGroup>
</CheckboxGroup>
