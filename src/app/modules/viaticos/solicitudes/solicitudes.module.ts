import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NewWidgetModule } from 'app/layout/new-widget/widget.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxSpinnerModule } from 'ngx-spinner';
import { Select2Module } from 'ng2-select2';
import { NKDatetimeModule } from 'ng2-datetime/ng2-datetime';
import { SolicitudComponent } from './solicitud/solicitud.component';
import { SolicitudComponentService } from './solicitud/solicitud.service';
import { SolicitudesComponent } from './solicitudes/solicitudes.component';
import { SolicitudesComponentService } from './solicitudes/solicitudes.service';
import { SolicitudResumenComponent } from './solicitud_resumen/solicitud_resumen.component';
import { SolicitudResumenComponentService } from './solicitud_resumen/solicitud_resumen.service';
import { ModalModule } from 'ngx-bootstrap';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { ComponentsModule } from '../components.module';
import { UtilsModule } from 'app/layout/utils/utils.module';
import { NgSelectModule } from '@ng-select/ng-select';

export const routes : Routes = [
  {
    path: '',
    component: SolicitudesComponent,
    resolve: {
      data: SolicitudesComponentService
    }
  },
  {
    path: 'nueva',
    component: SolicitudComponent,
    resolve: {
      data: SolicitudComponentService
    }
  },
  {
    path: 'editar/:id',
    component: SolicitudComponent,
    resolve: {
      data: SolicitudComponentService
    },
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'resumen/:id/:formularioCompleto',
    component: SolicitudResumenComponent,
    resolve: {
      data: SolicitudResumenComponentService
    }
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  declarations: [
    SolicitudesComponent,
    SolicitudComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    NewWidgetModule,
    NgxDatatableModule,
    NgxSpinnerModule,
    NKDatetimeModule,
    Select2Module,
    ModalModule,
    OwlDateTimeModule, 
    OwlNativeDateTimeModule,
    ComponentsModule,
    UtilsModule,
    NgSelectModule
  ],
  providers: [
    SolicitudesComponentService,
    SolicitudComponentService,
    SolicitudResumenComponentService
  ]
})
export class SolicitudesModule {
  static routes = routes;
}