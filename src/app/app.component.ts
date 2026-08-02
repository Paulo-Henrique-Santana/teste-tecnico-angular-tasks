import { Component, OnInit } from '@angular/core';
import {
  DeferredScriptLoaderService,
  LEGACY_HEAVY_SCRIPT_URL
} from './core/services/deferred-script-loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private readonly deferredScriptLoader: DeferredScriptLoaderService) {}

  ngOnInit(): void {
    this.deferredScriptLoader.loadAfterAppStable(LEGACY_HEAVY_SCRIPT_URL);
  }
}
