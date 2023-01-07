import { AlertasConfiguracionComponent } from './configuracion/configuracion.component';
import { AlertasConfiguracionComponentService } from './configuracion/configuracion.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NewWidgetModule } from 'app/layout/new-widget/widget.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { Select2Module } from 'ng2-select2';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FiltrarConfiguracionesEstatusPipe } from './configuracion/pipes/filtrar_configuraciones_estatus.pipe';
import { GetCheckedPipe } from './configuracion/pipes/get_checked.pipe';
import { ModalModule } from 'ngx-bootstrap';

export const routes = [
	{
		path: '',
		component: AlertasConfiguracionComponent,
		resolve: {
			data: AlertasConfiguracionComponentService
		}
	},
	{
		path: '**',
		redirectTo: ''
	}
];

@NgModule({
	declarations: [
		AlertasConfiguracionComponent,
		FiltrarConfiguracionesEstatusPipe,
		GetCheckedPipe
	],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		FormsModule,
		RouterModule.forChild(routes),
		NewWidgetModule,
		NgxSpinnerModule,
		Select2Module,
		NgSelectModule,
		NgxDatatableModule,
		ModalModule.forRoot()
		// NKDatetimeModule,
		// Select2Module,
		// ModalModule,
		// OwlDateTimeModule, 
		// OwlNativeDateTimeModule
	],
	providers: [
		AlertasConfiguracionComponentService
	]
})
export class AlertasConfiguracionModule {
	static routes = routes;
}