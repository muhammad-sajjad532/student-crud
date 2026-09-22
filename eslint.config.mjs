import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import vitest from '@vitest/eslint-plugin';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      '.angular/**',
      'dist/**',
      'out-tsc/**',
      'coverage/**',
      'allure-results/**',
      'allure-report/**',
      'test-results/**',
    ],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  {
    files: ['src/**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
  },
  {
    files: ['**/*.spec.ts'],
    plugins: { vitest },
    languageOptions: { globals: vitest.environments.env.globals },
    rules: {
      ...vitest.configs.recommended.rules,
      'vitest/no-disabled-tests': 'error',
      'vitest/no-focused-tests': 'error',
    },
  },
  {
    files: ['**/*.mjs'],
    extends: [eslint.configs.recommended],
    languageOptions: { globals: globals.node },
  },
);
