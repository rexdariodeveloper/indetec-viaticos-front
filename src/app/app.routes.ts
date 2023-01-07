import { Routes } from '@angular/router';
import { ErrorComponent } from './pages/error/error.component';
import {AppGuard} from './app.guard';
import { EmpleadosComponent } from './modules/catalogos/empleados/empleados/empleados.component';
import { ForbiddenComponent } from './pages/forbidden/forbidden.component';

export const ROUTES: Routes = [{
   path: '', redirectTo: 'app', pathMatch: 'full'
  },
  {
    path: 'app', canActivate: [AppGuard],   loadChildren: './layout/layout.module#LayoutModule'
  },
  {
    path: 'alertas', canActivate: [AppGuard], loadChildren: './modules/alertas/alertas.module#AlertasModule'
  }, 
  {
    path: 'catalogos', canActivate: [AppGuard], loadChildren: './modules/catalogos/catalogos.module#CatalogosModule'
  }, 
  {
    path: 'viaticos', canActivate: [AppGuard], loadChildren: './modules/viaticos/viaticos.module#ViaticosModule'
  }, 
  {
    path: 'login', loadChildren: './pages/login/login.module#LoginModule'
  },
  {
    path: 'register', loadChildren: './pages/register/register.module#RegisterModule'
  },
  {
    path: 'error', component: ErrorComponent
  },
  {
    path: 'forbidden', component: ForbiddenComponent
  },
  {
    path: '**',    component: ErrorComponent
  }
];
