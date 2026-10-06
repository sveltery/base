// Adapted from Base UI v1.8.0 packages/utils/src/createLogOnce.ts at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
import { DEV } from 'esm-env';

let loggedMessages: Set<string>;
if (DEV) {
  loggedMessages = new Set<string>();
}

/** Creates a dev-only logger that writes each unique message to `console[severity]` once. */
export function createLogOnce(severity: 'warn' | 'error', prefix?: string) {
  return function logOnce(...messages: string[]) {
    if (DEV) {
      const message = messages.join(' ');
      const output = prefix ? `${prefix}: ${message}` : message;
      const key = `${severity}:${output}`;
      if (!loggedMessages.has(key)) {
        loggedMessages.add(key);
        if (severity === 'warn') {
          console.warn(output);
        } else {
          console.error(output);
        }
      }
    }
  };
}

export function reset() {
  loggedMessages?.clear();
}
