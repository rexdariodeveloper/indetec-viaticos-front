import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RolGuard } from 'app/rol.guard';
import { AppGuard } from 'app/app.guard';

const routes = [
  {
    path        : 'empleados',
    canActivate : [AppGuard, RolGuard],
    loadChildren: './empleados/empleados.module#EmpleadosModule'    
  },
  {
    path: 'organigramas',
    canActivate : [AppGuard, RolGuard],
    loadChildren: './organigramas/organigramas.module#OrganigramasModule'
  },
  {
    path        : 'roles',
    canActivate : [AppGuard, RolGuard],
    loadChildren: './roles/roles.module#RolesModule'
  },
  {
    path        : 'configuracion_ente',
    canActivate : [AppGuard, RolGuard],
    loadChildren: './configuracion_ente/configuracion_ente.module#ConfiguracionEnteModule'
  },
  {
    path: 'listados',
    canActivate : [AppGuard, RolGuard],
    loadChildren: './listados/listados.module#ListadosModule'
  },
  {
    path: 'paises',
    canActivate : [AppGuard, RolGuard],
    loadChildren: './paises/paises.module#PaisesModule'
  },
  {
    path: 'estados',
    canActivate : [AppGuard, RolGuard],
    loadChildren: './estados/estados.module#EstadosModule'
  },
  {
    path: 'ciudades',
    canActivate : [AppGuard, RolGuard],
    loadChildren: './ciudades/ciudades.module#CiudadesModule'
  },
  {
    path: 'conceptos_viaticos',
    canActivate : [AppGuard, RolGuard],
    loadChildren: './concepto_viaticos/concepto_viaticos.module#ConceptoViaticosModule'
  },
  {
    path: 'grupos_jerarquicos',
    canActivate : [AppGuard, RolGuard],
    loadChildren: './grupos_jerarquicos/grupos_jerarquicos.module#GruposJerarquicosModule'
  },
  {
    path: 'matriz_viaticos',
    canActivate : [AppGuard, RolGuard],
    loadChildren: './matriz_viaticos/matriz_viaticos.module#MatrizViaticosModule'
  }
];


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class CatalogosModule { }

// import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';

// import { EmpleadosModule } from './empleados/empleados.module';
// import { RolesModule } from './roles/roles.module';

// @NgModule({
//   declarations: [],
//   imports: [
//     CommonModule,
//     EmpleadosModule,
//     RolesModule
//   ]
// })
// export class CatalogosModule { }