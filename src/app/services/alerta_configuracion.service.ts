import { GenericService } from './generic.service';
import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { AlertaConfiguracion } from '@models/alerta_configuracion';

@Injectable({ providedIn: 'root' })
export class AlertaConfiguracionService extends GenericService {
	
	URL_FICHA: string = '/alertasconfiguraciones';
	
	URL_GUARDA_MULTIPLE: string = '/guarda/multiple';
	URL_ACCIONES_ETAPA: string = '/etapas/acciones';
	URL_CONFIGURACIONES_ETAPA: string = '/etapas/configuraciones';
	URL_ELIMINA_MULTIPLE: string = '/elimina/multiple';
	
	constructor(private httpService: HttpService) {
		super();
	}
	
	getDatosFicha(): Promise<any> {
		let data : any = JSON.stringify({});
		return this.httpService.post(this.URL_FICHA + GenericService.URL_DATOS_FICHA, data, true);
	}
	
	getListadoFicha(): Promise<any> {
		return this.httpService.get(this.URL_FICHA + GenericService.URL_LISTADO, true);
	}
	
	guarda(configuracion: AlertaConfiguracion): Promise<any> {
		return this.httpService.post(this.URL_FICHA + GenericService.URL_GUARDAR, configuracion, true);
	}

	guardaMultiple(configuraciones: AlertaConfiguracion[]): Promise<any> {
		return this.httpService.put(this.URL_FICHA + this.URL_GUARDA_MULTIPLE, configuraciones, true);
	}
	
	eliminaPorId(id: number): Promise<any> {
		return this.httpService.post(this.URL_FICHA + GenericService.URL_ELIMINAR_POR_ID, {id: id}, true);
	}

	buscarAccionesPorEtapa(etapaId: number): Promise<any> {
		let data : any = JSON.stringify({etapaId});
		return this.httpService.post(this.URL_FICHA + this.URL_ACCIONES_ETAPA, data, true);
	}

	buscarConfiguracionesPorEtapa(etapaId: number): Promise<any> {
		let data : any = JSON.stringify({etapaId});
		return this.httpService.post(this.URL_FICHA + this.URL_CONFIGURACIONES_ETAPA, data, true);
	}

	eliminaMultiplePorIds(ids: number[]): Promise<any> {
		return this.httpService.put(this.URL_FICHA + this.URL_ELIMINA_MULTIPLE, ids, true);
	}
}