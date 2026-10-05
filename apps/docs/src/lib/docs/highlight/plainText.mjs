// Published @mui/internal-docs-infra 0.12.1-canary.42 pipeline; MIT, copyright 2019 Material-UI SAS.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- Retained published untyped JavaScript; native render boundary is separately typed.
// @ts-nocheck
import { starryNightGutter } from "./addLineGutters.mjs";
function createPlainTextRoot(source) {
  const root = {
    type: 'root',
    children: [{
      type: 'text',
      value: source
    }]
  };
  const sourceLines = source.split(/\r?\n|\r/);
  starryNightGutter(root, sourceLines);
  return root;
}

export const parsePlainText = source => createPlainTextRoot(source);
export { createPlainTextRoot };
