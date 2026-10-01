// Upstream type assertions preserved; import paths adapted only. See parity manifest.
import { expectType } from './expect-type';
import { createGenericEventDetails } from '../src/lib/internals/createBaseUIEventDetails';
import { REASONS } from '../src/lib/internals/reasons';

const incrementDetails = createGenericEventDetails(REASONS.incrementPress);
expectType<typeof REASONS.incrementPress, typeof incrementDetails.reason>(incrementDetails.reason);

const keyboardDetails = createGenericEventDetails(REASONS.keyboard);
expectType<typeof REASONS.keyboard, typeof keyboardDetails.reason>(keyboardDetails.reason);

// @ts-expect-error reason must exist in REASONS
createGenericEventDetails('invalid-reason');
