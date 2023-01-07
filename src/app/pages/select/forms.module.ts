import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ElementsComponent } from './elements/elements.component';

import { Select2Module } from 'ng2-select2';

//import "../../../../../node_modules/bootstrap-datepicker/dist/css/bootstrap-datepicker.min";
//@import "../../../../../node_modules/bootstrap-timepicker/css/bootstrap-timepicker.min";
import { NKDatetimeModule } from 'ng2-datetime/ng2-datetime';

export const routes = [
  {path: '', redirectTo: 'elements', pathMatch: 'full'},
  {path: 'elements', component: ElementsComponent}
];

@NgModule({
  declarations: [
    ElementsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    Select2Module,
    RouterModule.forChild(routes),
    NKDatetimeModule
  ]
})
export class FormModule {
  static routes = routes;
}
