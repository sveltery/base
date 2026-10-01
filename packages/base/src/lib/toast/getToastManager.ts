// Derived from mui/base-ui at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT, see ../../../THIRD_PARTY_NOTICES.md.
/* eslint-disable @typescript-eslint/no-explicit-any -- Match the upstream manager's default data type. */
import { provider } from './context.js';
import type { ToastManagerFacade } from './types.js';

/** Read during component initialization. Keep the facade to retain live reactive toast reads. */
export function getToastManager<Data extends object = any>(): ToastManagerFacade<Data> {
  return provider().manager as ToastManagerFacade<Data>;
}
