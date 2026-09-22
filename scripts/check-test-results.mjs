import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const report = JSON.parse(readFileSync(new URL('test-results/vitest.json', root), 'utf8'));
const tests = report.testResults.flatMap((suite) => suite.assertionResults);
const incomplete = tests.filter((test) => test.status !== 'passed');

if (
  !report.success ||
  report.numTotalTests === 0 ||
  tests.length !== report.numTotalTests ||
  report.numPassedTests !== report.numTotalTests ||
  incomplete.length > 0
) {
  for (const test of incomplete) console.error(`${test.status}: ${test.fullName}`);
  throw new Error(
    'Quality gate failed: every discovered test must pass. Skipped/todo tests are not allowed.',
  );
}

const resultsDirectory = new URL('allure-results/', root);
const results = readdirSync(resultsDirectory)
  .filter((name) => name.endsWith('-result.json'))
  .map((name) => JSON.parse(readFileSync(new URL(name, resultsDirectory), 'utf8')));

if (
  results.length !== tests.length ||
  results.some(
    (result) =>
      result.status !== 'passed' ||
      !Number.isFinite(result.start) ||
      !Number.isFinite(result.stop) ||
      !result.fullName ||
      !result.labels?.some((label) => ['parentSuite', 'suite', 'subSuite'].includes(label.name)),
  )
) {
  throw new Error(
    'Quality gate failed: Allure must contain a passing, timed, named result with a suite for every test.',
  );
}
console.log(
  `Quality gate passed: ${tests.length} tests passed, none skipped; Allure results verified.`,
);
console.log(`Allure results: ${fileURLToPath(resultsDirectory)}`);
