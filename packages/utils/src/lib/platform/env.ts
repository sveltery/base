// Ported from Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
import { lowerUserAgent } from './shared.js';

/** Running in jsdom or HappyDOM (used by unit tests). */
export const jsdom = /jsdom|happydom/.test(lowerUserAgent);
