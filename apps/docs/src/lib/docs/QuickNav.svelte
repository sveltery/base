<!-- Adapted Base UI docs/src/components/QuickNav/QuickNav.tsx at47b40521; MIT2019 Material-UI SAS. Analytics omitted; native anchors retain navigation. -->
<script lang="ts">
  import { ScrollArea } from '@sveltery/base/scroll-area';
  import type { Doc } from '../../../../fixtures/src/lib/docs/content.js';
  let { doc }: { doc?: Doc } = $props();
</script>

<nav aria-label="On this page" class="QuickNavRoot">
  <div class="QuickNavInner">
    <ScrollArea.Root
      ><ScrollArea.Viewport class="QuickNavViewport">
        <header class="bui-sr-only">{doc?.title}</header>
        <ul class="QuickNavList">
          <li class="QuickNavItem">
            <a class="QuickNavLink" href="#main-content">(Top)</a>
          </li>
          {#each doc?.sections ?? [] as section (section.id)}<li
              class="QuickNavItem"
            >
              <a class="QuickNavLink" href={'#' + section.id}>{section.title}</a
              >
            </li>{/each}
        </ul>
      </ScrollArea.Viewport><ScrollArea.Scrollbar class="QuickNavScrollbar"
        ><ScrollArea.Thumb
          class="QuickNavScrollbarThumb"
        /></ScrollArea.Scrollbar
      ></ScrollArea.Root
    >
  </div>
</nav>
