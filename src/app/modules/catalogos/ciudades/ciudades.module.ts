import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { NgxSpinnerModule } from 'ngx-spinner';
import { RouterModule } from '@angular/router';

import { CiudadesComponent } from './ciudades.component';
import { NewWidgetModule } from '../../../layout/new-widget/widget.module';
import { AlertModule, ModalModule } from 'ngx-bootstrap';

import { CiudadesService } from './ciudades.service';
import { CiudadService } from '@services/ciudad.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgSelectModule } from '@ng-select/ng-select';

const routes = [
  {
    path: '',
    component: CiudadesComponent
  }
];

@NgModule({
  declarations: [
    CiudadesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    NewWidgetModule,
    NgxDatatableModule,
    NgxSpinnerModule,
    ModalModule,
    NgSelectModule,
    AlertModule.forRoot()
  ],
  providers: [
    CiudadesService,
    CiudadService
  ]
})
export class CiudadesModule { }