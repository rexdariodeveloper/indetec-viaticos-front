import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NewWidgetModule } from 'app/layout/new-widget/widget.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxSpinnerModule } from "ngx-spinner";
import { RolesComponent } from './roles/roles.component';
import { RolComponent } from './rol/rol.component';
import { RolesComponentService } from './roles/roles.service';
import { RolComponentService } from './rol/rol.service';
import { TreeModule } from 'angular-tree-component';
import { TreeNgxModule } from 'tree-ngx';
import { ModalModule } from 'ngx-bootstrap';

const routes: Routes = [
  {
    path     : '',
    component: RolesComponent,
    resolve  : {
      data: RolesComponentService
    }
  },
  {
    path     : 'nuevo',
    component: RolComponent,
    resolve  : {
      data: RolComponentService
    }
  },
  {
    path     : 'editar/:id',
    component: RolComponent,
    resolve  : {
      data: RolComponentService
    }
  },
  {
    path      : '**',
    redirectTo: ''
  }
];

@NgModule({
  declarations: [
    RolesComponent,
    RolComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    NewWidgetModule,
    NgxDatatableModule,
    NgxSpinnerModule,
    TreeModule.forRoot(),
    TreeNgxModule,
    ModalModule,
  ],
  providers: [
    RolesComponentService,
    RolComponentService
  ]
})
export class RolesModule {
  // public static routes = routes;
}
