import { lstatSync, mkdirSync, realpathSync, rmSync } from 'node:fs';
import { dirname, join, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = realpathSync(join(dirname(fileURLToPath(import.meta.url)), '..'));
const groups = {
  results: ['allure-results', 'test-results', 'coverage'],
  report: ['allure-report'],
  all: ['allure-results', 'allure-report', 'test-results', 'coverage'],
};
const group = process.argv[2] ?? 'all';
if (!Object.hasOwn(groups, group)) throw new Error('Use results, report, or all.');

// Only these generated directories can be removed; never accept an arbitrary path.
for (const name of groups[group]) {
  const target = join(root, name);
  const withinRoot = relative(root, target);
  if (!withinRoot || withinRoot.startsWith('..') || isAbsolute(withinRoot)) {
    throw new Error(`Refusing to clean outside the project: ${target}`);
  }
  const stat = lstatSync(target, { throwIfNoEntry: false });
  if (stat?.isSymbolicLink()) throw new Error(`Refusing to clean a linked directory: ${target}`);
  if (stat && realpathSync(target) !== target)
    throw new Error(`Unexpected resolved path: ${target}`);
  rmSync(target, { recursive: true, force: true });
  console.log(`Cleaned ${name}`);
}
mkdirSync(join(root, 'test-results'), { recursive: true });
