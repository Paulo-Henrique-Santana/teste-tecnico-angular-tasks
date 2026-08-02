import { TestBed } from '@angular/core/testing';

import { TaskStore } from './task-store';

describe('TaskStore', () => {
  let store: TaskStore;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    store = TestBed.inject(TaskStore);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('expõe as 3 tasks pré-carregadas na inicialização', () => {
    expect(store.tasks().map(task => task.title)).toEqual([
      'Estudar',
      'Fazer compras',
      'Praticar exercícios'
    ]);
  });

  describe('hasTask', () => {
    it('encontra a task ignorando caixa e espaços', () => {
      expect(store.hasTask('  estudar ')).toBe(true);
    });

    it('encontra a task ignorando o sufixo adicionado pela api', () => {
      expect(store.hasTask('Estudar_INFO_API_INFO_API')).toBe(true);
    });

    it('retorna false para título inexistente', () => {
      expect(store.hasTask('Ler documentação')).toBe(false);
    });
  });

  describe('addTask', () => {
    it('resolve as duas chamadas de api em paralelo (2s no total)', async () => {
      store.addTask('Ler a documentação oficial');

      await vi.advanceTimersByTimeAsync(1999);
      expect(store.tasks().length).toBe(3);

      await vi.advanceTimersByTimeAsync(1);
      expect(store.tasks().length).toBe(4);
    });

    it('publica a task com as informações das duas apis', async () => {
      store.addTask('Ler a documentação oficial');
      await vi.advanceTimersByTimeAsync(2000);

      const added = store.tasks()[3];
      expect(added.title).toBe('Ler a documentação oficial_INFO_API_INFO_API');
      expect(added.completed).toBe(false);
      expect(added.id).toBeGreaterThan(0);
    });

    it('passa a considerar a task adicionada como duplicada', async () => {
      store.addTask('Ler a documentação oficial');
      await vi.advanceTimersByTimeAsync(2000);

      expect(store.hasTask('Ler a documentação oficial')).toBe(true);
    });

    it('gera ids únicos para tasks adicionadas em sequência', async () => {
      store.addTask('Ler a documentação oficial');
      await vi.advanceTimersByTimeAsync(2000);
      store.addTask('Escrever os testes unitarios');
      await vi.advanceTimersByTimeAsync(2000);

      const ids = store.tasks().map(task => task.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('adding', () => {
    it('inicia como false', () => {
      expect(store.adding()).toBe(false);
    });

    it('fica true durante a adição e volta para false ao concluir', async () => {
      store.addTask('Ler a documentação oficial');
      expect(store.adding()).toBe(true);

      await vi.advanceTimersByTimeAsync(1999);
      expect(store.adding()).toBe(true);

      await vi.advanceTimersByTimeAsync(1);
      expect(store.adding()).toBe(false);
    });

    it('volta a ficar true em uma nova adição', async () => {
      store.addTask('Ler a documentação oficial');
      await vi.advanceTimersByTimeAsync(2000);

      store.addTask('Escrever os testes unitarios');
      expect(store.adding()).toBe(true);

      await vi.advanceTimersByTimeAsync(2000);
      expect(store.adding()).toBe(false);
    });
  });

  it('removeTask remove apenas a task informada', () => {
    store.removeTask(2);

    expect(store.tasks().map(task => task.id)).toEqual([1, 3]);
  });

  it('removeTask ignora id inexistente', () => {
    store.removeTask(999);

    expect(store.tasks().length).toBe(3);
  });

  describe('toggleTaskCompletion', () => {
    it('alterna o estado da task', () => {
      store.toggleTaskCompletion(1);
      expect(store.tasks()[0].completed).toBe(true);

      store.toggleTaskCompletion(1);
      expect(store.tasks()[0].completed).toBe(false);
    });

    it('não altera a lista quando a task não existe', () => {
      const before = store.tasks();
      store.toggleTaskCompletion(999);

      expect(store.tasks()).toEqual(before);
    });
  });
});
