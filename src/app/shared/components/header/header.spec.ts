import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { Header } from './header';

describe('Header', () => {
  it('exibe o título da aplicação', async () => {
    await TestBed.configureTestingModule({ imports: [Header] }).compileComponents();

    const fixture = TestBed.createComponent(Header);
    await fixture.whenStable();

    expect(fixture.debugElement.query(By.css('h1')).nativeElement.textContent).toContain(
      'Task Manager'
    );
  });
});
