<script lang="ts">
  // Original FocusGuard business props/platform branch with native DOM ref attachment (MIT).
  import type { HTMLAttributes } from 'svelte/elements';
  import { platform } from '@sveltery/utils/platform';
  import { visuallyHidden } from '@sveltery/utils/visuallyHidden';
  import { MergedRefs, type MergedRef } from '@sveltery/utils/useMergedRefs';
  import { createRefAttachment } from '../internals/nativeRefAttachment.js';
  import { toNativeStyle } from '../internals/nativeProps.js';
  let {
    ref,
    ...props
  }: HTMLAttributes<HTMLSpanElement> & { ref?: MergedRef<HTMLSpanElement> | null } = $props();
  const refs = new MergedRefs<HTMLSpanElement>();
  const callback = $derived(refs.merge(ref, null));
  const resolveAttachment = createRefAttachment<HTMLSpanElement>(() => {});
  const attachment = $derived(resolveAttachment(callback));
  const role = platform.screenReader.voiceOver && platform.engine.webkit ? 'button' : undefined;
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex (Original focus guard remains a tabbable span with its platform-specific role branch.) -->
<span
  {...props}
  style={toNativeStyle(visuallyHidden)}
  aria-hidden={role ? undefined : true}
  tabindex={0}
  {role}
  data-base-ui-focus-guard=""
  {@attach attachment}
></span>
