import config from './playwright.config.js';

// An informational secured browser run, separate from every acceptance assertion.
export default {
  ...config,
  testDir: './tests/diagnostics',
  outputDir: '.checks/dialog-animation-diagnostic',
  use: { ...config.use, trace: 'on' },
};
