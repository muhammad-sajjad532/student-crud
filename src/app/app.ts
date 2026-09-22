import { Component } from '@angular/core';
import { StudentsComponent } from './students/students.component';

@Component({
  selector: 'app-root',
  imports: [StudentsComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
