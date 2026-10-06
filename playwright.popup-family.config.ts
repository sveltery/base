import config from './playwright.config.js';

// The official browser, sandbox, single worker and zero retries come from the canonical config.
export default {
  ...config,
  testMatch: '**/popup-family-source.spec.ts',
  outputDir: 'test-results/popup-family',
  reporter: [['line'], ['json', { outputFile: 'test-results/popup-family-results.json' }]],
};
