import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NgxSpinnerModule } from "ngx-spinner";
import { ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgSelectModule } from '@ng-select/ng-select';

import { EmpleadoComponent } from './empleado/empleado.component';
import { EmpleadosComponent } from './empleados/empleados.component';
import { EmpleadoComponentService } from './empleado/empleado.service';
import { EmpleadosComponentService } from './empleados/empleados.service';
import { ModalModule } from 'ngx-bootstrap';
import { Select2Module } from 'ng2-select2';

import { UtilsModule } from 'app/layout/utils/utils.module';
import { TreeModule } from 'angular-tree-component';
import { TreeNgxModule } from 'tree-ngx';

const routes: Routes = [
  {
    path     : '',
    component: EmpleadosComponent,
    resolve  : {
      data: EmpleadosComponentService
    }
  },
  {
    path     : 'nuevo-empleado',
    component: EmpleadoComponent,
    resolve  : {
      data: EmpleadoComponentService
    }
  },
  {
    path     : 'editar-empleado/:id',
    component: EmpleadoComponent,
    resolve  : {
      data: EmpleadoComponentService
    },
    runGuardsAndResolvers: 'always'
  }  
];

@NgModule({
  declarations: [
    EmpleadoComponent,
    EmpleadosComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgxSpinnerModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    ModalModule.forRoot(),
    Select2Module,
    NgSelectModule,
    TreeModule.forRoot(),
    TreeNgxModule,
    UtilsModule
  ],
  providers: [
    EmpleadoComponentService,
    EmpleadosComponentService
  ],
})
export class EmpleadosModule { }
