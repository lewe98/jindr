import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExploreComponent } from './explore/explore.component';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { RippleLoaderComponent } from './ripple-loader/ripple-loader.component';
import { SharedModule } from '../../shared/shared.module';
import { SwingModule } from 'angular2-swing';
import { SwipeCardComponent } from './swipe-card/swipe-card.component';
import { ShellModule } from '../../shell/shell.module';

const swipeRoutes: Routes = [
  {
    path: '',
    component: ExploreComponent
  }
];

@NgModule({
  declarations: [ExploreComponent, RippleLoaderComponent, SwipeCardComponent],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(swipeRoutes),
    SharedModule,
    SwingModule,
    ShellModule
  ],
  exports: [RippleLoaderComponent, SwipeCardComponent]
})
export class SwipeModule {}
