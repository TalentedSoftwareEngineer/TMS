import { NgModule } from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {ClientComponent} from "./modules/client/client.component";
import {AuthLazyGuard} from "./guard/auth-lazy.guard";
import {AuthModule} from "./modules/auth/auth.module";

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'service',
    component: ClientComponent,
    canLoad: [AuthLazyGuard],
    loadChildren: () => import('./modules/client/client.module').then(m => m.ClientModule),
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, onSameUrlNavigation: 'ignore', useHash: true }), AuthModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
