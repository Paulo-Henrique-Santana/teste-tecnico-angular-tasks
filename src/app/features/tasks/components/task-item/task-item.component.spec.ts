import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TaskItemComponent } from './task-item.component';
import { TaskService } from '../../../../core/services/task.service';

describe('TaskItemComponent', () => {
  let fixture: ComponentFixture<TaskItemComponent>;
  let component: TaskItemComponent;
  let taskService: jasmine.SpyObj<TaskService>;

  beforeEach(async () => {
    taskService = jasmine.createSpyObj<TaskService>('TaskService', [
      'toggleTaskCompletion',
      'removeTask'
    ]);

    await TestBed.configureTestingModule({
      declarations: [TaskItemComponent],
      providers: [{ provide: TaskService, useValue: taskService }]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskItemComponent);
    component = fixture.componentInstance;
    component.task = { id: 7, title: 'Estudar', completed: false };
    fixture.detectChanges();
  });

  it('exibe o título da task', () => {
    expect(fixture.debugElement.query(By.css('span')).nativeElement.textContent).toContain(
      'Estudar'
    );
  });

  it('marca visualmente a task concluída', () => {
    const item = fixture.debugElement.query(By.css('li')).nativeElement as HTMLElement;
    expect(item.classList).not.toContain('completed');

    component.task = { ...component.task, completed: true };
    fixture.detectChanges();

    expect(item.classList).toContain('completed');
    expect(fixture.debugElement.query(By.css('input')).nativeElement.checked).toBeTrue();
  });

  it('alterna a conclusão da task ao mudar o checkbox', () => {
    fixture.debugElement.query(By.css('input')).nativeElement.dispatchEvent(new Event('change'));

    expect(taskService.toggleTaskCompletion).toHaveBeenCalledOnceWith(7);
  });

  it('remove a task ao clicar em remove', () => {
    fixture.debugElement.query(By.css('button')).nativeElement.click();

    expect(taskService.removeTask).toHaveBeenCalledOnceWith(7);
  });
});
