import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    allowOnly: false,
    passWithNoTests: false,
    clearMocks: true,
    restoreMocks: true,
    retry: 0,
    reporters: [
      ['tree', { summary: false }],
      ['json', { outputFile: 'test-results/vitest.json' }],
      [
        'allure-vitest/reporter',
        {
          resultsDir: 'allure-results',
          environmentInfo: {
            node_version: process.version,
            platform: process.platform,
            execution: process.env['CI'] ? 'CI' : 'local',
          },
        },
      ],
    ],
    coverage: {
      provider: 'v8',
      reportOnFailure: true,
    },
  },
});
