import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListadosComponent } from './listados/listados.component';
import { Routes, RouterModule } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule, ModalModule} from 'ngx-bootstrap';

import { ListadosComponentService } from './listados/listados.service';
import { FiltrarListadoEsquemaFormatoVisiblePipe } from 'app/pipes/listado_esquema_formato.pipe';

const routes: Routes = [
  {
    path     : '',
    component: ListadosComponent,
    resolve  : {
      data: ListadosComponentService
    }
  },
];

@NgModule({
  declarations: [
    ListadosComponent,
    FiltrarListadoEsquemaFormatoVisiblePipe
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgxSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    TooltipModule,
    ModalModule.forRoot()
  ],
  providers: [
    ListadosComponentService
  ]
})
export class ListadosModule { }
