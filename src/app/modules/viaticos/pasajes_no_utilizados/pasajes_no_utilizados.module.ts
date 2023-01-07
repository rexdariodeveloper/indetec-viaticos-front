import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NgxSpinnerModule } from "ngx-spinner";
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { PasajesNoUtilizadosComponent } from './pasajes_no_utilizados.component';
import { PasajesNoUtilizadosComponentService } from './pasajes_no_utilizados.service';
import { ComponentsModule } from '../components.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { NewWidgetModule } from 'app/layout/new-widget/widget.module';
import { NKDatetimeModule } from 'ng2-datetime';
import { UtilsModule } from 'app/layout/utils/utils.module';

const routes: Routes = [
  {
    path: '',
    component: PasajesNoUtilizadosComponent,
    resolve: {
      data: PasajesNoUtilizadosComponentService
    },
    runGuardsAndResolvers: 'always'
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  declarations: [PasajesNoUtilizadosComponent],
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
    NgSelectModule
  ],
  providers: [
    PasajesNoUtilizadosComponentService
  ]
})

export class PasajesNoUtilizadosModule {
  static routes = routes;
}
