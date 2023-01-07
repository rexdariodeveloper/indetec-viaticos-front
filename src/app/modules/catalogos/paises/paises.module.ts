import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { NgxSpinnerModule } from 'ngx-spinner';
import { RouterModule } from '@angular/router';

import { PaisesComponent } from './paises.component';
import { NewWidgetModule } from '../../../layout/new-widget/widget.module';
import { AlertModule, ModalModule } from 'ngx-bootstrap';

import { PaisesService } from './paises.service';
import { PaisService } from '@services/pais.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CanDeactivateGuard } from '@services/can-deactivate-guard.service';

const routes = [
  {
    path: '',
    component: PaisesComponent,
    canDeactivate: [CanDeactivateGuard]
  }
];

@NgModule({
  declarations: [
    PaisesComponent
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
    AlertModule.forRoot()
  ],
  providers: [
    PaisesService,
    PaisService
  ]
})
export class PaisesModule { }