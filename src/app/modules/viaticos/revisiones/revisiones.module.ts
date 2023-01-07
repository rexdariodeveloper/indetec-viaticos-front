import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { RevisionesComponent } from './revisiones/revisiones.component';
import { RevisionesComponentService } from './revisiones/revisiones.service';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { RevisionComponent } from './revision/revision.component';
import { RevisionComponentService } from './revision/revision.service';
import { ComponentsModule } from '../components.module';
import { LiveTileModule } from '../../../components/tile/tile.module';
import { BsDropdownModule, ModalModule, TooltipModule } from 'ngx-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../pipes.module';
import { UtilsModule } from 'app/layout/utils/utils.module';
import { FechaPipe } from 'app/pipes/fecha.pipe';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';

//Changes Memo Accordion
import { AccordionModule } from 'ngx-bootstrap';
import { MoneyPipe } from 'app/pipes/money.pipe';

const routes: Routes = [
  {
    path     : '',
    component: RevisionesComponent,
    resolve  : {
      data: RevisionesComponentService
    },
    runGuardsAndResolvers: 'always'
  },
  {
    path     : 'revision/:id',
    component: RevisionComponent,
    resolve  : {
      data: RevisionComponentService
    },
    runGuardsAndResolvers: 'always'
  }
  
];

@NgModule({
  declarations: [RevisionesComponent, RevisionComponent],
  imports: [
    CommonModule,
    NgxSpinnerModule,
    NgxDatatableModule,
    ComponentsModule,
    LiveTileModule,
    BsDropdownModule.forRoot(), 
    RouterModule.forChild(routes),
    AccordionModule.forRoot(), //Changes Memo Accordion
    ModalModule,
    ReactiveFormsModule,
    FormsModule,
    TooltipModule.forRoot(),
    PipesModule,
    UtilsModule,
    OwlDateTimeModule, 
    OwlNativeDateTimeModule,
    PipesModule //Changes Memo
  ],
  providers: [
    RevisionesComponentService,
    RevisionComponentService,
    FechaPipe,
    MoneyPipe //Changes Memo
  ]
})
export class RevisionesModule { }
