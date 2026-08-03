import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { TaskService } from '../../../../core/services/task-service';
import { TaskItem } from './task-item';

describe('TaskItem', () => {
  let fixture: ComponentFixture<TaskItem>;
  let taskService: { toggleTaskCompletion: ReturnType<typeof vi.fn>; removeTask: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    taskService = { toggleTaskCompletion: vi.fn(), removeTask: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TaskItem],
      providers: [{ provide: TaskService, useValue: taskService }]
    }).compileComponents();


    fixture = TestBed.createComponent(TaskItem);
    fixture.componentRef.setInput('task', { id: 7, title: 'Estudar', completed: false });
    await fixture.whenStable();
  });

  it('exibe o título da task associado ao checkbox', () => {
    const checkbox = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    const label = fixture.debugElement.query(By.css('label')).nativeElement as HTMLLabelElement;

    expect(label.textContent).toContain('Estudar');
    expect(label.htmlFor).toBe(checkbox.id);
    expect(checkbox.id).toBe('task-7');
  });

  it('marca visualmente a task concluída', async () => {
    const item = fixture.debugElement.query(By.css('li')).nativeElement as HTMLElement;
    expect(item.classList.contains('completed')).toBe(false);

    fixture.componentRef.setInput('task', { id: 7, title: 'Estudar', completed: true });
    await fixture.whenStable();

    expect(item.classList.contains('completed')).toBe(true);
    expect(fixture.debugElement.query(By.css('input')).nativeElement.checked).toBe(true);
  });

  it('alterna a conclusão da task ao mudar o checkbox', () => {
    fixture.debugElement.query(By.css('input')).nativeElement.dispatchEvent(new Event('change'));

    expect(taskService.toggleTaskCompletion).toHaveBeenCalledTimes(1);
    expect(taskService.toggleTaskCompletion).toHaveBeenCalledWith(7);
  });

  it('remove a task ao clicar em remove', () => {
    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;

    expect(button.getAttribute('aria-label')).toBe('Remover tarefa Estudar');
    button.click();

    expect(taskService.removeTask).toHaveBeenCalledTimes(1);
    expect(taskService.removeTask).toHaveBeenCalledWith(7);
  });
});

