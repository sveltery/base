import config from './playwright.config.js';

// The official browser, sandbox, single worker and zero retries come from the canonical config.
export default {
  ...config,
  testMatch: '**/menu-family-source.spec.ts',
  outputDir: 'test-results/menu-family',
  reporter: [['line'], ['json', { outputFile: 'test-results/menu-family-results.json' }]],
};
