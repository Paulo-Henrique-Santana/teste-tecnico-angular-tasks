import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const MIN_TASK_TITLE_LENGTH = 20;

const ONLY_LETTERS = /^[\p{L}\s]+$/u;

function normalized(control: AbstractControl): string {
  return (control.value ?? '').trim();
}

export function onlyLetters(control: AbstractControl): ValidationErrors | null {
  const value = normalized(control);
  return !value || ONLY_LETTERS.test(value) ? null : { onlyLetters: true };
}

export function minTitleLength(control: AbstractControl): ValidationErrors | null {
  const value = normalized(control);
  if (!value || value.length >= MIN_TASK_TITLE_LENGTH) {
    return null;
  }
  return { minTitleLength: { required: MIN_TASK_TITLE_LENGTH, actual: value.length } };
}

export function uniqueTitle(isDuplicate: (title: string) => boolean): ValidatorFn {
  return control => {
    const value = normalized(control);
    return !value || !isDuplicate(value) ? null : { duplicatedTitle: true };
  };
}
