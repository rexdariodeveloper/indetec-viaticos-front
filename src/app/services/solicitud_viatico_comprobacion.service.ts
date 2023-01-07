import { GenericService } from './generic.service';
import { HttpService } from './http.service';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SolicitudViaticoComprobacionService extends GenericService {

    URL_FICHA = '/solicitudviaticocomprobacion';
    
    constructor(private _httpService: HttpService) { 
        super();
    }

    getListadoFicha(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    
    getDatosFicha(solicitudViaticoId : any): Promise<any> {        
        throw new Error("Method not implemented.");
    }
    
    guarda(data: any): Promise<any> {
        return this._httpService.post(this.URL_FICHA + GenericService.URL_GUARDAR, data, true);
    }
    
    eliminaPorId(registroId: number): Promise<any> {
        throw new Error("Method not implemented.");
    }
}