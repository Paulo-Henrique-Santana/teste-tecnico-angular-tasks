import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import {
  DeferredScriptLoader,
  LEGACY_HEAVY_SCRIPT_URL
} from './core/services/deferred-script-loader';
import { TaskForm } from './features/tasks/components/task-form/task-form';
import { TaskList } from './features/tasks/components/task-list/task-list';
import { Header } from './shared/components/header/header';

@Component({
  selector: 'app-root',
  imports: [Header, TaskForm, TaskList],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private readonly deferredScriptLoader = inject(DeferredScriptLoader);

  constructor() {
    void this.deferredScriptLoader.loadAfterAppStable(LEGACY_HEAVY_SCRIPT_URL);
  }
}
