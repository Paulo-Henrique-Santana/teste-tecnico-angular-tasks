import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { TaskStore } from '../../../../core/services/task-store';
import { TaskItem } from '../task-item/task-item';

@Component({
  selector: 'app-task-list',
  imports: [TaskItem],
  templateUrl: './task-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskList {
  readonly tasks = inject(TaskStore).tasks;
  readonly title = 'Título lista';
}
