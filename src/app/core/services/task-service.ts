import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, delay, finalize, forkJoin, map, of } from 'rxjs';

import { Task } from '../models/task';

const INITIAL_TASKS: readonly Task[] = [
  { id: 1, title: 'Estudar', completed: false },
  { id: 2, title: 'Fazer compras', completed: false },
  { id: 3, title: 'Praticar exercícios', completed: false }
];

const API_SUFFIX = '_INFO_API';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly destroyRef = inject(DestroyRef);

  private readonly state = signal<readonly Task[]>(INITIAL_TASKS);
  private readonly addingState = signal(false);

  readonly tasks = this.state.asReadonly();
  readonly adding = this.addingState.asReadonly();

  private nextId = INITIAL_TASKS.length + 1;

  hasTask(title: string): boolean {
    const normalized = this.normalizeTitle(title);
    return this.state().some(task => this.normalizeTitle(task.title) === normalized);
  }

  addTask(title: string): void {
    const draft: Task = { id: this.nextId++, title, completed: false };

    this.addingState.set(true);

    forkJoin([this.callApi(), this.callApi2()])
      .pipe(
        map(infos => ({ ...draft, title: draft.title + infos.join('') })),
        finalize(() => this.addingState.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(task => this.state.update(tasks => [...tasks, task]));
  }

  removeTask(id: number): void {
    this.state.update(tasks => tasks.filter(task => task.id !== id));
  }

  toggleTaskCompletion(id: number): void {
    this.state.update(tasks =>
      tasks.map(task => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
  }

  private normalizeTitle(title: string): string {
    return title
      .trim()
      .toLocaleLowerCase()
      .replace(/(_info_api)+$/, '');
  }

  private callApi(): Observable<string> {
    return of(API_SUFFIX).pipe(delay(2000));
  }

  private callApi2(): Observable<string> {
    return of(API_SUFFIX).pipe(delay(2000));
  }
}
