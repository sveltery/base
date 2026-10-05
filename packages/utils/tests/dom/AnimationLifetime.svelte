<script lang="ts">
  import { onDestroy } from 'svelte';
  import { AnimationFrame } from '@sveltery/utils/useAnimationFrame';
  import { Timeout } from '@sveltery/utils/useTimeout';
  let { events }: { events: string[] } = $props();
  const frame = new AnimationFrame();
  onDestroy(frame.cancel);
  const timeout = new Timeout();
  onDestroy(timeout.clear);
  export function schedule() {
    frame.request(() => events.push('frame'));
    timeout.start(10, () => events.push('timeout'));
  }
  export const pending = () => ({ frame: frame.currentId, timeout: timeout.isStarted() });
</script>
<button type="button" onclick={schedule}>Schedule work</button>
