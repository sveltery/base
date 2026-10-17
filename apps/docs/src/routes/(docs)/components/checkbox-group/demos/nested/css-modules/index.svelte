<script lang="ts">
	import { Checkbox } from '@sveltery/base/checkbox';
	import { CheckboxGroup } from '@sveltery/base/checkbox-group';
	import styles from './index.module.css';

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
	class={styles.CheckboxGroup}
	style="margin-left: 1rem"
>
	<label class={styles.Item} {id} style="margin-left: -1rem">
		<Checkbox.Root
			class={styles.Checkbox}
			parent
			indeterminate={managementValue.length > 0 &&
				managementValue.length !== userManagementPermissions.length}
		>
			<Checkbox.Indicator class={styles.Indicator}>
				{#snippet render(props, state)}
					<span {...props}>
						{#if state.indeterminate}
							{@render horizontalRuleIcon()}
						{:else}
							{@render checkIcon()}
						{/if}
					</span>
				{/snippet}
			</Checkbox.Indicator>
		</Checkbox.Root>
		User Permissions
	</label>

	<label class={styles.Item}>
		<Checkbox.Root value="view-dashboard" class={styles.Checkbox}>
			<Checkbox.Indicator class={styles.Indicator}>
				{@render checkIcon()}
			</Checkbox.Indicator>
		</Checkbox.Root>
		View Dashboard
	</label>

	<label class={styles.Item}>
		<Checkbox.Root value="access-reports" class={styles.Checkbox}>
			<Checkbox.Indicator class={styles.Indicator}>
				{@render checkIcon()}
			</Checkbox.Indicator>
		</Checkbox.Root>
		Access Reports
	</label>

	<CheckboxGroup
		aria-labelledby="manage-users-caption"
		class={styles.CheckboxGroup}
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
		<label class={styles.Item} id="manage-users-caption" style="margin-left: -1rem">
			<Checkbox.Root class={styles.Checkbox} parent>
				<Checkbox.Indicator class={styles.Indicator}>
					{#snippet render(props, state)}
						<span {...props}>
							{#if state.indeterminate}
								{@render horizontalRuleIcon()}
							{:else}
								{@render checkIcon()}
							{/if}
						</span>
					{/snippet}
				</Checkbox.Indicator>
			</Checkbox.Root>
			Manage Users
		</label>

		<label class={styles.Item}>
			<Checkbox.Root value="create-user" class={styles.Checkbox}>
				<Checkbox.Indicator class={styles.Indicator}>
					{@render checkIcon()}
				</Checkbox.Indicator>
			</Checkbox.Root>
			Create User
		</label>

		<label class={styles.Item}>
			<Checkbox.Root value="edit-user" class={styles.Checkbox}>
				<Checkbox.Indicator class={styles.Indicator}>
					{@render checkIcon()}
				</Checkbox.Indicator>
			</Checkbox.Root>
			Edit User
		</label>

		<label class={styles.Item}>
			<Checkbox.Root value="delete-user" class={styles.Checkbox}>
				<Checkbox.Indicator class={styles.Indicator}>
					{@render checkIcon()}
				</Checkbox.Indicator>
			</Checkbox.Root>
			Delete User
		</label>

		<label class={styles.Item}>
			<Checkbox.Root value="assign-roles" class={styles.Checkbox}>
				<Checkbox.Indicator class={styles.Indicator}>
					{@render checkIcon()}
				</Checkbox.Indicator>
			</Checkbox.Root>
			Assign Roles
		</label>
	</CheckboxGroup>
</CheckboxGroup>

{#snippet checkIcon()}
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
{/snippet}

{#snippet horizontalRuleIcon()}
	<svg
		width="12"
		height="12"
		viewBox="0 0 24 24"
		fill="currentColor"
		stroke-width="1"
		style="display: block"
	>
		<line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" vector-effect="non-scaling-stroke" />
	</svg>
{/snippet}
