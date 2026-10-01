<script lang="ts">
  import * as Toast from '../../src/lib/toast/index.js';
  let { container }: { container?: null | { current: null } } = $props();
</script>
<Toast.Portal {container}><span data-testid="portal-child">Portal child</span></Toast.Portal>
