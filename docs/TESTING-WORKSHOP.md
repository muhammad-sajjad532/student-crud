# Vitest, Allure aur quality checks: practical workshop

Ye guide current Student CRUD ko use karti hai. Har lesson mein pehle concept, phir apni file, phir command aur result dekho. Saari commands project ke `package.json` wale folder se run karo.

## 1. Ticket asal mein kya maangta hai?

Ticket ka matlab sirf tests likhna nahi. Team ko ek repeatable process chahiye jo har developer aur CI machine par same rules check kare.

| Layer    | Sawal                                                 | Tool/file                      |
| -------- | ----------------------------------------------------- | ------------------------------ |
| Tests    | Kya behavior correct hai?                             | Vitest + `.spec.ts`            |
| Coverage | Kitna application code execute hua?                   | V8 + `angular.json` thresholds |
| Results  | Kaunsa test pass/fail hua, kitna time laga?           | Allure                         |
| Lint     | Kya suspicious code/test patterns hain?               | ESLint                         |
| Format   | Kya files consistent style mein hain?                 | Prettier                       |
| Build    | Kya Angular app compile aur prerender hoti hai?       | Angular CLI                    |
| CI       | Kya ye checks har push/PR par automatically chalenge? | GitHub Actions                 |

Vitest result decide karta hai. Allure us result ko readable banata hai. Allure dashboard green dikhna, apne aap CI gate enforce nahi karta.

Example: saare assertions pass hon lekin coverage 90% ho aur threshold 100% ho, to Allure tests green dikha sakta hai jabke quality pipeline red hogi. Dono apna alag result report kar rahe hain.

## 2. Apne app se test samjho

`students.component.ts` mein `saveStudent()` hai. Valid name se student add/update hota hai, blank name reject hota hai.

```ts
it('should add a student', () => {
  component.name = 'Ahmed'; // Arrange: starting data
  component.saveStudent(); // Act: behavior run karo
  expect(component.students()).toHaveLength(3); // Assert: expected result
});
```

`describe` related tests ka group hai. `it` ek behavior hai. `expect` assertion hai. `beforeEach` har test ke liye fresh component banata hai, taake order par depend na kare.

Student tests ke do levels hain:

- Logic: method call karke state check karna.
- DOM: input event aur button click karke rendered result check karna.

DOM tests mein `await fixture.whenStable()` Angular updates ka wait karta hai. Ye real Chrome E2E suite nahi; `jsdom` simulated DOM hai. Isliye CI mein browser install ya graphical display ki zarurat nahi.

Current application suite mein 23 tests hain: 2 App ke aur 21 Student component ke. Student tests cover add, read, edit, delete, empty/spaces-only input, trimming, cancel, IDs, invalid edits, unknown IDs, edit/delete interaction, error recovery aur empty state.

Run:

```sh
npm test
```

Expected: grouped test names, passing totals, `allure-results/` aur `test-results/vitest.json`.

Practice: `should add a student` mein 3 kyun expected hai? Pehle Ali aur Sara hain. Sirf test name se nahi, assertion se correctness decide hoti hai.

## 3. Vitest configuration kahan hai?

`angular.json` ka test builder Angular templates aur TypeScript compile karta hai. `runnerConfig` se `vitest.config.ts` load hota hai. Angular setup already handles TestBed initialization; is project ko raw `npx vitest` se bypass mat karo.

`vitest.config.ts` ke options:

| Option                   | Purpose                                            |
| ------------------------ | -------------------------------------------------- |
| `allowOnly: false`       | Accidentally committed `it.only` reject            |
| `passWithNoTests: false` | Empty test discovery ko success na samjho          |
| `clearMocks: true`       | Mock call history tests ke darmiyan clear          |
| `restoreMocks: true`     | Spied methods restore                              |
| `retry: 0`               | Failed test ko rerun karke failure hide nahi karna |
| `tree` reporter          | Terminal mein file/group/test tree                 |
| `json` reporter          | Machine-readable results for gate checking         |
| `allure-vitest/reporter` | Allure raw result files                            |

`angular.json` mein `isolate: true` test-file isolation enable karta hai. Existing tests fresh components use karte hain, real network calls, timers, random IDs ya shared global mutable data par depend nahi karte. Agar future tests timers use karein, fake timers ke baad `vi.useRealTimers()` cleanup zaroor karo.

