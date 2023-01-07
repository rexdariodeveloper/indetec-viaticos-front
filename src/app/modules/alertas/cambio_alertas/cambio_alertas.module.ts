import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NewWidgetModule } from 'app/layout/new-widget/widget.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxSpinnerModule } from "ngx-spinner";
import { CambioAlertasComponent } from './cambio_alertas/cambio_alertas.component';
import { CambioAlertaComponent } from './cambio_alerta/cambio_alerta.component';
import { CambioAlertasComponentService } from './cambio_alertas/cambio_alertas.service';
import { CambioAlertaComponentService } from './cambio_alerta/cambio_alerta.service';
import { TreeModule } from 'angular-tree-component';
import { TreeNgxModule } from 'tree-ngx';
import { ModalModule } from 'ngx-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';

const routes: Routes = [
  {
    path: '',
    component: CambioAlertasComponent,
    resolve: {
      data: CambioAlertasComponentService
    }
  },
  {
    path: 'nuevo',
    component: CambioAlertaComponent,
    resolve: {
      data: CambioAlertaComponentService
    }
  },
  {
    path: 'editar/:id',
    component: CambioAlertaComponent,
    resolve: {
      data: CambioAlertaComponentService
    }
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  declarations: [
    CambioAlertasComponent,
    CambioAlertaComponent
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
    NgSelectModule,
    OwlDateTimeModule, 
    OwlNativeDateTimeModule,
  ],
  providers: [
    CambioAlertasComponentService,
    CambioAlertaComponentService
  ]
})
export class CambioAlertasModule {
  // public static routes = routes;
}
