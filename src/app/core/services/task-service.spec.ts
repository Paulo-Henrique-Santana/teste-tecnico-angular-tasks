import { TestBed } from '@angular/core/testing';

import { TaskService } from './task-service';

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('expõe as 3 tasks pré-carregadas na inicialização', () => {
    expect(service.tasks().map(task => task.title)).toEqual([
      'Estudar',
      'Fazer compras',
      'Praticar exercícios'
    ]);
  });

  describe('hasTask', () => {
    it('encontra a task ignorando caixa e espaços', () => {
      expect(service.hasTask('  estudar ')).toBe(true);
    });

    it('encontra a task ignorando o sufixo adicionado pela api', () => {
      expect(service.hasTask('Estudar_INFO_API_INFO_API')).toBe(true);
    });

    it('retorna false para título inexistente', () => {
      expect(service.hasTask('Ler documentação')).toBe(false);
    });
  });

  describe('addTask', () => {
    it('resolve as duas chamadas de api em paralelo (2s no total)', async () => {
      service.addTask('Ler a documentação oficial');

      await vi.advanceTimersByTimeAsync(1999);
      expect(service.tasks().length).toBe(3);

      await vi.advanceTimersByTimeAsync(1);
      expect(service.tasks().length).toBe(4);
    });

    it('publica a task com as informações das duas apis', async () => {
      service.addTask('Ler a documentação oficial');
      await vi.advanceTimersByTimeAsync(2000);

      const added = service.tasks()[3];
      expect(added.title).toBe('Ler a documentação oficial_INFO_API_INFO_API');
      expect(added.completed).toBe(false);
      expect(added.id).toBeGreaterThan(0);
    });

    it('passa a considerar a task adicionada como duplicada', async () => {
      service.addTask('Ler a documentação oficial');
      await vi.advanceTimersByTimeAsync(2000);

      expect(service.hasTask('Ler a documentação oficial')).toBe(true);
    });

    it('gera ids únicos para tasks adicionadas em sequência', async () => {
      service.addTask('Ler a documentação oficial');
      await vi.advanceTimersByTimeAsync(2000);
      service.addTask('Escrever os testes unitarios');
      await vi.advanceTimersByTimeAsync(2000);

      const ids = service.tasks().map(task => task.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('adding', () => {
    it('inicia como false', () => {
      expect(service.adding()).toBe(false);
    });

    it('fica true durante a adição e volta para false ao concluir', async () => {
      service.addTask('Ler a documentação oficial');
      expect(service.adding()).toBe(true);

      await vi.advanceTimersByTimeAsync(1999);
      expect(service.adding()).toBe(true);

      await vi.advanceTimersByTimeAsync(1);
      expect(service.adding()).toBe(false);
    });

    it('volta a ficar true em uma nova adição', async () => {
      service.addTask('Ler a documentação oficial');
      await vi.advanceTimersByTimeAsync(2000);

      service.addTask('Escrever os testes unitarios');
      expect(service.adding()).toBe(true);

      await vi.advanceTimersByTimeAsync(2000);
      expect(service.adding()).toBe(false);
    });
  });

  it('removeTask remove apenas a task informada', () => {
    service.removeTask(2);

    expect(service.tasks().map(task => task.id)).toEqual([1, 3]);
  });

  it('removeTask ignora id inexistente', () => {
    service.removeTask(999);

    expect(service.tasks().length).toBe(3);
  });

  describe('toggleTaskCompletion', () => {
    it('alterna o estado da task', () => {
      service.toggleTaskCompletion(1);
      expect(service.tasks()[0].completed).toBe(true);

      service.toggleTaskCompletion(1);
      expect(service.tasks()[0].completed).toBe(false);
    });

    it('não altera a lista quando a task não existe', () => {
      const before = service.tasks();
      service.toggleTaskCompletion(999);

      expect(service.tasks()).toEqual(before);
    });
  });
});
