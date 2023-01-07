import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { NgxSpinnerModule } from 'ngx-spinner';
import { RouterModule } from '@angular/router';

import { EstadosComponent } from './estados.component';
import { NewWidgetModule } from '../../../layout/new-widget/widget.module';
import { AlertModule, ModalModule } from 'ngx-bootstrap';

import { EstadosService } from './estados.service';
import { EstadoService } from '@services/estado.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgSelectModule } from '@ng-select/ng-select';

const routes = [
  {
    path: '',
    component: EstadosComponent
  }
];

@NgModule({
  declarations: [
    EstadosComponent
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
    EstadosService,
    EstadoService
  ]
})
export class EstadosModule { }