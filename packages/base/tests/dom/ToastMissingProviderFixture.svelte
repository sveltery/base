<script lang="ts">
  import { Toast } from '../../src/lib/index.js';
  const manager = Toast.getToastManager();
</script>
<output>{manager.toasts.length}</output>
