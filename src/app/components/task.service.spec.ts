import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Task, TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let emissions: Task[][];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskService);
    emissions = [];
    service.tasks$.subscribe(tasks => emissions.push(tasks.map(task => ({ ...task }))));
  });

  const current = () => emissions[emissions.length - 1];

  it('emite as 3 tasks pré-carregadas na inicialização', () => {
    expect(emissions.length).toBe(1);
    expect(current().map(task => task.title)).toEqual([
      'Estudar',
      'Fazer compras',
      'Praticar exercícios'
    ]);
  });

  describe('hasTask', () => {
    it('encontra a task ignorando caixa e espaços', () => {
      expect(service.hasTask('  estudar ')).toBeTrue();
    });

    it('encontra a task ignorando o sufixo adicionado pela api', () => {
      expect(service.hasTask('Estudar_INFO_API_INFO_API')).toBeTrue();
    });

    it('retorna false para título inexistente', () => {
      expect(service.hasTask('Ler documentação')).toBeFalse();
    });
  });

  describe('addTask', () => {
    it('resolve as duas chamadas de api em paralelo (2s no total)', fakeAsync(() => {
      service.addTask('Ler a documentação oficial');

      tick(1999);
      expect(current().length).toBe(3);

      tick(1);
      expect(current().length).toBe(4);
    }));

    it('publica a task retornada pelas duas apis', fakeAsync(() => {
      service.addTask('Ler a documentação oficial');
      tick(2000);

      const added = current()[3];
      expect(added.title).toBe('Ler a documentação oficial_INFO_API_INFO_API');
      expect(added.completed).toBeFalse();
      expect(added.id).toBeGreaterThan(0);
    }));

    it('passa a considerar a task adicionada como duplicada', fakeAsync(() => {
      service.addTask('Ler a documentação oficial');
      tick(2000);

      expect(service.hasTask('Ler a documentação oficial')).toBeTrue();
    }));
  });

  it('removeTask remove apenas a task informada', () => {
    service.removeTask(2);

    expect(current().map(task => task.id)).toEqual([1, 3]);
  });

  it('removeTask não emite alteração indevida para id inexistente', () => {
    service.removeTask(999);

    expect(current().length).toBe(3);
  });

  describe('toggleTaskCompletion', () => {
    it('alterna o estado da task', () => {
      service.toggleTaskCompletion(1);
      expect(current()[0].completed).toBeTrue();

      service.toggleTaskCompletion(1);
      expect(current()[0].completed).toBeFalse();
    });

    it('não emite quando a task não existe', () => {
      const before = emissions.length;
      service.toggleTaskCompletion(999);

      expect(emissions.length).toBe(before);
    });
  });
});
