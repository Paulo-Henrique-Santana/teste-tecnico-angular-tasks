import { ApplicationRef, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DeferredScriptLoaderService } from './deferred-script-loader.service';

describe('DeferredScriptLoaderService', () => {
  const url = 'assets/scripts/legacy-heavy-script.js';

  let isStable: BehaviorSubject<boolean>;
  let workerSpy: jasmine.Spy;
  let appendChildSpy: jasmine.Spy;
  let createdScript: HTMLScriptElement;
  let view: any;

  function createService(): DeferredScriptLoaderService {
    isStable = new BehaviorSubject<boolean>(false);
    workerSpy = jasmine.createSpy('Worker');
    appendChildSpy = jasmine.createSpy('appendChild');
    createdScript = document.createElement('script');

    view = {
      requestIdleCallback: (callback: () => void) => callback(),
      Worker: workerSpy
    };

    const documentStub = {
      defaultView: view,
      createElement: () => createdScript,
      body: { appendChild: appendChildSpy }
    } as unknown as Document;

    return new DeferredScriptLoaderService(
      { isStable } as unknown as ApplicationRef,
      new NgZone({ enableLongStackTrace: false }),
      documentStub
    );
  }

  it('não carrega o script enquanto a aplicação não estiver estável', () => {
    const service = createService();

    service.loadAfterAppStable(url);

    expect(workerSpy).not.toHaveBeenCalled();
    expect(appendChildSpy).not.toHaveBeenCalled();
  });

  it('carrega o script em um worker depois que a aplicação fica estável', () => {
    const service = createService();

    service.loadAfterAppStable(url);
    isStable.next(true);

    expect(workerSpy).toHaveBeenCalledWith(url);
    expect(appendChildSpy).not.toHaveBeenCalled();
  });

  it('carrega o script apenas uma vez', () => {
    const service = createService();

    service.loadAfterAppStable(url);
    isStable.next(true);
    isStable.next(false);
    isStable.next(true);

    expect(workerSpy).toHaveBeenCalledTimes(1);
  });

  it('usa tag script assíncrona quando não há suporte a worker', () => {
    const service = createService();
    view.Worker = undefined;

    service.loadAfterAppStable(url);
    isStable.next(true);

    expect(appendChildSpy).toHaveBeenCalledWith(createdScript);
    expect(createdScript.async).toBeTrue();
    expect(createdScript.getAttribute('src')).toBe(url);
  });

  it('agenda com setTimeout quando requestIdleCallback não existe', (done) => {
    const service = createService();
    view.requestIdleCallback = undefined;

    service.loadAfterAppStable(url);
    isStable.next(true);

    expect(workerSpy).not.toHaveBeenCalled();

    setTimeout(() => {
      expect(workerSpy).toHaveBeenCalledWith(url);
      done();
    });
  });
});
