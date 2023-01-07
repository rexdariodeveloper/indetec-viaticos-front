import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ControlContainer, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NewWidgetModule } from 'app/layout/new-widget/widget.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxSpinnerModule } from "ngx-spinner";
import { GruposJerarquicosComponent } from './grupos_jerarquicos/grupos_jerarquicos.component';
import { GrupoJerarquicoComponent } from './grupo_jerarquico/grupo_jerarquico.component';
import { GruposJerarquicosComponentService } from './grupos_jerarquicos/grupos_jerarquicos.service';
import { GrupoJerarquicoComponentService } from './grupo_jerarquico/grupo_jerarquico.service';
import { ModalModule } from 'ngx-bootstrap';

const routes: Routes = [
  {
    path: '',
    component: GruposJerarquicosComponent,
    resolve: {
      data: GruposJerarquicosComponentService
    }
  },
  {
    path: 'nuevo',
    component: GrupoJerarquicoComponent,
    resolve: {
      data: GrupoJerarquicoComponentService
    }
  },
  {
    path: 'editar/:id',
    component: GrupoJerarquicoComponent,
    resolve: {
      data: GrupoJerarquicoComponentService
    }
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  declarations: [
    GruposJerarquicosComponent,
    GrupoJerarquicoComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    NewWidgetModule,
    NgxDatatableModule,
    NgxSpinnerModule,
    ModalModule,
  ],
  providers: [
    GruposJerarquicosComponentService,
    GrupoJerarquicoComponentService
  ]
})

export class GruposJerarquicosModule { }