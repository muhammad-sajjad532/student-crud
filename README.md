# Angular Student Testing

A small standalone Angular Student CRUD application used to demonstrate Vitest, Allure Report 3, coverage enforcement, and automated quality checks. Data stays in memory and resets on refresh.

## Setup

For local Windows hosting without a running Node terminal, see
[IIS deployment instructions](docs/IIS-DEPLOYMENT.md). Build with `npm run build:iis`.

Use Node.js 24.18.0 (the same version as CI) and npm. From this directory:

```sh
npm ci
npm start
```

Open `http://localhost:4200`. No backend, browser-driver installation, Java, or Allure account is required for this setup. Commit `package-lock.json` with dependency changes; CI uses the lockfile.

On Windows, stop this project's running `ng serve`/test watch sessions before `npm ci`. They can lock `esbuild.exe`, causing `EPERM` during the clean install. If an install was interrupted, stop the sessions and rerun the install before testing.

## Commands

| Command                   | Purpose                                                          |
| ------------------------- | ---------------------------------------------------------------- |
| `npm test`                | Run all tests once; generate Allure raw results and Vitest JSON  |
| `npm run test:watch`      | Rerun tests as files change                                      |
| `npm run test:run`        | Alias for the single test run                                    |
| `npm run test:coverage`   | Single run with coverage reports and thresholds                  |
| `npm run test:ci`         | Coverage run plus no-skipped-tests and Allure completeness gates |
| `npm run allure:generate` | Generate HTML report from existing results                       |
| `npm run allure:open`     | Serve/open the generated Allure report locally; Ctrl+C stops it  |
| `npm run allure:clean`    | Remove generated results, HTML reports and coverage              |
| `npm run lint`            | Check TypeScript, Angular templates and test conventions         |
| `npm run lint:fix`        | Apply supported lint fixes                                       |
| `npm run format:check`    | Check formatting without modifying files                         |
| `npm run format`          | Format maintained source/config/docs                             |
| `npm run quality-check`   | Lint ? format ? CI tests/coverage ? report ? production build    |
| `npm run build`           | Compile/prerender only; use quality-check for a validated build  |

Run the complete validation before sharing changes:

```sh
npm run quality-check
npm run allure:open
```

The `pretest`, `pretest:watch` and `pretest:coverage` scripts clear generated raw results and coverage at the start of a session. `preallure:generate` replaces the previous HTML report. Direct `ng test` bypasses npm cleanup hooks. Do not run cleanup/CI commands alongside an active watch session. Before sharing a report from watch mode, run a fresh `npm run test:ci` and `npm run allure:generate`.

## Reports and gates

- `allure-results/`: raw execution results, suite/feature labels, timings, assertion steps and failure details.
- `allure-report/`: generated Allure Report 3 site. Use `allure:open` to view it.
- `test-results/vitest.json`: machine-readable execution results checked by the CI gate.
- `coverage/angular-testing/index.html`: browsable coverage.
- `coverage/angular-testing/lcov.info`: machine-readable coverage for CI integrations.

All generated reports are gitignored. The app currently has 23 tests across two spec files. Four coverage metrics are enforced at **100% per file** for the configured application scope: statements, branches, functions and lines. Source includes/exclusions live in `angular.json`. Specs, interface-only models and generated app config/route wiring are excluded; bootstrap and server code are outside this unit scope. Coverage is an execution metric, not proof of bug-free behavior.

ESLint rejects disabled/focused tests. Vitest also disallows `.only`. The CI result gate rejects runtime skips/todo tests, zero tests, failed results and missing/incomplete Allure results. Coverage gates run when coverage is enabled (`test:coverage`, `test:ci`, `quality-check`).

`quality-check` stops when a command fails; it does not silently fix files. After a failed test run you can still run `npm run allure:generate` to inspect the failure report. CI automatically attempts report generation after a test failure and uploads available artifacts.

## CI

`.github/workflows/quality.yml` runs on pushes, pull requests and manual dispatch. It installs locked dependencies, checks lint/format, runs tests/coverage, generates Allure, then builds only after successful gates. It uploads reports on success or failure with a 14-day retention period.

This folder is the Git repository root; workflow paths are relative to it. GitHub Actions is the default because no remote/provider was configured. The workflow is provided but a hosted run requires pushing it to the team's GitHub repository. Configure the quality job as a required branch-protection check if merges must be blocked. No deployment or public report publishing is configured.

## Learn the implementation

- [Reusable Angular testing implementation handbook (PDF)](docs/ANGULAR-VITEST-ALLURE-CICD-GENERAL-GUIDE.pdf)
- [Editable HTML source for the reusable handbook](docs/ANGULAR-VITEST-ALLURE-CICD-GENERAL-GUIDE.html)
- [Student CRUD and test basics](TESTING.md)
- [Step-by-step Roman Urdu workshop: ticket concepts, implementation and team-lead demo](docs/TESTING-WORKSHOP.md)
- [Test conventions and recipes for components, services, HTTP mocks, pipes, directives and utilities](docs/TESTING-RECIPES.md)

Useful files: `angular.json`, `vitest.config.ts`, `eslint.config.mjs`, `scripts/check-test-results.mjs`, and `.github/workflows/quality.yml`.
