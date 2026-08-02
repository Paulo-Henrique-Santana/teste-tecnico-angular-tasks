import { Injectable } from '@angular/core';
import { BehaviorSubject, delay, Observable, Observer } from 'rxjs';

export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private tasks: Task[] = [
    { id: 1, title: 'Estudar', completed: false },
    { id: 2, title: 'Fazer compras', completed: false },
    { id: 3, title: 'Praticar exercícios', completed: false },
  ];

  private tasksSubject = new BehaviorSubject<Task[]>(this.tasks);
  tasks$ = this.tasksSubject.asObservable();

  addTask(title: string) {
    const newTask: Task = {
      id: Date.now(),
      title,
      completed: false
    };

    this.callApi(newTask).subscribe(res => {
      this.callApi2(res).subscribe((res2) => {
        this.tasks.push(res2);
        this.tasksSubject.next(this.tasks);
      });
    });
  }

  private callApi(task: Task): Observable<Task> {
    return new Observable<Task>((observer: Observer<Task>) => {
      task.title = task.title + '_INFO_API';
      observer.next(task);
      observer.complete();
    }).pipe(delay(2000));
  }

  private callApi2(task: Task) {
    return new Observable<Task>((observer: Observer<Task>) => {
      task.title = task.title + '_INFO_API';
      observer.next(task);
      observer.complete();
    }).pipe(delay(2000));
  }

  removeTask(id: number) {
    this.tasks = this.tasks.filter(task => task.id !== id);
    this.tasksSubject.next(this.tasks);
  }

  toggleTaskCompletion(id: number) {
    const task = this.tasks.find(task => task.id === id);
    if (task) {
      task.completed = !task.completed;
      this.tasksSubject.next(this.tasks);
    }
  }
}
