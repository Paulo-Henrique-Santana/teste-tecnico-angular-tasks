import { Component } from '@angular/core';
import { TaskService } from './task.service';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html'
})
export class TaskFormComponent {
  title = '';

  constructor(private taskService: TaskService) {}

  onSubmit() {
    const trimmed = this.title.trim();
    if (trimmed) {
      this.taskService.addTask(trimmed);
      this.title = '';
    }
  }
}
