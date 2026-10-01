// Derived from mui/base-ui v1.8.0, 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT; see THIRD_PARTY_NOTICES.md.
import * as REASONS from './reason-parts.js';

export { REASONS };
export type BaseUIEventReasons = typeof REASONS;
export type BaseUIEventReason = BaseUIEventReasons[keyof BaseUIEventReasons];
