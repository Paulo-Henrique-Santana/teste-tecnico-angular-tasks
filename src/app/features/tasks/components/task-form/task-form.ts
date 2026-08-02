import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { TaskStore } from '../../../../core/services/task-store';
import {
  MIN_TASK_TITLE_LENGTH,
  minTitleLength,
  onlyLetters,
  uniqueTitle
} from '../../validators/task-title-validators';

const ERROR_MESSAGES: Record<string, string> = {
  required: 'Informe o título da task.',
  onlyLetters: 'O título deve conter somente letras.',
  minTitleLength: `O título deve ter no mínimo ${MIN_TASK_TITLE_LENGTH} caracteres.`,
  duplicatedTitle: 'Essa task já foi adicionada.'
};

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule],
  templateUrl: './task-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskForm {
  private readonly store = inject(TaskStore);

  readonly adding = this.store.adding;

  readonly titleControl = new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      onlyLetters,
      minTitleLength,
      uniqueTitle(title => this.store.hasTask(title))
    ]
  });

  readonly form = new FormGroup({ title: this.titleControl });

  private readonly controlEvents = toSignal(this.titleControl.events);

  readonly errorMessage = computed(() => {
    this.controlEvents();

    const errors = this.titleControl.errors;
    if (!this.titleControl.touched || !errors) {
      return null;
    }

    const key = Object.keys(ERROR_MESSAGES).find(error => errors[error]);
    return key ? ERROR_MESSAGES[key] : null;
  });

  onSubmit(): void {
    if (this.adding()) {
      return;
    }

    this.titleControl.updateValueAndValidity();

    if (this.titleControl.invalid) {
      this.titleControl.markAsTouched();
      return;
    }

    this.store.addTask(this.titleControl.value.trim());
    this.titleControl.reset('');
  }
}
