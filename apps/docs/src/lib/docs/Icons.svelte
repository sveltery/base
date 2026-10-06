<!-- Adapted actual Base UI docs/src/icons Copy/Check/MagnifyingGlass SVG bodies at47b40521; MIT2019 Material-UI SAS. -->
<script lang="ts">
  let { name }: { name: 'copy' | 'check' | 'search' } = $props();
</script>

<svg
  width="16"
  height="16"
  viewBox="0 0 16 16"
  fill="none"
  stroke="currentColor"
  stroke-linecap="square"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#if name === 'check'}<path d="m2.5 8.5 4 4 7-9" />
  {:else if name === 'copy'}<path d="M1.5 1.5h10v10h-10z" /><path d="M4.5 11.5h-3v-10h10v3" /><path
      d="M12 4.5h2.5v10h-10V12"
    />
  {:else}<path d="m11 11 3.5 3.5" /><circle cx="7" cy="7" r="5.5" />{/if}
</svg>
