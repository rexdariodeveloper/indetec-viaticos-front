import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ConceptoViaticosComponent } from './concepto_viaticos/concepto_viaticos.component';
import { ConceptoViaticosComponentService } from './concepto_viaticos/concepto_viaticos.service';
import { Select2Module } from 'ng2-select2';
import { ModalModule } from 'ngx-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';

const routes: Routes = [
  {
    path     : '',
    component: ConceptoViaticosComponent,
    resolve  : {
      data: ConceptoViaticosComponentService
    },
    runGuardsAndResolvers: 'always'
  },
];

@NgModule({
  declarations: [
    ConceptoViaticosComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgxSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    Select2Module,
    NgSelectModule,
    ModalModule.forRoot()
  ],
  providers: [
    ConceptoViaticosComponentService
  ]
})
export class ConceptoViaticosModule { }
