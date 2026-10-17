# Menubar

<Subtitle>
  A menu bar providing commands and options for your application.
</Subtitle>

<Meta name="description" content="A menu bar providing commands and options for your application." />

<DemoMenubarHero />

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';
	import { Menubar } from '@sveltery/base/menubar';
</script>

<Menubar>
	<Menu.Root>
		<Menu.Trigger />
		<Menu.Portal>
			<Menu.Backdrop />
			<Menu.Positioner>
				<Menu.Popup>
					<Menu.Arrow />
					<Menu.Item />
					<Menu.LinkItem />
					<Menu.Separator />

					<Menu.SubmenuRoot>
						<Menu.SubmenuTrigger />
					</Menu.SubmenuRoot>

					<Menu.Group>
						<Menu.GroupLabel />
					</Menu.Group>

					<Menu.RadioGroup>
						<Menu.RadioItem>
							<Menu.RadioItemIndicator />
						</Menu.RadioItem>
					</Menu.RadioGroup>

					<Menu.CheckboxItem>
						<Menu.CheckboxItemIndicator />
					</Menu.CheckboxItem>

					<Menu.Viewport />
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
</Menubar>
```

## API reference

<script>
	import { DemoMenubarHero } from './demos/hero';
	import { TypesMenubar } from './types';
</script>

<TypesMenubar />
