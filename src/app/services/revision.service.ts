import { GenericService } from './generic.service';
import { HttpService } from './http.service';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RevisionService extends GenericService {

    URL_FICHA = '/revision';
    
    constructor(private _httpService: HttpService) { 
        super();
    }

    getListadoFicha(): Promise<any> {
        return this._httpService.get(this.URL_FICHA + GenericService.URL_LISTADO, true);
    }
    
    getDatosFicha(data: any): Promise<any> {        
        return this._httpService.post(this.URL_FICHA + GenericService.URL_DATOS_FICHA, data, true);
    }
    
    guarda(data: any): Promise<any> {
        return this._httpService.post(this.URL_FICHA + GenericService.URL_GUARDAR, data, true);
    }
    
    eliminaPorId(registroId: number): Promise<any> {
        throw new Error("Method not implemented.");
    }
}