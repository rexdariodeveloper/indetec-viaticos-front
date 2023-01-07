import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NgxSpinnerModule } from "ngx-spinner";
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { InformesComprobacionesComponent } from './informes_comprobaciones/informes_comprobaciones.component';
import { InformesComprobacionesComponentService } from './informes_comprobaciones/informes_comprobaciones.service';
import { InformeComprobacionComponent } from './informe_comprobacion/informe_comprobacion.component';
import { InformeComprobacionComponentService } from './informe_comprobacion/informe_comprobacion.service';
import { ComponentsModule } from '../components.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TooltipModule, AccordionModule, ModalModule } from 'ngx-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { TextMaskModule } from 'angular2-text-mask';
import { UtilsModule } from 'app/layout/utils/utils.module';
import { MoneyPipe } from 'app/pipes/money.pipe';
import { PipesModule } from '../pipes.module';

const routes: Routes = [
  {
    path     : '',
    component: InformesComprobacionesComponent,
    resolve  : {
      data: InformesComprobacionesComponentService
    },
    runGuardsAndResolvers: 'always'
  },
  {
    path     : 'informe_comprobacion/:id',
    component: InformeComprobacionComponent,
    resolve  : {
      data: InformeComprobacionComponentService
    },
    runGuardsAndResolvers: 'always'
  }
];

@NgModule({
  declarations: [InformesComprobacionesComponent, InformeComprobacionComponent],
  imports: [
    CommonModule,
    NgxSpinnerModule,
    NgxDatatableModule,
    ComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule.forRoot(),
    NgSelectModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    TextMaskModule,
    AccordionModule.forRoot(),
    ModalModule.forRoot(),
    RouterModule.forChild(routes),
    UtilsModule,
    PipesModule
  ],
  providers: [
    InformesComprobacionesComponentService,
    InformeComprobacionComponentService,
    MoneyPipe
  ]
})
export class InformesComprobacionesModule { }
