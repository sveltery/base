// Actual pinned Base UI 1.8.0 helpers and canonical native counterparts; fixture only.
// MIT: immutable 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c, THIRD_PARTY_NOTICES.md.
export {
  isElementVisible as originalVisible,
  isListIndexDisabled as originalDisabled,
} from '../node_modules/@base-ui/react/floating-ui-react/utils/composite.js';
export {
  isNativeInput as originalNativeInput,
  scrollIntoViewIfNeeded as originalScroll,
} from '../node_modules/@base-ui/react/internals/composite/composite.js';
export {
  isElementVisible as nativeVisible,
  isListIndexDisabled as nativeDisabled,
} from '../../../packages/base/src/lib/internals/composite/utils/navigation.js';
export {
  isNativeInput as nativeNativeInput,
  scrollIntoViewIfNeeded as nativeScroll,
} from '../../../packages/base/src/lib/internals/composite/composite.js';

export { isHTMLElement as canonicalHTMLElement } from '@floating-ui/utils/dom';
