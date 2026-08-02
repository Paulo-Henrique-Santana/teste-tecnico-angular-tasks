import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { TaskService } from './task.service';
import {
  MIN_TASK_TITLE_LENGTH,
  minTitleLength,
  onlyLetters,
  uniqueTitle
} from './task-title.validators';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html'
})
export class TaskFormComponent {
  readonly titleControl: FormControl<string>;

  private readonly errorMessages: Record<string, string> = {
    required: 'Informe o título da task.',
    onlyLetters: 'O título deve conter somente letras.',
    minTitleLength: `O título deve ter no mínimo ${MIN_TASK_TITLE_LENGTH} caracteres.`,
    duplicatedTitle: 'Essa task já foi adicionada.'
  };

  constructor(private taskService: TaskService) {
    this.titleControl = new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        onlyLetters,
        minTitleLength,
        uniqueTitle(title => this.taskService.hasTask(title))
      ]
    });
  }

  get errorMessage(): string | null {
    const errors = this.titleControl.errors;

    if (!this.titleControl.touched || !errors) {
      return null;
    }

    const key = Object.keys(this.errorMessages).find(error => errors[error]);
    return key ? this.errorMessages[key] : null;
  }

  onSubmit() {
    this.titleControl.updateValueAndValidity();

    if (this.titleControl.invalid) {
      this.titleControl.markAsTouched();
      return;
    }

    this.taskService.addTask(this.titleControl.value.trim());
    this.titleControl.reset('');
  }
}
