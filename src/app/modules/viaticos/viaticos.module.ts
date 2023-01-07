import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppGuard } from 'app/app.guard';
import { RolGuard } from 'app/rol.guard';

export const routes = [
  {
      path        : 'solicitudes',
      canActivate : [AppGuard, RolGuard],
      loadChildren: './solicitudes/solicitudes.module#SolicitudesModule'
  },
  {
      path        : 'asignaciones',
      canActivate : [AppGuard, RolGuard],
      loadChildren: './asignaciones/asignaciones.module#AsignacionesModule'
  },
  {
      path        : 'informes_comprobaciones',
      canActivate : [AppGuard, RolGuard],
      loadChildren: './informes_comprobaciones/informes_comprobaciones.module#InformesComprobacionesModule'
  },
  {
    path        : 'reporte_transparencia',
    canActivate : [AppGuard, RolGuard],
    loadChildren: './reporte_transparencia/reporte_transparencia.module#ReporteTransparenciaModule'
  },
  {
      path        : 'revisiones',
      // canActivate : [AppGuard, RolGuard],
      canActivate : [AppGuard],
      loadChildren: './revisiones/revisiones.module#RevisionesModule'
  },
  {
    path        : 'pasajes_no_utilizados',
    canActivate : [AppGuard, RolGuard],
    loadChildren: './pasajes_no_utilizados/pasajes_no_utilizados.module#PasajesNoUtilizadosModule'
  },
  // {
  //   path        : 'roles',
  //   loadChildren: './roles/roles.module#RolesModule'
  // }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ]
})
export class ViaticosModule { 
  static routes = routes;
}