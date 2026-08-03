import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { Task } from '../../../../core/models/task';
import { TaskService } from '../../../../core/services/task-service';

@Component({
  selector: 'app-task-item',
  templateUrl: './task-item.html',
  styleUrl: './task-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskItem {
  private readonly taskService = inject(TaskService);

  readonly task = input.required<Task>();

  readonly checkboxId = computed(() => `task-${this.task().id}`);

  readonly removeAriaLabel = computed(
    () => $localize`:@@taskItem.removeAria:Remover tarefa ${this.task().title}:title:`
  );

  onToggle(): void {
    this.taskService.toggleTaskCompletion(this.task().id);
  }

  onRemove(): void {
    this.taskService.removeTask(this.task().id);
  }
}

