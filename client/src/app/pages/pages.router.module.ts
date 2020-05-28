import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { HomePage } from './home/home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage
  },
  // /app/ redirect
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), HttpClientModule],
  exports: [RouterModule],
  providers: []
})
export class PagesRoutingModule {}
