import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

import { Task } from '../../../../core/models/task';
import { TaskStore } from '../../../../core/services/task-store';

@Component({
  selector: 'app-task-item',
  templateUrl: './task-item.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskItem {
  private readonly store = inject(TaskStore);

  readonly task = input.required<Task>();

  onToggle(): void {
    this.store.toggleTaskCompletion(this.task().id);
  }

  onRemove(): void {
    this.store.removeTask(this.task().id);
  }
}
