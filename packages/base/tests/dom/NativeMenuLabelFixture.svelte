<script lang="ts">
  import { Menu } from '../../src/lib/menu/index.js';
  let { part = 'item' }: { part?: 'item' | 'link' | 'checkbox' | 'radio' } = $props();
  let label = $state('Bravo');
  export function setLabel(value: string) {
    label = value;
  }
</script>

<Menu.Root defaultOpen modal={false}>
  <Menu.Trigger id="native-label-trigger">Open</Menu.Trigger>
  <Menu.Portal
    ><Menu.Positioner
      ><Menu.Popup>
        <Menu.Item id="native-label-first">Alpha</Menu.Item>
        {#if part === 'item'}<Menu.Item id="native-label-target" {label}>Dynamic item</Menu.Item>
        {:else if part === 'link'}<Menu.LinkItem id="native-label-target" {label} href="#target"
            >Dynamic item</Menu.LinkItem
          >
        {:else if part === 'checkbox'}<Menu.CheckboxItem id="native-label-target" {label}
            >Dynamic item</Menu.CheckboxItem
          >
        {:else}<Menu.RadioGroup defaultValue="one"
            ><Menu.RadioItem id="native-label-target" {label} value="one"
              >Dynamic item</Menu.RadioItem
            ></Menu.RadioGroup
          >{/if}
      </Menu.Popup></Menu.Positioner
    ></Menu.Portal
  >
</Menu.Root>
