<script lang="ts">
	import { NavigationMenu } from '@sveltery/base/navigation-menu';
	import styles from './index.module.css';

	const overviewLinks = [
		{
			href: '/overview/quick-start',
			title: 'Quick Start',
			description: 'Install and assemble your first component.'
		},
		{
			href: '/overview/accessibility',
			title: 'Accessibility',
			description: 'Learn how we build accessible components.'
		},
		{
			href: '/overview/releases',
			title: 'Releases',
			description: 'See what’s new in the latest Sveltery Base versions.'
		}
	];

	const handbookLinks = [
		{
			href: '/handbook/styling',
			title: 'Styling',
			description:
				'Sveltery Base components can be styled with plain CSS, Tailwind CSS, CSS-in-JS, or CSS Modules.'
		},
		{
			href: '/handbook/animation',
			title: 'Animation',
			description:
				'Sveltery Base components can be animated with CSS transitions, CSS animations, or JavaScript libraries.'
		},
		{
			href: '/handbook/composition',
			title: 'Composition',
			description:
				'Sveltery Base components can be replaced and composed with your own existing components.'
		}
	];
</script>

{#snippet caretDownIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block">
		<path d="M12 6H4l4 4.5z" />
	</svg>
{/snippet}

{#snippet caretRightIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block">
		<path d="M6 12V4l4.5 4z" />
	</svg>
{/snippet}

<NavigationMenu.Root class={styles.Root}>
	<NavigationMenu.List class={styles.List}>
		<NavigationMenu.Item>
			<NavigationMenu.Trigger class={styles.Trigger}>
				Overview
				<NavigationMenu.Icon class={styles.Icon}>
					{@render caretDownIcon()}
				</NavigationMenu.Icon>
			</NavigationMenu.Trigger>

			<NavigationMenu.Content class={styles.Content}>
				<ul class={styles.GridLinkList}>
					{#each overviewLinks as item (item.href)}
						<li>
							<NavigationMenu.Link href={item.href} class={styles.LinkCard}>
								<h3 class={styles.LinkTitle}>{item.title}</h3>
								<p class={styles.LinkDescription}>{item.description}</p>
							</NavigationMenu.Link>
						</li>
					{/each}
					<li>
						<NavigationMenu.Root orientation="vertical">
							<NavigationMenu.List>
								<NavigationMenu.Item>
									<NavigationMenu.Trigger class={styles.LinkCard}>
										<span class={styles.LinkTitle}>Handbook</span>
										<p class={styles.LinkDescription}>How to use Sveltery Base effectively.</p>
										<NavigationMenu.Icon class={styles.NestedIcon}>
											{@render caretRightIcon()}
										</NavigationMenu.Icon>
									</NavigationMenu.Trigger>
									<NavigationMenu.Content class={styles.Content}>
										<ul class={styles.FlexLinkList}>
											{#each handbookLinks as item (item.href)}
												<li>
													<NavigationMenu.Link href={item.href} class={styles.LinkCard}>
														<h3 class={styles.LinkTitle}>{item.title}</h3>
														<p class={styles.LinkDescription}>{item.description}</p>
													</NavigationMenu.Link>
												</li>
											{/each}
										</ul>
									</NavigationMenu.Content>
								</NavigationMenu.Item>
							</NavigationMenu.List>

							<NavigationMenu.Portal>
								<NavigationMenu.Positioner
									class={styles.Positioner}
									sideOffset={8}
									alignOffset={-8}
									align="end"
									side="right"
								>
									<NavigationMenu.Popup class={styles.Popup}>
										<NavigationMenu.Viewport class={styles.Viewport} />
									</NavigationMenu.Popup>
								</NavigationMenu.Positioner>
							</NavigationMenu.Portal>
						</NavigationMenu.Root>
					</li>
				</ul>
			</NavigationMenu.Content>
		</NavigationMenu.Item>
	</NavigationMenu.List>

	<NavigationMenu.Portal>
		<NavigationMenu.Positioner
			class={styles.Positioner}
			sideOffset={10}
			collisionPadding={{ top: 5, bottom: 5, left: 20, right: 20 }}
		>
			<NavigationMenu.Popup class={styles.Popup}>
				<NavigationMenu.Arrow class={styles.Arrow} />
				<NavigationMenu.Viewport class={styles.Viewport} />
			</NavigationMenu.Popup>
		</NavigationMenu.Positioner>
	</NavigationMenu.Portal>
</NavigationMenu.Root>
