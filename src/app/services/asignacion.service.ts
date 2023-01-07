import { GenericService } from './generic.service';
import { HttpService } from './http.service';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AsignacionService extends GenericService {

    URL_FICHA = '/asignacion';
    
    constructor(private _httpService: HttpService) { 
        super();
    }

    getListadoFicha(): Promise<any> {
        return this._httpService.get(this.URL_FICHA + GenericService.URL_LISTADO, true);
    }
    
    getDatosFicha(solicitudId: any): Promise<any> {     
        return this._httpService.post(this.URL_FICHA + GenericService.URL_DATOS_FICHA, JSON.stringify({solicitudId}), true);
    }
    
    guarda(data: any): Promise<any> {
        return this._httpService.post(this.URL_FICHA + GenericService.URL_GUARDAR, data, true);
    }
    
    eliminaPorId(registroId: number): Promise<any> {
        return this._httpService.post(this.URL_FICHA + '/removeforid', registroId, true);
    }

    enviarRevision(solicitudId: number, motivo: string): Promise<any> {
        return this._httpService.post(this.URL_FICHA + '/enviarrevision', JSON.stringify({solicitudId, motivo}), true);
    }
}