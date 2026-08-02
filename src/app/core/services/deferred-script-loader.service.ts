import { DOCUMENT } from '@angular/common';
import { ApplicationRef, Inject, Injectable, NgZone } from '@angular/core';
import { filter, take } from 'rxjs';

export const LEGACY_HEAVY_SCRIPT_URL = 'assets/scripts/legacy-heavy-script.js';

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void) => number;
};

@Injectable({ providedIn: 'root' })
export class DeferredScriptLoaderService {
  constructor(
    private readonly appRef: ApplicationRef,
    private readonly zone: NgZone,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  loadAfterAppStable(url: string): void {
    this.appRef.isStable
      .pipe(
        filter((isStable) => isStable),
        take(1)
      )
      .subscribe(() => {
        this.zone.runOutsideAngular(() => this.whenIdle(() => this.load(url)));
      });
  }

  private whenIdle(task: () => void): void {
    const view = this.document.defaultView as IdleWindow | null;

    if (view?.requestIdleCallback) {
      view.requestIdleCallback(task);
      return;
    }

    setTimeout(task);
  }

  private load(url: string): void {
    const view = this.document.defaultView;

    if (view?.Worker) {
      new view.Worker(url);
      return;
    }

    const script = this.document.createElement('script');
    script.src = url;
    script.async = true;
    this.document.body.appendChild(script);
  }
}
