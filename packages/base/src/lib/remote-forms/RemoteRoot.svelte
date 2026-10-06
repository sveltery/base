<script lang="ts" generics="Name extends string">
  import Root from '../field/Root.svelte';
  import { setFieldControlNameContext } from '../internals/field-control-name/FieldControlNameContext.js';
  import { useRemoteFormContext } from './RemoteFormContext.js';
  import { setRemoteFieldContext } from './RemoteFieldContext.js';
  import {
    remoteFieldArguments,
    remoteFieldPath,
    remoteFieldSegments,
    resolveRemoteAccessor,
  } from './runtime.js';
  import type { FieldRootProps } from '../field/types.js';
  type Props = Omit<FieldRootProps, 'name'> & {
    name: Name;
    as?: string | readonly unknown[] | undefined;
    value?: unknown;
  };
  let { name, as, value, ref = $bindable(), ...props }: Props = $props();
  const form = useRemoteFormContext();
  const logicalName = $derived(form?.remote ? remoteFieldPath(remoteFieldSegments(name)) : name);
  const accessor = $derived(
    form?.remote ? resolveRemoteAccessor(form.remote.fields, name) : undefined,
  );
  const args = $derived(remoteFieldArguments(as, value));
  const descriptor = $derived(accessor && args ? accessor.as(...args) : undefined);
  setRemoteFieldContext({
    get name() {
      return logicalName;
    },
    get kind() {
      return args ? String(args[0]) : undefined;
    },
    get accessor() {
      return accessor;
    },
    get descriptor() {
      return descriptor;
    },
  });
  setFieldControlNameContext({
    get name() {
      return typeof descriptor?.name === 'string' ? descriptor.name : undefined;
    },
  });
</script>

<Root {...props} name={logicalName} bind:ref />
