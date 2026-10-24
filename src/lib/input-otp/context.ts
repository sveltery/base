// Derived from input-otp v1.4.2 packages/input-otp/src/input.tsx (`OTPInputContext`)
// (commit 81ccdb48c010d800b24942aa231909f0c971b1ca). MIT, see THIRD_PARTY_NOTICES.md.

import { createContext } from 'svelte';
import type { InputOTPRootState } from './types.js';

export const [getInputOTPContext, setInputOTPContext] = createContext<InputOTPRootState>();
