// Original Base UI 1.8.0 warn, shared canonical log-once cache (MIT).
import { createLogOnce } from './createLogOnce.js';

export const warn = createLogOnce('warn', 'Base UI');

export { reset } from './createLogOnce.js';
