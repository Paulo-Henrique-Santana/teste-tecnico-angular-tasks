import { Component } from '@angular/core';
import { TaskService } from './task.service';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html'
})
export class TaskFormComponent {

  constructor(private taskService: TaskService) {}

  onKeyPress(value: any) {
      console.log(value.target.value);  
      this.taskService.addTask(value.target.value.trim());
  }
}
