// Derived from mui/base-ui at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT, see ../../../THIRD_PARTY_NOTICES.md.
import type { ToastContent } from './types.js';

export function isRenderableContent(content: ToastContent | undefined): boolean {
  return content != null && typeof content !== 'boolean' && content !== '';
}
