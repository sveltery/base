<script lang="ts">
  import { Radio, RadioGroup, Toggle, ToggleGroup, Toolbar, Menu, Menubar } from '@sveltery/base';
  let options = $state(['a', 'b', 'c']);
  let visible = $state(true);
  let preventNavigation = $state(false);
  let radioHost = $state<HTMLElement | null>();
  let changes = $state<string[]>([]);
  let canceledKeys = $state(0);
  export function reorder() {
    options = ['c', 'a', 'b'];
  }
  export function removeMiddle() {
    options = options.filter((value) => value !== 'a');
  }
  export function cancelNavigation() {
    preventNavigation = true;
  }
  export function teardown() {
    visible = false;
  }
  export function snapshot() {
    return { radioHost, changes, canceledKeys };
  }
</script>

{#if visible}
  <RadioGroup
    bind:ref={radioHost}
    defaultValue="a"
    onValueChange={(value) => changes.push(value)}
    onkeydown={(event) => {
      // Composite navigation is owned by this actual group host. Preventing
      // an item pipeline is not cancellation of the ancestor's own pipeline.
      if (preventNavigation) {
        canceledKeys += 1;
        event.preventBaseUIHandler();
      }
    }}
  >
    {#each options as value (value)}
      <Radio.Root id={`radio-${value}`} data-consumer-host={`radio-${value}`} {value}
        >{value}</Radio.Root
      >
    {/each}
  </RadioGroup>
  <ToggleGroup defaultValue={['a']}>
    {#each options as value (value)}<Toggle id={`toggle-${value}`} {value}>{value}</Toggle>{/each}
  </ToggleGroup>
  <Toolbar.Root>
    {#each options as value (value)}<Toolbar.Button id={`toolbar-${value}`}>{value}</Toolbar.Button
      >{/each}
  </Toolbar.Root>
  <Menubar>
    <Menu.Root><Menu.Trigger id="menu-file">File</Menu.Trigger></Menu.Root>
    <Menu.Root><Menu.Trigger id="menu-edit">Edit</Menu.Trigger></Menu.Root>
  </Menubar>
{/if}
