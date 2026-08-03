import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { Task } from '../../../../core/models/task';
import { TaskService } from '../../../../core/services/task-service';
import { TaskList } from './task-list';

describe('TaskList', () => {
  const preloaded: Task[] = [
    { id: 1, title: 'Estudar', completed: false },
    { id: 2, title: 'Fazer compras', completed: false },
    { id: 3, title: 'Praticar exercícios', completed: false }
  ];

  let fixture: ComponentFixture<TaskList>;
  let tasks: ReturnType<typeof signal<readonly Task[]>>;

  beforeEach(async () => {
    tasks = signal<readonly Task[]>(preloaded);

    await TestBed.configureTestingModule({
      imports: [TaskList],
      providers: [
        {
          provide: TaskService,
          useValue: { tasks, toggleTaskCompletion: vi.fn(), removeTask: vi.fn() }
        }
      ]
    }).compileComponents();


    fixture = TestBed.createComponent(TaskList);
    await fixture.whenStable();
  });

  const titles = () =>
    fixture.debugElement
      .queryAll(By.css('app-task-item span'))
      .map(item => item.nativeElement.textContent.trim());

  it('renderiza as tasks pré-carregadas', () => {
    expect(titles()).toEqual(['Estudar', 'Fazer compras', 'Praticar exercícios']);
  });

  it('reage a novas tasks publicadas no service', async () => {
    tasks.set([...preloaded, { id: 4, title: 'Ler', completed: false }]);
    await fixture.whenStable();

    expect(titles().length).toBe(4);
  });

  it('exibe mensagem quando não há tasks', async () => {
    tasks.set([]);
    await fixture.whenStable();

    expect(titles()).toEqual([]);
    expect(fixture.debugElement.query(By.css('.empty')).nativeElement.textContent).toContain(
      'Nenhuma tarefa cadastrada.'
    );
  });
});
