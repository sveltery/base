<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import { NavigationMenu } from '@sveltery/base/navigation-menu';
	import { audienceMenus, guideLinks, guidesPanel } from '../data.ts';
	import styles from './index.module.css';

	const isDesktop = new MediaQuery('min-width: 700px', true);
</script>

{#snippet caretDownIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block">
		<path d="M12 6H4l4 4.5z" />
	</svg>
{/snippet}

<NavigationMenu.Root class={styles.Root}>
	<NavigationMenu.List class={styles.List}>
		<NavigationMenu.Item>
			<NavigationMenu.Trigger class={styles.Trigger}>
				Product
				<NavigationMenu.Icon class={styles.Icon}>
					{@render caretDownIcon()}
				</NavigationMenu.Icon>
			</NavigationMenu.Trigger>

			<NavigationMenu.Content class="{styles.Content} {styles.ProductContent}">
				<NavigationMenu.Root
					class={styles.SubmenuRoot}
					orientation={isDesktop.current ? 'vertical' : 'horizontal'}
					value="developers"
				>
					<div class={styles.SubmenuLayout}>
						<NavigationMenu.List class={styles.SubmenuList}>
							{#each audienceMenus as menu (menu.value)}
								<NavigationMenu.Item value={menu.value}>
									<NavigationMenu.Trigger class={styles.SubmenuTrigger}>
										<span class={styles.SubmenuLabel}>{menu.label}</span>
										<span class={styles.SubmenuHint}>{menu.hint}</span>
									</NavigationMenu.Trigger>
									<NavigationMenu.Content class={styles.SubmenuContent}>
										<div>
											<h4 class={styles.SubmenuTitle}>{menu.title}</h4>
											<p class={styles.SubmenuDescription}>{menu.description}</p>
										</div>
										<ul class={styles.LinkList}>
											{#each menu.links as link (link.href)}
												<li>
													<NavigationMenu.Link class={styles.LinkCard} href={link.href}>
														<h5 class={styles.LinkTitle}>{link.title}</h5>
														<p class={styles.LinkDescription}>{link.description}</p>
													</NavigationMenu.Link>
												</li>
											{/each}
										</ul>
									</NavigationMenu.Content>
								</NavigationMenu.Item>
							{/each}
						</NavigationMenu.List>

						<NavigationMenu.Viewport class={styles.SubmenuViewport} />
					</div>
				</NavigationMenu.Root>
			</NavigationMenu.Content>
		</NavigationMenu.Item>

		<NavigationMenu.Item>
			<NavigationMenu.Trigger class={styles.Trigger}>
				Learn
				<NavigationMenu.Icon class={styles.Icon}>
					{@render caretDownIcon()}
				</NavigationMenu.Icon>
			</NavigationMenu.Trigger>

			<NavigationMenu.Content class="{styles.Content} {styles.GuidesContent}">
				<div class={styles.GuidesPanel}>
					<div>
						<h4 class={styles.SubmenuTitle}>{guidesPanel.title}</h4>
						<p class={styles.SubmenuDescription}>{guidesPanel.description}</p>
					</div>
					<ul class={styles.LinkList}>
						{#each guideLinks as link (link.href)}
							<li>
								<NavigationMenu.Link class={styles.LinkCard} href={link.href}>
									<h5 class={styles.LinkTitle}>{link.title}</h5>
									<p class={styles.LinkDescription}>{link.description}</p>
								</NavigationMenu.Link>
							</li>
						{/each}
					</ul>
				</div>
			</NavigationMenu.Content>
		</NavigationMenu.Item>

		<NavigationMenu.Item>
			<NavigationMenu.Link class={styles.Trigger} href="/overview/releases">
				Releases
			</NavigationMenu.Link>
		</NavigationMenu.Item>

		<NavigationMenu.Item>
			<NavigationMenu.Link class={styles.Trigger} href="https://github.com/sveltery/base">
				GitHub
			</NavigationMenu.Link>
		</NavigationMenu.Item>
	</NavigationMenu.List>

	<NavigationMenu.Portal>
		<NavigationMenu.Positioner
			class={styles.Positioner}
			sideOffset={10}
			collisionPadding={{ top: 5, bottom: 5, left: 20, right: 20 }}
			collisionAvoidance={{ side: 'none' }}
		>
			<NavigationMenu.Popup class={styles.Popup}>
				<NavigationMenu.Arrow class={styles.Arrow} />
				<NavigationMenu.Viewport class={styles.Viewport} />
			</NavigationMenu.Popup>
		</NavigationMenu.Positioner>
	</NavigationMenu.Portal>
</NavigationMenu.Root>
