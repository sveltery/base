<script lang="ts">
  import { page } from '$app/state';
  import CollapsibleCssNative from '$lib/CollapsibleCssNative.svelte';
</script>

<CollapsibleCssNative
  scenario={page.url.searchParams.get('case') ?? 'css-transition-default-string'}
/>
