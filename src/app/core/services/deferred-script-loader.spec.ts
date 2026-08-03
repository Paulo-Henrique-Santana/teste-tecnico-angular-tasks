import { ApplicationRef, DOCUMENT, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { DeferredScriptLoader } from './deferred-script-loader';

describe('DeferredScriptLoader', () => {
  const url = 'assets/scripts/legacy-heavy-script.js';

  let stable: { promise: Promise<void>; resolve: () => void };
  let worker: ReturnType<typeof vi.fn>;
  let appendChild: ReturnType<typeof vi.fn>;
  let createdScript: HTMLScriptElement;
  let view: { requestIdleCallback?: (callback: () => void) => number; Worker?: unknown };

  function createLoader(platformId: string = 'browser'): DeferredScriptLoader {
    let resolveStable = () => {};
    const promise = new Promise<void>(resolve => (resolveStable = resolve));
    stable = { promise, resolve: () => resolveStable() };

    worker = vi.fn();
    appendChild = vi.fn();
    createdScript = document.createElement('script');

    view = {
      requestIdleCallback: (callback: () => void) => {
        callback();
        return 1;
      },
      Worker: worker
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: platformId },
        { provide: ApplicationRef, useValue: { whenStable: () => stable.promise } },
        {
          provide: DOCUMENT,
          useValue: {
            defaultView: view,
            createElement: () => createdScript,
            body: { appendChild }
          }
        }
      ]
    });

    return TestBed.inject(DeferredScriptLoader);
  }

  it('não carrega o script no servidor (SSG/SSR)', async () => {
    const loader = createLoader('server');

    await loader.loadAfterAppStable(url);

    expect(worker).not.toHaveBeenCalled();
    expect(appendChild).not.toHaveBeenCalled();
  });

  it('não carrega o script enquanto a aplicação não estiver estável', async () => {
    const loader = createLoader();

    void loader.loadAfterAppStable(url);
    await Promise.resolve();

    expect(worker).not.toHaveBeenCalled();
    expect(appendChild).not.toHaveBeenCalled();
  });

  it('carrega o script em um worker depois que a aplicação fica estável', async () => {
    const loader = createLoader();

    const loading = loader.loadAfterAppStable(url);
    stable.resolve();
    await loading;

    expect(worker).toHaveBeenCalledWith(url);
    expect(appendChild).not.toHaveBeenCalled();
  });

  it('carrega o script apenas uma vez', async () => {
    const loader = createLoader();

    const first = loader.loadAfterAppStable(url);
    const second = loader.loadAfterAppStable(url);
    stable.resolve();
    await Promise.all([first, second]);

    expect(worker).toHaveBeenCalledTimes(1);
  });

  it('usa tag script assíncrona quando não há suporte a worker', async () => {
    const loader = createLoader();
    view.Worker = undefined;

    const loading = loader.loadAfterAppStable(url);
    stable.resolve();
    await loading;

    expect(appendChild).toHaveBeenCalledWith(createdScript);
    expect(createdScript.async).toBe(true);
    expect(createdScript.getAttribute('src')).toBe(url);
  });

  it('agenda com setTimeout quando requestIdleCallback não existe', async () => {
    vi.useFakeTimers();
    const loader = createLoader();
    view.requestIdleCallback = undefined;

    const loading = loader.loadAfterAppStable(url);
    stable.resolve();
    await loading;

    expect(worker).not.toHaveBeenCalled();

    await vi.runAllTimersAsync();
    expect(worker).toHaveBeenCalledWith(url);
    vi.useRealTimers();
  });
});
