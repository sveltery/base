<script lang="ts">
  // Native resource invalidation witness; synthetic timings grant no browser/Original credit.
  import { useOpenChangeComplete } from '../../src/lib/internals/useOpenChangeComplete.svelte.js';

  let enabled = $state(true);
  let open = $state(false);
  let batch = $state(false);
  let hostKey = $state(0);
  let element = $state.raw<HTMLDivElement | null>(null);
  let requests = $state.raw<{ open: boolean; batch: boolean; host: number }[]>([]);
  const queries: { host: number; finish: () => void }[] = [];
  const ref = {
    get current() {
      return element;
    },
  };

  function attach(node: HTMLDivElement) {
    const host = hostKey;
    Object.defineProperty(node, 'getAnimations', {
      value: () => {
        let finish!: () => void;
        const finished = new Promise<void>((resolve) => {
          finish = resolve;
        });
        queries.push({ host, finish });
        return [{ playState: 'running', finished }];
      },
    });
    element = node;
    return () => {
      if (element === node) element = null;
    };
  }

  useOpenChangeComplete({
    get enabled() {
      return enabled;
    },
    get open() {
      return open;
    },
    get batch() {
      return batch;
    },
    ref,
    onComplete() {
      requests = [...requests, { open, batch, host: hostKey }];
    },
  });

  export function setEnabled(next: boolean) {
    enabled = next;
  }
  export function setOpen(next: boolean) {
    open = next;
  }
  export function setBatch(next: boolean) {
    batch = next;
  }
  export function replaceHost() {
    hostKey += 1;
  }
  export function finish(index: number) {
    queries[index].finish();
  }
  export function snapshot() {
    return { hosts: queries.map((query) => query.host), requests };
  }
</script>

{#key hostKey}<div data-watcher-host={hostKey} {@attach attach}></div>{/key}
<output data-completion-requests>{requests.length}</output>
