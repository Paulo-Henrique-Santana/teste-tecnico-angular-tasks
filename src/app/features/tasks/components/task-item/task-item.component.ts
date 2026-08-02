import { Component, Input } from '@angular/core';
import { Task } from '../../../../core/models/task.model';
import { TaskService } from '../../../../core/services/task.service';

@Component({
  selector: 'app-task-item',
  templateUrl: './task-item.component.html'
})
export class TaskItemComponent {
  @Input() task!: Task;

  constructor(private taskService: TaskService) {}

  onToggle() {
    this.taskService.toggleTaskCompletion(this.task.id);
  }

  onRemove() {
    this.taskService.removeTask(this.task.id);
  }
}