## 4. Coverage aur threshold alag cheezein hain

```sh
npm run test:coverage
```

Coverage report percentages batati hai. Threshold rule decide karta hai kitni coverage ke neeche command fail hogi.

`angular.json` mein:

```json
"coverageThresholds": {
  "perFile": true,
  "statements": 100,
  "branches": 100,
  "functions": 100,
  "lines": 100
}
```

- Statements: executable instructions.
- Branches: condition ke alternate paths, jaise add vs edit.
- Functions: methods, callbacks aur generated template handlers.
- Lines: executable source lines.
- `perFile`: ek achhi file doosri file ki poor coverage ko average mein hide nahi kar sakti.

100% is small learning app ka agreed target hai. Larger app ke liye team documented policy choose kar sakti hai; failing build ko green karne ke liye silently threshold kam mat karo.

Scope: `src/app/**/*.ts` aur HTML. Spec files, interface-only `*.model.ts`, generated application config aur route wiring excluded hain. Bootstrap/server files `src/app` ke bahar hain. Future models mein executable logic rakho to exclusion review karo. Business services/pipes/directives/utilities ko exclusion mein add nahi karna.

HTML report:

```powershell
Start-Process .\coverage\angular-testing\index.html
```

100% coverage bug-free guarantee nahi: code execute hona aur har possible requirement verify hona alag hai. Meaningful assertions zaroori hain.

## 5. Allure: raw result se dashboard tak

```text
spec files → Vitest → allure-vitest reporter → allure-results/*.json
                                              ↓
                                    npm run allure:generate
                                              ↓
                                       allure-report/
                                              ↓
                                      npm run allure:open
```

Commands:

```sh
npm test
npm run allure:generate
npm run allure:open
```

Browser report mein suites, pass/fail, duration, assertion steps aur error details dekho. Features Student management aur Application shell hain. Environment mein Node version, operating system aur local/CI execution visible hai.

Current setup **Allure Report 3** (`allure` npm package) use karta hai. Is installed CLI ko Java ki zarurat nahi; Allure Report 2 ke `allure-commandline`/Java instructions mix mat karo.

Tests mein:

```ts
await allure.epic('Angular application');
await allure.feature('Student management');
```

Ye labels reporting metadata hain; CRUD behavior change nahi karte. `allure-js-commons` runtime metadata API hai; `allure-vitest` result adapter hai; `allure` report generator/viewer hai.

Reporter assertion steps automatically record karta hai. Sensitive production values ko report attachments/parameters mein mat rakho; current tests demo data use karte hain.

Results aur report alag outputs hain. `allure:generate` tests rerun nahi karta. Report open karne ke liye CLI server use karo, sirf HTML double-click nahi.

## 6. Clean results kyun?

Purane raw results ke saath naye results merge hon to report mein retries/old runs aa sakte hain. Single-run npm test commands ke `pre...` hooks raw results aur coverage clean karte hain. `allure:generate` sirf old HTML report replace karta hai.

```sh
npm run allure:clean
```

Ye sirf generated Allure/results/coverage directories delete karta hai; code files nahi. Script fixed allow-list aur resolved project path check karta hai.

`ng test` directly chalane se npm pre-hooks execute nahi hote. Repeatable reports ke liye npm scripts use karo. Watch session mein results accumulate ho sakte hain; share karne se pehle fresh `npm run test:ci` run karo. Ek workspace mein simultaneously watch aur CI/report cleanup commands mat chalao.

## 7. Quality gate kya hai?

Gate ek rule hai jo failed check par non-zero exit code deta hai. Shell mein `&&` next command sirf previous success ke baad chalata hai.

```text
lint → format check → tests + coverage → no-skips/Allure gate → report → build
```

```sh
npm run quality-check
```

| Problem                         | Kaise fail hota hai?                               |
| ------------------------------- | -------------------------------------------------- |
| Wrong expected result           | Vitest assertion failure                           |
| `.only`                         | ESLint aur Vitest restriction                      |
| `.skip` / `.todo`               | ESLint disabled-test rule                          |
| Runtime `context.skip()`        | `scripts/check-test-results.mjs` actual JSON check |
| Coverage below threshold        | Angular/Vitest coverage failure                    |
| Missing Allure result           | Result gate count/metadata validation              |
| Suspicious code or lint warning | ESLint with `--max-warnings=0`                     |
| Wrong formatting                | Prettier check                                     |
| Template/compilation error      | Angular build                                      |

