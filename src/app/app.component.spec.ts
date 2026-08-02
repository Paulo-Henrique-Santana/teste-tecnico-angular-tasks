import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import {
  DeferredScriptLoaderService,
  LEGACY_HEAVY_SCRIPT_URL
} from './core/services/deferred-script-loader.service';

describe('AppComponent', () => {
  let deferredScriptLoader: jasmine.SpyObj<DeferredScriptLoaderService>;

  beforeEach(async () => {
    deferredScriptLoader = jasmine.createSpyObj<DeferredScriptLoaderService>(
      'DeferredScriptLoaderService',
      ['loadAfterAppStable']
    );

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [{ provide: DeferredScriptLoaderService, useValue: deferredScriptLoader }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  it('monta header, formulário e lista', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('app-header'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('app-task-form'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('app-task-list'))).toBeTruthy();
  });

  it('adia o carregamento do script pesado para depois da inicialização', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(deferredScriptLoader.loadAfterAppStable).toHaveBeenCalledWith(LEGACY_HEAVY_SCRIPT_URL);
  });
});
