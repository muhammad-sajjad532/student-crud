import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Student } from './student.model';

@Component({
  selector: 'app-students',
  imports: [FormsModule],
  templateUrl: './students.component.html',
  styleUrl: './students.component.scss',
})
export class StudentsComponent {
  readonly students = signal<Student[]>([
    { id: 1, name: 'Ali' },
    { id: 2, name: 'Sara' },
  ]);

  name = '';
  editingId: number | null = null;
  error = '';
  private nextId = 3;

  saveStudent(): void {
    const name = this.name.trim();

    if (!name) {
      this.error = 'Please enter a student name.';
      return;
    }

    if (this.editingId === null) {
      const student: Student = { id: this.nextId++, name };
      this.students.update((students) => [...students, student]);
    } else {
      this.students.update((students) =>
        students.map((student) => (student.id === this.editingId ? { ...student, name } : student)),
      );
    }

    this.cancelEdit();
  }

  editStudent(student: Student): void {
    this.editingId = student.id;
    this.name = student.name;
    this.error = '';
  }

  deleteStudent(id: number): void {
    this.students.update((students) => students.filter((student) => student.id !== id));

    if (this.editingId === id) {
      this.cancelEdit();
    }
  }

  cancelEdit(): void {
    this.name = '';
    this.editingId = null;
    this.error = '';
  }
}
