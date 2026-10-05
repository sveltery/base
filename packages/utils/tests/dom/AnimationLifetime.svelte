<script lang="ts">
  import { useAnimationFrame } from '@sveltery/utils/useAnimationFrame';
  import { useTimeout } from '@sveltery/utils/useTimeout';
  let { events }: { events: string[] } = $props();
  const frame = useAnimationFrame();
  const timeout = useTimeout();
  export function schedule() {
    frame.request(() => events.push('frame'));
    timeout.start(10, () => events.push('timeout'));
  }
  export const pending = () => ({ frame: frame.currentId, timeout: timeout.isStarted() });
</script>

<button type="button" onclick={schedule}>Schedule work</button>
