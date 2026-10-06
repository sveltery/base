// Published @mui/internal-docs-infra 0.12.1-canary.42 pipeline; MIT, copyright 2019 Material-UI SAS.
import { starryNightGutter } from './addLineGutters.js';
import type { HastRoot, ParseSource } from './types.js';
function createPlainTextRoot(source: string): HastRoot {
  const root: HastRoot = {
    type: 'root',
    children: [
      {
        type: 'text',
        value: source,
      },
    ],
  };
  const sourceLines = source.split(/\r?\n|\r/);
  starryNightGutter(root, sourceLines);
  return root;
}

export const parsePlainText: ParseSource = (source) => createPlainTextRoot(source);
export { createPlainTextRoot };
