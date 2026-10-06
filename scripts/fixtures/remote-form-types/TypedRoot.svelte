<script lang="ts" generics="Name extends string">
  import { Field, type FieldRootProps } from './imports.js';
  // Type-only compiler proof. Runtime integration uses the real RemoteRoot adapter.
  type Props = Omit<FieldRootProps, 'name'> & {
    name: Name;
    as?: string | readonly unknown[];
    value?: unknown;
  };
  let { ref = $bindable(null), ...props }: Props = $props();
</script>

<Field.Root {...props} bind:ref />
