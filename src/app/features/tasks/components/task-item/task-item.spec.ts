import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { TaskStore } from '../../../../core/services/task-store';
import { TaskItem } from './task-item';

describe('TaskItem', () => {
  let fixture: ComponentFixture<TaskItem>;
  let store: { toggleTaskCompletion: ReturnType<typeof vi.fn>; removeTask: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    store = { toggleTaskCompletion: vi.fn(), removeTask: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TaskItem],
      providers: [{ provide: TaskStore, useValue: store }]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskItem);
    fixture.componentRef.setInput('task', { id: 7, title: 'Estudar', completed: false });
    await fixture.whenStable();
  });

  it('exibe o título da task', () => {
    expect(fixture.debugElement.query(By.css('span')).nativeElement.textContent).toContain(
      'Estudar'
    );
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

    expect(store.toggleTaskCompletion).toHaveBeenCalledTimes(1);
    expect(store.toggleTaskCompletion).toHaveBeenCalledWith(7);
  });

  it('remove a task ao clicar em remove', () => {
    fixture.debugElement.query(By.css('button')).nativeElement.click();

    expect(store.removeTask).toHaveBeenCalledTimes(1);
    expect(store.removeTask).toHaveBeenCalledWith(7);
  });
});
