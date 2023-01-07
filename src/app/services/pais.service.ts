import { GenericService } from './generic.service';
import { HttpService } from './http.service';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PaisService extends GenericService {

    constructor(private httpService: HttpService) {
        super();
    }
    
    URL_FICHA = '/paises';

    getDatosFicha(): Promise<any> {        
        throw new Error("Method not implemented.");
    }

    getListadoFicha(): Promise<any> {   
        return this.httpService.get(this.URL_FICHA + GenericService.URL_LISTADO, true);
    }
    
    guarda(objeto: any): Promise<any> {
        return this.httpService.post(this.URL_FICHA + GenericService.URL_GUARDAR, objeto, true);
    }
    
    eliminaPorId(registroId: number): Promise<any> {
        throw new Error("Method not implemented.");
    }
}