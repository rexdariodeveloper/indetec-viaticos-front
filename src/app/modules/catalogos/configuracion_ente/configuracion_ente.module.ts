import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NgxSpinnerModule } from "ngx-spinner";
import { ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgSelectModule } from '@ng-select/ng-select';

import { EnteComponent } from './ente/ente.component';
import { ConfiguracionEnteComponentService } from './ente/ente.service';
import { ModalModule } from 'ngx-bootstrap';
import { Select2Module } from 'ng2-select2';

import { UtilsModule } from 'app/layout/utils/utils.module';
import { TextMaskModule } from 'angular2-text-mask';
import { MoneyPipe } from 'app/pipes/money.pipe';

const routes: Routes = [
  {
    path     : '',
    component: EnteComponent,
    resolve  : {
      data: ConfiguracionEnteComponentService
    },
    runGuardsAndResolvers: 'always'
  }
];

@NgModule({
  declarations: [
    EnteComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgxSpinnerModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    ModalModule.forRoot(),
    Select2Module,
    NgSelectModule,
    UtilsModule,
    TextMaskModule
  ],
  providers: [
    ConfiguracionEnteComponentService,
    MoneyPipe
  ],
})
export class ConfiguracionEnteModule { }
