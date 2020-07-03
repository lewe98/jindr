import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home/home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage
  },
  {
    path: 'chat',
    loadChildren: () => import('./chat/chat.module').then((m) => m.ChatModule)
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./profile/profile.module').then((m) => m.ProfileModule)
  },
  {
    path: 'explore',
    loadChildren: () =>
      import('./swipe/swipe.module').then((m) => m.SwipeModule)
  },
  {
    path: 'job',
    loadChildren: () => import('./job/job.module').then((m) => m.JobModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [],
  providers: []
})
export class PagesRoutingModule {
}
