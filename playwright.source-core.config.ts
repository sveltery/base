import config from './playwright.config.js';

// The unchanged remote submit contract remains blocking in the Remote API follow-up.
// Every other suite stays in this source-core selection; the default config runs all suites.
export default { ...config, testIgnore: '**/field-form-remote.spec.ts' };
