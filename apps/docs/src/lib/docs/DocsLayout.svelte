<!-- Adapted Base UI docs/src/app/(docs)/layout.tsx at47b40521; MIT2019 Material-UI SAS. Native Kit/snippets replace Next/React; canonical native library helpers reused. -->
<script lang="ts">
  import { page } from '$app/state';
  import { resolve } from '$app/paths';
  import { docs } from '../../../../fixtures/src/lib/docs/content.js';
  import Header from './Header.svelte';
  import SideNav from './SideNav.svelte';
  import QuickNav from './QuickNav.svelte';
  import { MAIN_CONTENT_ID } from './source.js';
  import './styles.css';
  let { children } = $props();
  const current = $derived(
    docs.find(
      (doc) => doc.slug === (page.params.slug ?? '').replace(/\/$/, ''),
    ),
  );
</script>

<div class="RootLayout">
  <div class="RootLayoutContainer">
    <div class="RootLayoutContent">
      <div class="ContentLayoutRoot">
        <Header /><SideNav />
        <main class="ContentLayoutMain" id={MAIN_CONTENT_ID} tabindex="-1">
          <div class="QuickNavContainer">
            <QuickNav doc={current} />
            <div class="QuickNavContent">
              {@render children?.()}
              <footer class="DocsCredits">
                <p>Experimental · unpublished. Independent & unofficial.</p>
                <p>
                  Documentation interface adapted from <a
                    href="https://base-ui.com/">Base UI</a
                  >; original project also inspired by
                  <a href="https://ui.shadcn.com/docs">shadcn/ui</a>.
                </p>
                <a href={resolve('/docs/[...slug]', { slug: 'about' })}
                  >Credits & licenses</a
                >
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</div>
