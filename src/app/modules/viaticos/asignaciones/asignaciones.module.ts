import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsignacionComponent } from './asignacion/asignacion.component';
import { BsModalService, ModalModule } from 'ngx-bootstrap';
import { Routes, RouterModule } from '@angular/router';
import { NgxSpinnerModule } from "ngx-spinner";
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AsignacionComponentService } from './asignacion/asignacion.service';
import { AsignacionesComponent } from './asignaciones/asignaciones.component';
import { AsignacionesComponentService } from './asignaciones/asignaciones.service';
import { TextMaskModule } from 'angular2-text-mask';
import { Select2Module } from 'ng2-select2';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '../components.module';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { UtilsModule } from 'app/layout/utils/utils.module';
import { MoneyPipe } from 'app/pipes/money.pipe';
import { CanDeactivateGuard } from '@services/can-deactivate-guard.service';

const routes: Routes = [
  {
    path     : '',
    component: AsignacionesComponent,
    resolve  : {
      data: AsignacionesComponentService
    }
  },
  {
    path     : 'asignacion-viatico/:id',
    component: AsignacionComponent,
    resolve  : {
      data: AsignacionComponentService
    },
    runGuardsAndResolvers: 'always',
    canDeactivate: [CanDeactivateGuard]
  }
];

@NgModule({
  declarations: [AsignacionComponent, AsignacionesComponent],
  imports: [
    CommonModule,
    ModalModule.forRoot(),
    NgxSpinnerModule,
    NgxDatatableModule,
    TextMaskModule,
    Select2Module,
    FormsModule,
    ReactiveFormsModule,
    ComponentsModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    RouterModule.forChild(routes),
    UtilsModule
  ],
  providers: [
    AsignacionComponentService,
    AsignacionesComponentService,
    MoneyPipe
  ]
})
export class AsignacionesModule { }
