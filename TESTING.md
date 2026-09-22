# Simple Student CRUD

For the full ticket setup, Allure, quality gates and CI, read [the practical workshop](docs/TESTING-WORKSHOP.md). For services, pipes, directives and mocks, see [testing recipes](docs/TESTING-RECIPES.md).

## Code coverage

`npm run test:coverage` runs the tests once and generates coverage using `@vitest/coverage-v8`.
The equivalent command is `ng test --coverage --no-watch`.
The terminal shows statements, branches, functions, and lines covered by tests. Open the generated `coverage` folder's HTML report to inspect uncovered lines.
Coverage shows which code ran during tests; it does not prove every behavior is correct.

## Files

- `src/app/app.html`: sirf `<app-students />` display karta hai.
- `src/app/students/student.model.ts`: student ka structure (`id`, `name`).
- `src/app/students/students.component.ts`: add, edit, delete aur validation.
- `src/app/students/students.component.html`: form aur list.
- `src/app/students/students.component.spec.ts`: student tests.
- `src/app/app.spec.ts`: app create hone aur title ke tests.

Data memory mein hai. Refresh par Ali aur Sara dobara aa jayenge.

## CRUD ka flow

1. `students` signal list rakhta hai. `students()` se current list milti hai.
2. `[(ngModel)]="name"` input aur `name` property ko sync karta hai.
3. `saveStudent()` mein `editingId === null` ho to naya student add hota hai.
4. Edit click par `editStudent()` ID aur name form mein set karta hai. Ab save existing student update karta hai.
5. `deleteStudent(id)` selected ID ko list se remove karta hai.
6. `cancelEdit()` form clear karta hai, saved list change nahi karta.

## Pehla test samjho

```ts
it('should add a student', () => {
  component.name = 'Ahmed'; // Arrange: data tayyar karo
  component.saveStudent(); // Act: function chalao
  expect(component.students()).toHaveLength(3); // Assert: result check karo
});
```

Initially 2 students hain. Ahmed add karne ke baad 3 hone chahiye. Agar function student add nahi karta, test fail hoga.

- `describe`: related tests ka group; terminal mein group heading banta hai.
- `it`: ek test case; iska naam terminal mein dikhta hai.
- `beforeEach`: har test ke liye fresh component banata hai. Ek test ka data doosre mein nahi jata.
- `TestBed`: Angular testing setup.
- `fixture.componentInstance`: component ki properties aur methods tak access.
- `fixture.nativeElement`: rendered HTML tak access.
- `expect`: actual aur expected result compare karta hai.
- `fixture.whenStable()`: Angular ki pending updates complete hone ka wait.

Pehle direct method tests parho. Neeche HTML tests mein actual input aur buttons use hote hain, taake template bindings bhi verify hon.

## Commands

```sh
npm start
npm run test:run
```

`npm run test:watch` explicitly watch mode mein tests dobara chalata hai jab files save hoti hain. `npm test` ab ek baar run karke exit karta hai.
`ng test --no-watch` ek baar run karke exit karta hai.

`vitest.config.ts` mein `tree` reporter hai, jise Angular ka `runnerConfig` load karta hai: har file ke neeche group aur individual `should ...` names dikhte hain. Purana test process Ctrl+C se stop karke dobara run karo.

Sirf student tests:

```sh
ng test --include="src/app/students/students.component.spec.ts" --no-watch
```
