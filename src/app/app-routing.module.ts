import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';

const routes: Routes = [
  {
    path: '',
    component: AppComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [{provide: LocationStrategy, useClass:  PathLocationStrategy}],
  exports: [RouterModule]
})
export class AppRoutingModule { }
