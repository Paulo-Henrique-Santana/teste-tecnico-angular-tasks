import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Header {}
