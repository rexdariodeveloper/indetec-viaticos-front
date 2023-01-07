import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NgxSpinnerModule } from "ngx-spinner";
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ReporteTransparenciaComponent } from './reporte_transparencia.component';
import { ReporteTransparenciaComponentService } from './reporte_transparencia.service';
import { ComponentsModule } from '../components.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ModalModule, BsDropdownModule, ButtonsModule } from 'ngx-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { NewWidgetModule } from 'app/layout/new-widget/widget.module';
import { NKDatetimeModule } from 'ng2-datetime';
import { UtilsModule } from 'app/layout/utils/utils.module';

const routes: Routes = [
  {
    path: '',
    component: ReporteTransparenciaComponent,
    // resolve: {
    //   data: ReporteTransparenciaComponentService
    // }
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  declarations: [ReporteTransparenciaComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    NewWidgetModule,
    NgxDatatableModule,
    NgxSpinnerModule,
    //NKDatetimeModule,
    ModalModule,
    OwlDateTimeModule, 
    OwlNativeDateTimeModule,
    ComponentsModule,
    UtilsModule,
    NgSelectModule,
    ButtonsModule,
    BsDropdownModule
  ],
  providers: [
    ReporteTransparenciaComponentService
  ]
})

export class ReporteTransparenciaModule {
  static routes = routes;
}
