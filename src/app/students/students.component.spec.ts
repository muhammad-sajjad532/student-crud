import * as allure from 'allure-js-commons';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentsComponent } from './students.component';

describe('StudentsComponent', () => {
  let fixture: ComponentFixture<StudentsComponent>;
  let component: StudentsComponent;

  beforeEach(async () => {
    await allure.epic('Angular application');
    await allure.feature('Student management');
    await allure.severity('normal');
    await TestBed.configureTestingModule({ imports: [StudentsComponent] }).compileComponents();
    fixture = TestBed.createComponent(StudentsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display the initial students', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('Ali');
    expect(rows[1].textContent).toContain('Sara');
  });

  it('should add a student', () => {
    // Arrange: enter a name.
    component.name = 'Ahmed';

    // Act: save the student.
    component.saveStudent();

    // Assert: check the result.
    expect(component.students()).toHaveLength(3);
    expect(component.students()[2]).toEqual({ id: 3, name: 'Ahmed' });
    expect(component.name).toBe('');
  });

  it('should not add a student with an empty name', () => {
    component.name = '';
    component.saveStudent();
    expect(component.students()).toHaveLength(2);
    expect(component.error).toBe('Please enter a student name.');
  });

  it('should not add a name containing only spaces', () => {
    component.name = '   ';
    component.saveStudent();
    expect(component.students()).toHaveLength(2);
    expect(component.error).toBe('Please enter a student name.');
  });

  it('should remove extra spaces from a name', () => {
    component.name = '  Ahmed  ';
    component.saveStudent();
    expect(component.students()[2].name).toBe('Ahmed');
  });

  it('should fill the form when editing a student', () => {
    component.editStudent(component.students()[0]);
    expect(component.name).toBe('Ali');
    expect(component.editingId).toBe(1);
  });

  it('should update only the selected student', () => {
    component.editStudent(component.students()[0]);
    component.name = 'Ali Khan';
    component.saveStudent();
    expect(component.students()).toEqual([
      { id: 1, name: 'Ali Khan' },
      { id: 2, name: 'Sara' },
    ]);
    expect(component.editingId).toBeNull();
  });

  it('should keep the original name when saving an empty edit', () => {
    component.editStudent(component.students()[0]);
    component.name = '';
    component.saveStudent();
    expect(component.students()[0].name).toBe('Ali');
    expect(component.editingId).toBe(1);
    expect(component.error).toBe('Please enter a student name.');
  });

  it('should cancel editing without changing the student', () => {
    component.editStudent(component.students()[0]);
    component.name = 'Unsaved name';
    component.cancelEdit();
    expect(component.students()[0].name).toBe('Ali');
    expect(component.name).toBe('');
    expect(component.editingId).toBeNull();
  });

  it('should delete the selected student', () => {
    component.deleteStudent(1);
    expect(component.students()).toEqual([{ id: 2, name: 'Sara' }]);
  });

  it('should reset the form when deleting the student being edited', () => {
    component.editStudent(component.students()[0]);
    component.deleteStudent(1);
    expect(component.editingId).toBeNull();
    expect(component.name).toBe('');
    expect(component.students()).toHaveLength(1);
  });

  it('should use a new ID after deleting a student', () => {
    component.deleteStudent(2);
    component.name = 'Ahmed';
    component.saveStudent();
    expect(component.students()).toEqual([
      { id: 1, name: 'Ali' },
      { id: 3, name: 'Ahmed' },
    ]);
  });

  it('should keep the list unchanged when deleting an unknown ID', () => {
    const original = component.students();
    component.deleteStudent(999);
    expect(component.students()).toEqual(original);
  });

  it('should preserve an edit when a different student is deleted', () => {
    component.editStudent(component.students()[0]);
    component.name = 'Ali Khan';
    component.deleteStudent(2);
    expect(component.editingId).toBe(1);
    expect(component.name).toBe('Ali Khan');
    expect(component.students()).toEqual([{ id: 1, name: 'Ali' }]);
  });

  it('should clear a previous validation error when editing a student', () => {
    component.saveStudent();
    expect(component.error).toBe('Please enter a student name.');
    component.editStudent(component.students()[0]);
    expect(component.error).toBe('');
    expect(component.name).toBe('Ali');
  });

  it('should add a student through the HTML form', async () => {
    const page: HTMLElement = fixture.nativeElement;
    const input = page.querySelector<HTMLInputElement>('#student-name')!;
    input.value = 'Ahmed';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();

    page.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();

    expect(page.querySelectorAll('tbody tr').length).toBe(3);
    expect(page.querySelector('tbody')?.textContent).toContain('Ahmed');
    expect(input.value).toBe('');
  });

  it('should edit a student through the Edit button', async () => {
    const page: HTMLElement = fixture.nativeElement;
    page.querySelector<HTMLButtonElement>('[aria-label="Edit Ali"]')!.click();
    await fixture.whenStable();

    const input = page.querySelector<HTMLInputElement>('#student-name')!;
    expect(input.value).toBe('Ali');
    input.value = 'Ali Khan';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    page.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();

    expect(page.querySelector('tbody tr')?.textContent).toContain('Ali Khan');
    expect(page.querySelectorAll('tbody tr').length).toBe(2);
  });

  it('should show a validation error and clear it after a valid submission', async () => {
    const page: HTMLElement = fixture.nativeElement;
    const input = page.querySelector<HTMLInputElement>('#student-name')!;
    const submit = page.querySelector<HTMLButtonElement>('button[type="submit"]')!;

    submit.click();
    await fixture.whenStable();

    expect(page.querySelector('[role="alert"]')?.textContent).toBe('Please enter a student name.');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('name-error');
    expect(page.querySelectorAll('tbody tr')).toHaveLength(2);

    input.value = 'Ahmed';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    submit.click();
    await fixture.whenStable();

    expect(page.querySelector('[role="alert"]')).toBeNull();
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    expect(input.hasAttribute('aria-describedby')).toBe(false);
    expect(page.querySelectorAll('tbody tr')).toHaveLength(3);
  });

  it('should cancel editing through the Cancel button', async () => {
    const page: HTMLElement = fixture.nativeElement;
    page.querySelector<HTMLButtonElement>('[aria-label="Edit Ali"]')!.click();
    await fixture.whenStable();

    const input = page.querySelector<HTMLInputElement>('#student-name')!;
    input.value = 'Unsaved name';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    page.querySelector<HTMLButtonElement>('form button[type="button"]')!.click();
    await fixture.whenStable();

    expect(input.value).toBe('');
    expect(page.querySelector('#form-heading')?.textContent).toBe('Add student');
    expect(page.querySelector('form button[type="button"]')).toBeNull();
    expect(component.students()[0]).toEqual({ id: 1, name: 'Ali' });
    expect(page.querySelector('tbody tr')?.textContent).toContain('Ali');
  });

  it('should show an empty message after deleting all students', async () => {
    const page: HTMLElement = fixture.nativeElement;
    page.querySelector<HTMLButtonElement>('[aria-label="Delete Ali"]')!.click();
    await fixture.whenStable();
    page.querySelector<HTMLButtonElement>('[aria-label="Delete Sara"]')!.click();
    await fixture.whenStable();

    expect(component.students()).toHaveLength(0);
    expect(page.querySelector('.empty')?.textContent).toContain('No students yet.');
  });
});
