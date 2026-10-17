<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Popover } from '@sveltery/base/popover';
	import { Avatar } from '@sveltery/base/avatar';
	import baseStyles from '../../_index.module.css';
	import styles from './index.module.css';

	const demoPopover = Popover.createHandle<Snippet>();
</script>

{#snippet notificationsPanel()}
	<div class={styles.Stack}>
		<Popover.Title class={styles.Title}>Notifications</Popover.Title>
		<Popover.Description class={styles.Description}>
			You are all caught up. Good job!
		</Popover.Description>
	</div>
{/snippet}

{#snippet activityPanel()}
	<div class={styles.Stack}>
		<Popover.Title class={styles.Title}>Activity</Popover.Title>
		<Popover.Description class={styles.Description}>
			Nothing interesting happened recently.
		</Popover.Description>
	</div>
{/snippet}

{#snippet profilePanel()}
	<div class={styles.ProfilePanel}>
		<Popover.Title class={styles.Title}>Jason Eventon</Popover.Title>
		<Avatar.Root class={styles.Avatar}>
			<Avatar.Image
				src="https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=128&h=128&dpr=2&q=80"
				width="48"
				height="48"
				class={styles.AvatarImage}
			/>
		</Avatar.Root>
		<span class={styles.Plan}>Pro plan</span>
		<div class={styles.ProfileActions}>
			<a href="#top">Profile settings</a>
			<a href="#top">Log out</a>
		</div>
	</div>
{/snippet}

<div class={styles.Container}>
	<Popover.Trigger class={baseStyles.Button} handle={demoPopover} payload={notificationsPanel}>
		Notifications
	</Popover.Trigger>

	<Popover.Trigger class={baseStyles.Button} handle={demoPopover} payload={activityPanel}>
		Activity
	</Popover.Trigger>

	<Popover.Trigger class={baseStyles.Button} handle={demoPopover} payload={profilePanel}>
		Profile
	</Popover.Trigger>

	<Popover.Root handle={demoPopover}>
		{#snippet children({ payload })}
			<Popover.Portal>
				<Popover.Positioner sideOffset={8} class={styles.Positioner}>
					<Popover.Popup class={styles.Popup}>
						<Popover.Arrow class={styles.Arrow} />

						<Popover.Viewport class={styles.Viewport}>
							{@render payload?.()}
						</Popover.Viewport>
					</Popover.Popup>
				</Popover.Positioner>
			</Popover.Portal>
		{/snippet}
	</Popover.Root>
</div>
