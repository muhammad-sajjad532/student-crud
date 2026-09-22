# Validation record

Verified locally on 2026-09-21 using Windows, Node 24.18.0 and the locked dependency versions.

## Successful pipeline

`npm run quality-check` completed with `CI=true` and `NG_CLI_ANALYTICS=false`:

- ESLint: passed with zero warnings.
- Prettier check: passed.
- Application tests: 23 passed across 2 spec files.
- Coverage: statements 115/115, branches 38/38, functions 16/16, lines 72/72; all 100%.
- Per-file coverage thresholds: passed.
- Vitest JSON / no-skipped-tests check: passed.
- Allure raw-result completeness check: passed.
- Generated Allure summary: 23 total, 23 passed.
- Allure report HTML, environment metadata, HTML coverage and LCOV output: present.
- Angular production browser/server build and prerender: passed.

## Failure gates exercised

Temporary probe tests/source files were created, executed, and removed. They are not part of the committed application suite.

| Probe                                        | Verified result                                                   |
| -------------------------------------------- | ----------------------------------------------------------------- |
| Deliberately wrong assertion                 | Test command exited 1                                             |
| Failed test reporting                        | Allure retained failure message and timing; HTML report generated |
| Runtime `context.skip()`                     | Result gate exited 1                                              |
| Focused `.only` test                         | Vitest exited 1                                                   |
| `.only` / `.skip` in source                  | ESLint exited 1                                                   |
| Unformatted spec                             | Prettier check exited 1                                           |
| Root-only coverage run                       | Unmet coverage thresholds exited 1                                |
| New unimported/untested utility in `src/app` | File appeared with 0% coverage; per-file gate exited 1            |

The final successful pipeline regenerated clean reports after these probes, so the current report does not contain intentional failures or stale probe results.

## CI handoff and limitations

- GitHub Actions workflow is included; no Git remote/provider was configured, so a hosted workflow run has not been performed.
- Push the repository to GitHub and confirm the quality job and downloadable artifacts on a pull request. Set the job as a required branch-protection check if needed.
- A local `npm ci` attempt encountered Windows `EPERM` because a running development process held native dependency files open. `npm install` recovered dependencies successfully, and the full pipeline subsequently passed. Stop watch/dev sessions before a clean Windows installation. A fresh GitHub runner does not share those local processes.
- Unit scope is application components/templates and future executable code under `src/app`, with the documented type/config exclusions. This does not claim browser-layout, backend, deployment or server-bootstrap test coverage.
