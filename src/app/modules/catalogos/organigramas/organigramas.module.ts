import 'jquery.nestable/jquery.nestable.js';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { OrganigramaComponent } from './organigrama/organigrama.component';
import { OrganigramaComponentService } from './organigrama/organigrama.service';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AlertModule, ModalModule } from 'ngx-bootstrap';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { NgSelectModule } from '@ng-select/ng-select';

const routes: Routes = [
  {
    path     : '',
    component: OrganigramaComponent,
    resolve  : {
      data: OrganigramaComponentService
    },
    runGuardsAndResolvers: 'always'
  }
];

@NgModule({
  declarations: [
    OrganigramaComponent
  ],
  imports: [
    CommonModule,
    NgxSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    AlertModule.forRoot(),
    OverlayModule,
    ModalModule.forRoot(),
    RouterModule.forChild(routes),
    NgSelectModule
  ],
  providers: [
    OrganigramaComponentService,
  ],
})
export class OrganigramasModule { }
