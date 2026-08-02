import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { TaskService } from '../../../../core/services/task-service';
import { TaskItem } from '../task-item/task-item';

@Component({
  selector: 'app-task-list',
  imports: [TaskItem],
  templateUrl: './task-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskList {
  readonly tasks = inject(TaskService).tasks;

  readonly title = 'Título lista';
}
