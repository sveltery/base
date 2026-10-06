<script lang="ts">
  // Actual native Menu label lifetime witness; zero unchanged Original assertion credit.
  import { Menu } from '../../src/lib/menu/index.js';

  let primaryId = $state('initial-group-label');
  let primaryVisible = $state(true);
  let replacementVisible = $state(false);

  export function setPrimaryId(next: string) {
    primaryId = next;
  }
  export function hidePrimary() {
    primaryVisible = false;
  }
  export function showReplacement() {
    replacementVisible = true;
  }
</script>

<Menu.Group data-testid="native-menu-group">
  {#if primaryVisible}
    <Menu.GroupLabel id={primaryId} data-testid="primary-label">Primary label</Menu.GroupLabel>
  {/if}
  {#if replacementVisible}
    <Menu.GroupLabel id="replacement-group-label" data-testid="replacement-label">
      Replacement label
    </Menu.GroupLabel>
  {/if}
  <span>Group content</span>
</Menu.Group>
