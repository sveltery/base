<script lang="ts">
  // Authored literal Svelte control; no Base runtime or Original assertion credit.
  import { flushSync } from 'svelte';
  type Property = 'justify-content' | 'animation-duration' | 'transition-duration';
  let host = $state<HTMLDivElement>();
  let dimension = $state(0);
  const style = $derived(
    `justify-content:center;animation-duration:123ms;transition-duration:123ms;--native-dimension:${dimension}px`,
  );
  function sample() {
    const node = host;
    if (!node) throw new Error('Literal native style host is not mounted.');
    return {
      connected: node.isConnected,
      cssText: node.style.cssText,
      dimension: node.style.getPropertyValue('--native-dimension'),
      properties: Object.fromEntries(
        (['justify-content', 'animation-duration', 'transition-duration'] as const).map(
          (property) => [
            property,
            {
              value: node.style.getPropertyValue(property),
              priority: node.style.getPropertyPriority(property),
            },
          ],
        ),
      ),
    };
  }
  function write(property: Property) {
    const node = host;
    if (!node) throw new Error('Literal native style host is not mounted.');
    let beforeStateWrite = sample();
    flushSync(() => {
      node.style.setProperty(
        property,
        property === 'justify-content' ? 'initial' : '0s',
        property === 'justify-content' ? 'important' : '',
      );
      beforeStateWrite = sample();
      console.info(
        `native-collapsible-css:${JSON.stringify({
          route: 'literal',
          label: `before-state-write:${property}`,
          value: beforeStateWrite,
        })}`,
      );
      dimension += 1;
    });
    const afterFlush = sample();
    console.info(
      `native-collapsible-css:${JSON.stringify({
        route: 'literal',
        label: `after-flush:${property}`,
        value: afterFlush,
      })}`,
    );
    return { beforeStateWrite, afterFlush, sameHost: host === node };
  }
  function expose(node: HTMLDivElement) {
    Object.assign(node, { nativeStyle: { write, sample } });
    return () => Reflect.deleteProperty(node, 'nativeStyle');
  }
</script>

<div data-testid="literal-native-style" bind:this={host} {style} {@attach expose}></div>
