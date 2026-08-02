import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TaskFormComponent } from './task-form.component';
import { TaskService } from '../../../../core/services/task.service';
import { MIN_TASK_TITLE_LENGTH } from '../../validators/task-title.validators';

describe('TaskFormComponent', () => {
  const VALID_TITLE = 'Ler a documentacao oficial';

  let fixture: ComponentFixture<TaskFormComponent>;
  let component: TaskFormComponent;
  let taskService: jasmine.SpyObj<TaskService>;

  beforeEach(async () => {
    taskService = jasmine.createSpyObj<TaskService>('TaskService', ['addTask', 'hasTask']);
    taskService.hasTask.and.returnValue(false);

    await TestBed.configureTestingModule({
      declarations: [TaskFormComponent],
      imports: [FormsModule, ReactiveFormsModule],
      providers: [{ provide: TaskService, useValue: taskService }]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const submit = () => {
    fixture.debugElement.query(By.css('form')).triggerEventHandler('ngSubmit', null);
    fixture.detectChanges();
  };

  const errorText = () => {
    const error = fixture.debugElement.query(By.css('.field-error'));
    return error ? error.nativeElement.textContent.trim() : null;
  };

  it('inicia com o campo vazio e inválido', () => {
    expect(component.titleControl.value).toBe('');
    expect(component.titleControl.invalid).toBeTrue();
    expect(component.errorMessage).toBeNull();
  });

  it('não chama a api a cada digitação', () => {
    component.titleControl.setValue('Ler');
    component.titleControl.setValue('Ler a documentacao');
    component.titleControl.setValue(VALID_TITLE);
    fixture.detectChanges();

    expect(taskService.addTask).not.toHaveBeenCalled();
  });

  it('adiciona a task somente no submit, com o título sem espaços nas extremidades', () => {
    component.titleControl.setValue(`  ${VALID_TITLE}  `);
    submit();

    expect(taskService.addTask).toHaveBeenCalledOnceWith(VALID_TITLE);
  });

  it('limpa o campo após adicionar', () => {
    component.titleControl.setValue(VALID_TITLE);
    submit();

    expect(component.titleControl.value).toBe('');
    expect(component.titleControl.touched).toBeFalse();
  });

  it('não adiciona quando o campo está vazio e exibe erro de obrigatório', () => {
    submit();

    expect(taskService.addTask).not.toHaveBeenCalled();
    expect(errorText()).toBe('Informe o título da task.');
  });

  it('não adiciona títulos com caracteres que não são letras', () => {
    component.titleControl.setValue('Ler a documentacao 2026');
    submit();

    expect(taskService.addTask).not.toHaveBeenCalled();
    expect(errorText()).toBe('O título deve conter somente letras.');
  });

  it(`não adiciona títulos com menos de ${MIN_TASK_TITLE_LENGTH} caracteres`, () => {
    component.titleControl.setValue('Ler documentacao');
    submit();

    expect(taskService.addTask).not.toHaveBeenCalled();
    expect(errorText()).toBe(
      `O título deve ter no mínimo ${MIN_TASK_TITLE_LENGTH} caracteres.`
    );
  });

  it('não adiciona uma task já existente', () => {
    taskService.hasTask.and.returnValue(true);
    component.titleControl.setValue(VALID_TITLE);
    submit();

    expect(taskService.addTask).not.toHaveBeenCalled();
    expect(errorText()).toBe('Essa task já foi adicionada.');
  });

  it('não exibe erro enquanto o campo não foi tocado', () => {
    component.titleControl.setValue('Ler');
    fixture.detectChanges();

    expect(errorText()).toBeNull();
  });

  it('submete o formulário pelo botão adicionar', () => {
    component.titleControl.setValue(VALID_TITLE);
    fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement.click();
    fixture.detectChanges();

    expect(taskService.addTask).toHaveBeenCalledOnceWith(VALID_TITLE);
  });
});
