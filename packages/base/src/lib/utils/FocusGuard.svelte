<script lang="ts">
  // Original FocusGuard business props/platform branch with native DOM ref attachment (MIT).
  import type { HTMLAttributes } from 'svelte/elements';
  import { platform } from '@sveltery/utils/platform';
  import { visuallyHidden } from '@sveltery/utils/visuallyHidden';
  import { toNativeStyle } from '../internals/nativeProps.js';
  let {
    ref = $bindable(),
    ...props
  }: HTMLAttributes<HTMLSpanElement> & { ref?: HTMLSpanElement | null } =
    $props();
  const role =
    platform.screenReader.voiceOver && platform.engine.webkit
      ? 'button'
      : undefined;
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex (Original focus guard remains a tabbable span with its platform-specific role branch.) -->
<span
  {...props}
  style={toNativeStyle(visuallyHidden)}
  aria-hidden={role ? undefined : true}
  tabindex={0}
  {role}
  data-base-ui-focus-guard=""
  bind:this={ref}
></span>
