import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { AlertaConfiguracionService} from '@services/alerta_configuracion.service';
import { ComboListadoCMMProjection } from '@models/listado_cmm';
import { ConfigurarAlertaEtapaAccionProjection } from '@models/alerta_etapa_accion';
import { GenericService } from '@services/generic.service';
import { JsonResponseError } from '@models/json_response_error';
import { ComboEmpleadoProjection } from '@models/empleado';
import { FormGroup } from '@angular/forms';
import { AlertaConfiguracion, EditarAlertaConfiguracionProjection } from '@models/alerta_configuracion';

@Injectable()
export class AlertasConfiguracionComponentService implements Resolve < any > {

	routeParams: any;
	
	onError: BehaviorSubject < JsonResponseError > ;
	jsonDatosFicha: {
		etapas: ComboListadoCMMProjection[],
		empleados: ComboEmpleadoProjection[],
		figuras: ComboListadoCMMProjection[],
		tiposNotificacion: ComboListadoCMMProjection[]
	} = null;
	onDatosChanged: BehaviorSubject < boolean > ;
	
	listadoEtapaAcciones: ConfigurarAlertaEtapaAccionProjection[] = [];
	onEtapaAccionesChanged: BehaviorSubject < boolean > ;

	listadoConfiguraciones: EditarAlertaConfiguracionProjection[] = [];
	onConfiguracionesChanged: BehaviorSubject < boolean > ;

	onGuardarChanged: BehaviorSubject < boolean > ;
	
	onEliminarChanged: BehaviorSubject < boolean > ;

	constructor(
		private alertaConfiguracionService: AlertaConfiguracionService
	) {
		// Set the defaults
		this.onError = new BehaviorSubject(null);
		this.onDatosChanged = new BehaviorSubject(false);
		this.onEtapaAccionesChanged = new BehaviorSubject(false);
		this.onConfiguracionesChanged = new BehaviorSubject(false);
		this.onGuardarChanged = new BehaviorSubject(false);
		this.onEliminarChanged = new BehaviorSubject(false);
	}

	/**
	 * Resolver
	 *
	 * @param {ActivatedRouteSnapshot} route
	 * @param {RouterStateSnapshot} state
	 * @returns {Observable<any> | Promise<any> | any}
	 */
	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable < any > | Promise < any > | any {
		this.routeParams = route.params;

		return new Promise((resolve, reject) => {

			Promise.all([
			]).then(
				() => {
					resolve();
				},
				reject
			);
		});
	}

	/**
	 * Get listado
	 *
	 * @returns {Promise<any>}
	 */
	getDatosFicha(): Promise < any > {
		return new Promise((resolve, reject) => {
			this.alertaConfiguracionService.getDatosFicha().then((response: any) => {
				this.jsonDatosFicha = response.data;
				this.onDatosChanged.next(true);
				resolve(response);
			}, (reject) => {
				this.onError.next(GenericService.getError(reject));
			});
		});
	}

	buscarAccionesPorEtapa(etapaId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.alertaConfiguracionService.buscarAccionesPorEtapa(etapaId).then((response: any) => {
				this.listadoEtapaAcciones = response.data;
				this.onEtapaAccionesChanged.next(true);
				resolve(response);
			}, (reject) => {
				this.onError.next(GenericService.getError(reject));
			});
		});
	}

	buscarConfiguracionesPorEtapa(etapaId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.alertaConfiguracionService.buscarConfiguracionesPorEtapa(etapaId).then((response: any) => {
				this.listadoConfiguraciones = response.data;
				this.onConfiguracionesChanged.next(true);
				resolve(response);
			}, (reject) => {
				this.onError.next(GenericService.getError(reject));
			});
		});
	}

	guardar(configuraciones: AlertaConfiguracion[]): Promise < any > {
		return new Promise((resolve, reject) => {
			this.alertaConfiguracionService.guardaMultiple(configuraciones).then((response: any) => {
				this.onGuardarChanged.next(true);
				resolve(response);
			}, (reject) => {
				this.onError.next(GenericService.getError(reject));
			});
		});
	}

	eliminarMultiple(ids: number[]): Promise < any > {
		return new Promise((resolve, reject) => {
			this.alertaConfiguracionService.eliminaMultiplePorIds(ids).then((response: any) => {
				this.onEliminarChanged.next(true);
				resolve(response);
			}, (reject) => {
				this.onError.next(GenericService.getError(reject));
			});
		});
	}
}