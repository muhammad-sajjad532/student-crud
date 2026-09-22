# Testing conventions and recipes

These recipes describe how to extend the current setup. The sample app currently contains components and an interface, not HTTP services, custom pipes or directives. Do not add fake application features just to increase test counts.

## Conventions

- Keep tests next to the implementation: `name.component.spec.ts`, `name.service.spec.ts`, `name.pipe.spec.ts`, `name.directive.spec.ts`, `name.spec.ts` for a utility.
- Group by class/feature using `describe`; use descriptive `it('should ...')` behavior names.
- Arrange, Act, Assert. Assert an observable result; avoid tests that merely repeat implementation details.
- Include happy paths, invalid inputs and relevant edge cases.
- Recreate mutable fixtures/mocks in `beforeEach`. Never depend on another test running first.
- Do not commit `.only`, `.skip`, `.todo` or runtime skips. The quality pipeline rejects them.
- Await asynchronous work. Do not use arbitrary sleeps.
- Add Allure `feature` metadata for new suites; no account or remote reporting service is required.
- Use the Angular CLI test builder, not a second competing raw Vitest setup.

## Component

Follow `students.component.spec.ts`: standalone component in TestBed `imports`, create fixture, wait for stabilization, then check either class behavior or rendered DOM. Set input value AND dispatch an input event when testing a form binding.

## Service with dependency injection

Register the service in TestBed `providers` if it isn't root-provided; use `TestBed.inject(YourService)`. Services that call `inject()` require an injection context, so do not instantiate those with a plain `new`.

When the service depends on an external API, provide a test double. This illustrative snippet assumes your future application defines `StudentApi` and a consumer:

```ts
const api = { load: vi.fn().mockResolvedValue([{ id: 1, name: 'Ali' }]) };
TestBed.configureTestingModule({
  providers: [{ provide: StudentApi, useValue: api }],
});
```

Create the mock afresh for each test. `vi.fn()` tracks calls and controls return values. Test a rejected response as well as successful data; check the consumer's error state. Do not mock the method whose own behavior you want to test.

## HttpClient service

Use Angular's real HttpClient with the testing backend; no network request leaves the test:

```ts
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

TestBed.configureTestingModule({
  providers: [provideHttpClient(), provideHttpClientTesting()],
});
const http = TestBed.inject(HttpTestingController);
```

Invoke/subscribe to the service method, use `http.expectOne('/api/students')`, assert HTTP method, and use `request.flush(...)` to deliver a deterministic response. Call `http.verify()` in `afterEach` to catch unexpected requests. Test success and error responses. Register `provideHttpClientTesting()` after `provideHttpClient()`.

## Pipe

For a pure pipe with no injected dependencies, instantiate it and test `transform()` with normal, empty and boundary values. For a pipe with dependencies, provide/inject it through TestBed. A host component test can additionally verify template usage.

## Directive

Create a small standalone test host component whose template applies the real directive. Import the directive into that host, render it with TestBed, trigger the relevant events and assert the resulting DOM/attributes. Test missing/changed inputs where applicable.

## Utility

Import the real function and call it directly. No TestBed is needed for plain TypeScript logic. Use `it.each` when the same behavior has a meaningful input/output matrix. Avoid mocking simple pure calculations.

## Timers and dates

If future code depends on time, use `vi.useFakeTimers()` and a fixed system time. Advance timers explicitly, then restore real timers in `afterEach`. Mock restoration does not replace timer cleanup.

## Coverage policy

The broad app-source include applies to future executable services/pipes/directives/utilities too. Review exclusions whenever adding a new source category. Keep business logic out of configuration files and type-only models, which are excluded. Unit-test coverage does not cover browser layout, bootstrap/server wiring, or backend behavior; use other test levels when those become requirements.

References: [Angular service testing](https://angular.dev/guide/testing/services), [HTTP testing](https://angular.dev/guide/http/testing), [pipe testing](https://angular.dev/guide/testing/pipes), [directive testing](https://angular.dev/guide/testing/attribute-directives).
