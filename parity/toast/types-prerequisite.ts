// Derived from mui/base-ui at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT, see ./UPSTREAM_LICENSE.
// Test-only prerequisite. No Toast package API, Svelte reactivity, or DOM behavior is implemented.
/* eslint-disable @typescript-eslint/no-explicit-any -- Retain upstream manager generic defaults for prerequisite assertions. */
export interface ToastObject<Data extends object = any> {
  id: string;
  title?: unknown;
  description?: unknown;
  type?: string;
  timeout?: number;
  priority?: 'low' | 'high';
  transitionStatus?: 'starting' | 'ending';
  updateKey?: number;
  limited?: boolean;
  height?: number;
  ref?: unknown;
  onClose?: () => void;
  onRemove?: () => void;
  actionProps?: unknown;
  positionerProps?: unknown;
  data?: Data;
}
export type ToastManagerAddOptions<Data extends object> = Omit<ToastObject<Data>, 'id' | 'height' | 'ref' | 'limited' | 'updateKey'> & { id?: string };
export type ToastManagerUpdateOptions<Data extends object> = Partial<Omit<ToastObject<Data>, 'id' | 'ref' | 'height' | 'transitionStatus' | 'limited' | 'updateKey'>>;
export interface ToastManagerPromiseOptions<Value, Data extends object> {
  loading: string | ToastManagerUpdateOptions<Data>;
  success: string | ToastManagerUpdateOptions<Data> | ((result: Value) => string | ToastManagerUpdateOptions<Data>);
  error: string | ToastManagerUpdateOptions<Data> | ((error: any) => string | ToastManagerUpdateOptions<Data>);
}
