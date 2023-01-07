import { AppGuard } from 'app/app.guard';
import { RolGuard } from 'app/rol.guard';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export const routes = [
	{
		path        : 'configuracion',
		canActivate : [AppGuard, RolGuard],
		loadChildren: './configuracion/configuracion.module#AlertasConfiguracionModule'
	},
	{
		path        : 'notificaciones',
		canActivate : [AppGuard, RolGuard],
		loadChildren: './notificaciones/notificaciones.module#NotificacionesModule'
	},
	{
		path        : 'cambio_alertas',
		canActivate : [AppGuard, RolGuard],
		loadChildren: './cambio_alertas/cambio_alertas.module#CambioAlertasModule'
	},
];

@NgModule({
	declarations: [],
	imports: [
		CommonModule,
		RouterModule.forChild(routes),
	]
})
export class AlertasModule { 
	static routes = routes;
}