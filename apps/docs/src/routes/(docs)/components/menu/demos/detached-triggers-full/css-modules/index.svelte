<script lang="ts">
	import { Menu } from '@sveltery/base/menu';
	import styles from '../../_index.module.css';
	import transitionStyles from './index.module.css';

	const MENUS = {
		library: {
			heading: 'Library',
			groups: [
				['Add to library', 'Add to favorites'],
				['Create playlist', 'Create station']
			]
		},
		playback: {
			heading: 'Playback',
			groups: [
				['Play now', 'Add to queue'],
				['Play next', 'Play last', 'Sleep timer']
			]
		},
		share: {
			heading: 'Share',
			groups: [
				['Copy link', 'Copy embed code'],
				['Share to contacts', 'Share to social']
			]
		}
	};

	type MenuKey = keyof typeof MENUS;

	const demoMenu = Menu.createHandle<MenuKey>();
</script>

<div class={styles.Container}>
	<Menu.Trigger class={styles.Button} handle={demoMenu} payload="library">Library</Menu.Trigger>
	<Menu.Trigger class={styles.Button} handle={demoMenu} payload="playback">Playback</Menu.Trigger>
	<Menu.Trigger class={styles.Button} handle={demoMenu} payload="share">Share</Menu.Trigger>

	<Menu.Root handle={demoMenu} modal={false}>
		{#snippet children({ payload })}
			<Menu.Portal>
				<Menu.Positioner
					sideOffset={8}
					align="start"
					class="{styles.Positioner} {transitionStyles.Positioner}"
				>
					<Menu.Popup class="{styles.Popup} {transitionStyles.Popup}">
						<Menu.Viewport class={transitionStyles.Viewport}>
							{#if payload}
								{#each MENUS[payload].groups as group, groupIndex (groupIndex)}
									<Menu.Group>
										{#if groupIndex === 0}
											<Menu.GroupLabel class={styles.Label}>
												{MENUS[payload].heading}
											</Menu.GroupLabel>
										{/if}
										{#each group as item (item)}
											<Menu.Item class={styles.Item}>{item}</Menu.Item>
										{/each}
									</Menu.Group>
									{#if groupIndex < MENUS[payload].groups.length - 1}
										<Menu.Separator class={styles.Separator} />
									{/if}
								{/each}
							{/if}
						</Menu.Viewport>
					</Menu.Popup>
				</Menu.Positioner>
			</Menu.Portal>
		{/snippet}
	</Menu.Root>
</div>
