import { WritableSignal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { TaskStore } from '../../../../core/services/task-store';
import { MIN_TASK_TITLE_LENGTH } from '../../validators/task-title-validators';
import { TaskForm } from './task-form';

describe('TaskForm', () => {
  const VALID_TITLE = 'Ler a documentacao oficial';

  let fixture: ComponentFixture<TaskForm>;
  let component: TaskForm;
  let adding: WritableSignal<boolean>;
  let store: { adding: WritableSignal<boolean>; addTask: ReturnType<typeof vi.fn>; hasTask: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    adding = signal(false);
    store = { adding, addTask: vi.fn(), hasTask: vi.fn().mockReturnValue(false) };

    await TestBed.configureTestingModule({
      imports: [TaskForm],
      providers: [{ provide: TaskStore, useValue: store }]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  const submit = async () => {
    fixture.debugElement.query(By.css('form')).triggerEventHandler('ngSubmit', null);
    await fixture.whenStable();
  };

  const errorText = () => {
    const error = fixture.debugElement.query(By.css('.field-error'));
    return error ? error.nativeElement.textContent.trim() : null;
  };

  it('inicia com o campo vazio e inválido', () => {
    expect(component.titleControl.value).toBe('');
    expect(component.titleControl.invalid).toBe(true);
    expect(component.errorMessage()).toBeNull();
  });

  it('não chama a api a cada digitação', async () => {
    component.titleControl.setValue('Ler');
    component.titleControl.setValue('Ler a documentacao');
    component.titleControl.setValue(VALID_TITLE);
    await fixture.whenStable();

    expect(store.addTask).not.toHaveBeenCalled();
  });

  it('adiciona a task somente no submit, com o título sem espaços nas extremidades', async () => {
    component.titleControl.setValue(`  ${VALID_TITLE}  `);
    await submit();

    expect(store.addTask).toHaveBeenCalledTimes(1);
    expect(store.addTask).toHaveBeenCalledWith(VALID_TITLE);
  });

  it('limpa o campo após adicionar', async () => {
    component.titleControl.setValue(VALID_TITLE);
    await submit();

    expect(component.titleControl.value).toBe('');
    expect(component.titleControl.touched).toBe(false);
  });

  it('não adiciona quando o campo está vazio e exibe erro de obrigatório', async () => {
    await submit();

    expect(store.addTask).not.toHaveBeenCalled();
    expect(errorText()).toBe('Informe o título da task.');
  });

  it('não adiciona títulos com caracteres que não são letras', async () => {
    component.titleControl.setValue('Ler a documentacao 2026');
    await submit();

    expect(store.addTask).not.toHaveBeenCalled();
    expect(errorText()).toBe('O título deve conter somente letras.');
  });

  it(`não adiciona títulos com menos de ${MIN_TASK_TITLE_LENGTH} caracteres`, async () => {
    component.titleControl.setValue('Ler documentacao');
    await submit();

    expect(store.addTask).not.toHaveBeenCalled();
    expect(errorText()).toBe(
      `O título deve ter no mínimo ${MIN_TASK_TITLE_LENGTH} caracteres.`
    );
  });

  it('não adiciona uma task já existente', async () => {
    store.hasTask.mockReturnValue(true);
    component.titleControl.setValue(VALID_TITLE);
    await submit();

    expect(store.addTask).not.toHaveBeenCalled();
    expect(errorText()).toBe('Essa task já foi adicionada.');
  });

  it('não exibe erro enquanto o campo não foi tocado', async () => {
    component.titleControl.setValue('Ler');
    await fixture.whenStable();

    expect(errorText()).toBeNull();
  });

  it('adiciona a task no submit nativo do formulário', async () => {
    component.titleControl.setValue(VALID_TITLE);
    const form = fixture.debugElement.query(By.css('form')).nativeElement as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement).toBe(
      form.querySelector('button')
    );
    expect(store.addTask).toHaveBeenCalledTimes(1);
    expect(store.addTask).toHaveBeenCalledWith(VALID_TITLE);
  });

  describe('loading', () => {
    const button = () =>
      fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement as HTMLButtonElement;

    const status = () => fixture.debugElement.query(By.css('.form-status'));

    const setAdding = async (value: boolean) => {
      adding.set(value);
      await fixture.whenStable();
    };

    it('não exibe loading enquanto nenhuma task está sendo adicionada', () => {
      expect(component.adding()).toBe(false);
      expect(button().disabled).toBe(false);
      expect(button().textContent?.trim()).toBe('Adicionar');
      expect(fixture.debugElement.query(By.css('.spinner'))).toBeNull();
      expect(status()).toBeNull();
    });

    it('exibe spinner, texto e desabilita o botão durante a adição', async () => {
      await setAdding(true);

      expect(button().disabled).toBe(true);
      expect(button().textContent?.trim()).toContain('Adicionando...');
      expect(fixture.debugElement.query(By.css('.spinner'))).not.toBeNull();
      expect(status().nativeElement.textContent.trim()).toBe('Adicionando task...');
    });

    it('remove o loading quando a adição termina', async () => {
      await setAdding(true);
      await setAdding(false);

      expect(button().disabled).toBe(false);
      expect(fixture.debugElement.query(By.css('.spinner'))).toBeNull();
      expect(status()).toBeNull();
    });

    it('ignora novos submits enquanto uma task está sendo adicionada', async () => {
      await setAdding(true);
      component.titleControl.setValue(VALID_TITLE);
      await submit();

      expect(store.addTask).not.toHaveBeenCalled();
    });
  });
});
