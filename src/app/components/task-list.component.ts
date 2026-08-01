import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Task, TaskService } from './task.service';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html'
})
export class TaskListComponent implements OnInit, AfterViewInit {
  tasks: Task[] = [];
  titulo: string = '';

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.taskService.tasks$.subscribe(tasks => this.tasks = tasks);
  }

  ngAfterViewInit() {
    this.titulo = 'Título lista';
  }
}
