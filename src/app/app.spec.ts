import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { App } from './app';
import {
  DeferredScriptLoader,
  LEGACY_HEAVY_SCRIPT_URL
} from './core/services/deferred-script-loader';

describe('App', () => {
  let loadAfterAppStable: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    loadAfterAppStable = vi.fn().mockResolvedValue(undefined);

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: DeferredScriptLoader, useValue: { loadAfterAppStable } }]
    }).compileComponents();
  });

  it('monta header, formulário e lista', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(fixture.debugElement.query(By.css('app-header'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('main app-task-form'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('main app-task-list'))).toBeTruthy();
  });


  it('adia o carregamento do script pesado para depois da inicialização', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(loadAfterAppStable).toHaveBeenCalledWith(LEGACY_HEAVY_SCRIPT_URL);
  });
});
