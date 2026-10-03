// Adapted from Base UI v1.8.0 packages/utils/src/error.ts at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: parity/shared-utils/UPSTREAM_LICENSE.
import { createLogOnce } from './createLogOnce.js';

export const error = createLogOnce('error', 'Base UI');

export { reset } from './createLogOnce.js';
