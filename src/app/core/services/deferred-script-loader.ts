import { ApplicationRef, DOCUMENT, Injectable, inject } from '@angular/core';

export const LEGACY_HEAVY_SCRIPT_URL = 'assets/scripts/legacy-heavy-script.js';

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void) => number;
};

@Injectable({ providedIn: 'root' })
export class DeferredScriptLoader {
  private readonly appRef = inject(ApplicationRef);
  private readonly document = inject(DOCUMENT);

  private readonly requested = new Set<string>();

  async loadAfterAppStable(url: string): Promise<void> {
    if (this.requested.has(url)) {
      return;
    }
    this.requested.add(url);

    await this.appRef.whenStable();
    this.whenIdle(() => this.load(url));
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
