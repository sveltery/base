<!-- Adapted Base UI docs/src/components/SideNav.tsx Root/Section/Heading/List and (docs)/layout sitemap composition at47b40521; MIT2019 Material-UI SAS. -->
<script lang="ts">
  import { resolve } from '$app/paths';
  import { ScrollArea } from '@sveltery/base/scroll-area';
  import { docs, groups } from '../../../../fixtures/src/lib/docs/content.js';
  import SideNavItem from './SideNavItem.svelte';
</script>
<nav aria-label="Main navigation" class="SideNavRoot">
  <ScrollArea.Root>
    <ScrollArea.Viewport data-side-nav-viewport class="SideNavViewport">
      {#each groups as group (group)}
        <div class="SideNavSection"><div class="SideNavHeading">{group}</div><ul class="SideNavList">
          {#each docs.filter(doc => doc.group === group) as doc (doc.slug)}
            <SideNavItem href={doc.slug ? resolve('/docs/[...slug]', { slug: doc.slug }) : resolve('/docs')}>{doc.slug ? doc.title : 'Introduction'}</SideNavItem>
          {/each}
        </ul></div>
      {/each}
      <hr class="SideNavSeparator" />
      <div class="SideNavSection"><ul class="SideNavList"><SideNavItem href="https://github.com/sveltery/base" external>GitHub ↗</SideNavItem></ul></div>
    </ScrollArea.Viewport>
    <ScrollArea.Scrollbar class="SideNavScrollbar"><ScrollArea.Thumb class="SideNavScrollbarThumb" /></ScrollArea.Scrollbar>
  </ScrollArea.Root>
</nav>
