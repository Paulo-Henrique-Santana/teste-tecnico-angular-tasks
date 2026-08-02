import { FormControl } from '@angular/forms';

import {
  MIN_TASK_TITLE_LENGTH,
  minTitleLength,
  onlyLetters,
  uniqueTitle
} from './task-title-validators';

describe('task title validators', () => {
  const control = (value: string) => new FormControl(value);

  describe('onlyLetters', () => {
    it('aceita letras, acentos e espaços', () => {
      expect(onlyLetters(control('Praticar exercícios físicos'))).toBeNull();
    });

    it('rejeita números e símbolos', () => {
      expect(onlyLetters(control('Task 1'))).toEqual({ onlyLetters: true });
      expect(onlyLetters(control('Task_1!'))).toEqual({ onlyLetters: true });
    });

    it('ignora valor vazio para não competir com required', () => {
      expect(onlyLetters(control(''))).toBeNull();
      expect(onlyLetters(control('   '))).toBeNull();
    });
  });

  describe('minTitleLength', () => {
    it(`aceita títulos com ${MIN_TASK_TITLE_LENGTH} caracteres ou mais`, () => {
      expect(minTitleLength(control('a'.repeat(MIN_TASK_TITLE_LENGTH)))).toBeNull();
    });

    it('rejeita títulos menores informando o tamanho exigido e o atual', () => {
      expect(minTitleLength(control('a'.repeat(MIN_TASK_TITLE_LENGTH - 1)))).toEqual({
        minTitleLength: { required: MIN_TASK_TITLE_LENGTH, actual: MIN_TASK_TITLE_LENGTH - 1 }
      });
    });

    it('desconsidera espaços nas extremidades ao medir', () => {
      const value = `  ${'a'.repeat(MIN_TASK_TITLE_LENGTH - 1)}  `;
      expect(minTitleLength(control(value))).not.toBeNull();
    });

    it('ignora valor vazio', () => {
      expect(minTitleLength(control(''))).toBeNull();
    });
  });

  describe('uniqueTitle', () => {
    it('rejeita quando o título já existe', () => {
      const validator = uniqueTitle(() => true);
      expect(validator(control('Estudar Angular a fundo'))).toEqual({ duplicatedTitle: true });
    });

    it('aceita quando o título não existe', () => {
      const validator = uniqueTitle(() => false);
      expect(validator(control('Estudar Angular a fundo'))).toBeNull();
    });

    it('consulta a duplicidade com o valor sem espaços nas extremidades', () => {
      const isDuplicate = vi.fn().mockReturnValue(false);
      uniqueTitle(isDuplicate)(control('  Estudar Angular  '));
      expect(isDuplicate).toHaveBeenCalledWith('Estudar Angular');
    });

    it('ignora valor vazio', () => {
      const isDuplicate = vi.fn().mockReturnValue(true);
      expect(uniqueTitle(isDuplicate)(control(''))).toBeNull();
      expect(isDuplicate).not.toHaveBeenCalled();
    });
  });
});
