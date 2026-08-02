import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { Task } from '../../../../core/models/task.model';
import { TaskService } from '../../../../core/services/task.service';
import { TaskItemComponent } from '../task-item/task-item.component';
import { TaskListComponent } from './task-list.component';

describe('TaskListComponent', () => {
  const preloaded: Task[] = [
    { id: 1, title: 'Estudar', completed: false },
    { id: 2, title: 'Fazer compras', completed: false },
    { id: 3, title: 'Praticar exercícios', completed: false }
  ];

  let fixture: ComponentFixture<TaskListComponent>;
  let tasksSubject: BehaviorSubject<Task[]>;

  beforeEach(async () => {
    tasksSubject = new BehaviorSubject<Task[]>(preloaded);

    await TestBed.configureTestingModule({
      declarations: [TaskListComponent, TaskItemComponent],
      imports: [CommonModule],
      providers: [
        {
          provide: TaskService,
          useValue: {
            tasks$: tasksSubject.asObservable(),
            toggleTaskCompletion: () => {},
            removeTask: () => {}
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
    fixture.detectChanges();
  });

  const titles = () =>
    fixture.debugElement
      .queryAll(By.css('app-task-item span'))
      .map(item => item.nativeElement.textContent.trim());

  it('renderiza as tasks pré-carregadas', () => {
    expect(titles()).toEqual(['Estudar', 'Fazer compras', 'Praticar exercícios']);
  });

  it('reage a novas emissões da lista', () => {
    tasksSubject.next([...preloaded, { id: 4, title: 'Ler', completed: false }]);
    fixture.detectChanges();

    expect(titles().length).toBe(4);
  });

  it('renderiza lista vazia sem erro', () => {
    tasksSubject.next([]);
    fixture.detectChanges();

    expect(titles()).toEqual([]);
  });
});
