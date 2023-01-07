import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule, ModalModule } from 'ngx-bootstrap';
import { MatrizViaticosComponent } from './matriz_viaticos/matriz_viaticos.component';
import { MatrizViaticosComponentService } from './matriz_viaticos/matriz_viaticos.service';
import { TextMaskModule } from 'angular2-text-mask';
import { UtilsModule } from 'app/layout/utils/utils.module';
import { MoneyPipe } from 'app/pipes/money.pipe';

const routes: Routes = [
  {
    path     : '',
    component: MatrizViaticosComponent,
    resolve  : {
      data: MatrizViaticosComponentService
    }
  },
];

@NgModule({
  declarations: [MatrizViaticosComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgxSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    TooltipModule,
    TextMaskModule,
    ModalModule.forRoot(),
    UtilsModule
  ],
  providers: [
    MatrizViaticosComponentService,
    MoneyPipe
  ]
})
export class MatrizViaticosModule { }
