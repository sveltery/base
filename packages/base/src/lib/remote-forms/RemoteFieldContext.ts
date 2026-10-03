import { getContext, setContext } from 'svelte';
import type { RemoteAccessor, RemoteDescriptor } from './runtime.js';

export interface RemoteFieldContext {
  readonly name: string;
  readonly kind: string | undefined;
  readonly accessor: RemoteAccessor | undefined;
  readonly descriptor: RemoteDescriptor | undefined;
}
const REMOTE_FIELD_CONTEXT = Symbol('sveltery-remote-field');

export function setRemoteFieldContext(context: RemoteFieldContext): void {
  setContext(REMOTE_FIELD_CONTEXT, context);
}

export function useRemoteFieldContext(): RemoteFieldContext | undefined {
  return getContext(REMOTE_FIELD_CONTEXT);
}