`test:ci` runs coverage, then verifies all discovered tests passed, none skipped/todo, and every test has a corresponding successful Allure result with name/suite/timing.

Local quality-check stops at the failed stage. If tests failed, raw results remain; run `npm run allure:generate` separately to inspect failures. It does not turn a failed test into success.

`npm run build` alone is a compile command. The validated-build entry point is `quality-check` or the CI job, where tests must pass before the build step runs.

## 8. Lint vs formatting

ESLint: suspicious patterns, Angular template accessibility checks, unused variables, focused/disabled tests.

Prettier: indentation, spacing, quote style, layout. It doesn't test behavior.

```sh
npm run lint
npm run format:check
npm run format
```

`format` modifies files. `format:check` only reports differences and fails. Generated output directories are ignored by both tools.

## 9. CI/CD concept aur workflow

**CI (Continuous Integration):** push/PR par clean machine same validation run kare.

**CD:** successful build ko deploy karna. Is ticket ke implementation mein validation/report artifacts hain; koi production deployment add nahi hua.

`.github/workflows/quality.yml`:

1. Checkout code.
2. Node 24.18.0 setup.
3. `npm ci`: lockfile ke exact dependency versions install.
4. Lint aur formatting.
5. `test:ci`: tests + coverage + result gate.
6. Test failure par bhi Allure HTML generate karne ki koshish.
7. Previous checks successful hon to production build.
8. Success/failure dono par available reports upload; 14-day artifact retention.

Artifact pipeline ki downloadable file bundle hoti hai. Raw Allure, HTML Allure, coverage aur JSON test results preserve hote hain. Ye reports publicly deploy nahi hote.

Repo ka Git root inner `angular-testing` directory hai. Workflow bhi usi root mein hai. Isliye CI commands ko extra nested `working-directory` nahi chahiye.

No remote/provider was configured during setup, so GitHub Actions is the default implementation. Hosted CI run and branch protection require the project to be pushed to the team's GitHub repository. Mark this job required in branch protection if merges must be blocked; local files alone cannot configure repository settings. Azure/GitLab mein same npm commands use karke equivalent pipeline likhi ja sakti hai.

## 10. Team lead demo

1. Student CRUD briefly show karo.
2. Ek AAA test aur ek DOM test explain karo.
3. `angular.json`: thresholds aur runnerConfig show karo.
4. `vitest.config.ts`: terminal/JSON/Allure reporters show karo.
5. `npm run quality-check` run karo.
6. `npm run allure:open`: suites, feature labels, timings aur assertion steps show karo.
7. Coverage HTML mein executed lines show karo.
8. Workflow mein failure par artifact upload condition explain karo.

Short explanation:

> Vitest behavior verify karta hai. Coverage code execution measure karti hai. Allure results visualize karta hai. ESLint/Prettier maintainability checks hain. CI in sab rules ko har push/PR par enforce karti hai. Failed test, skipped test ya low coverage ho to validated build successful nahi hoti.

## 11. Practice exercises

Temporary branch/uncommitted edit mein ek exercise ek waqt karo; phir change undo karo:

1. Add test mein expected length 3 se 4 karo. Vitest failure aur Allure assertion details dekho.
2. `it` ko `it.skip` karo. `npm run lint` rejection dekho.
3. Sirf root app tests coverage ke saath chalao: `npm run test:coverage -- --include=src/app/app.spec.ts`. Untested CRUD paths ki wajah se threshold fail hoga.
4. Indentation change karke `npm run format:check` run karo; `npm run format` se fix karo.
5. Har experiment undo karke `npm run quality-check` green karo.

## Sources

- [Angular testing](https://angular.dev/guide/testing)
- [Angular coverage](https://angular.dev/guide/testing/code-coverage)
- [Allure Vitest integration](https://github.com/allure-framework/allure-js/tree/main/packages/allure-vitest)
- [Allure Report 3 installation](https://allurereport.org/docs/v3/install/)
- [Angular ESLint](https://github.com/angular-eslint/angular-eslint)
- [GitHub workflow artifacts](https://docs.github.com/en/actions/tutorials/store-and-share-data)
