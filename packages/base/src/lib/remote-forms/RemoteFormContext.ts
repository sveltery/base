import { getContext, setContext } from 'svelte';
import type { RemoteFormLike } from './types.js';

export interface RemoteFormContext {
  readonly remote: RemoteFormLike | undefined;
}
const REMOTE_FORM_CONTEXT = Symbol('sveltery-remote-form');

export function setRemoteFormContext(context: RemoteFormContext): void {
  setContext(REMOTE_FORM_CONTEXT, context);
}

export function useRemoteFormContext(): RemoteFormContext | undefined {
  return getContext(REMOTE_FORM_CONTEXT);
}
