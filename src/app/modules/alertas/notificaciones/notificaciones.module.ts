import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { NgxSpinnerModule } from 'ngx-spinner';
import { RouterModule } from '@angular/router';
import { NewWidgetModule } from '../../../layout/new-widget/widget.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NotificacionesComponent } from './notificaciones.component';
import { NotificacionesComponentService } from './notificaciones.service';
import { ButtonsModule, BsDropdownModule, ModalModule } from 'ngx-bootstrap';
import { AlertaPipe } from 'app/pipes/alerta.pipe';
import { SharedAlertasModule } from 'app/shared_modules/shared_aletras.module';

const routes = [
  {
    path     : '',
    component: NotificacionesComponent,
    resolve  : {
      data: NotificacionesComponentService
    }
  }
];

@NgModule({
  declarations: [
    NotificacionesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    NewWidgetModule,
    NgxDatatableModule,
    NgxSpinnerModule,
    ButtonsModule,
    BsDropdownModule,
    ModalModule.forRoot(),
    SharedAlertasModule
    ],
  providers: [
    NotificacionesComponentService,
  ]
})
export class NotificacionesModule { }