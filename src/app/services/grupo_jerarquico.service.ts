import { GenericService } from './generic.service';
import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

@Injectable({ providedIn: 'root' })
export class GrupoJerarquicoService extends GenericService {

    URL_FICHA: string = '/grupos_jerarquicos';

    constructor(private httpService: HttpService) {
        super();
    }

    getDatosFicha(registroId: any): Promise<any> {
        let data : any = registroId === null ? JSON.stringify({}) : JSON.stringify({registroId});
        return this.httpService.post(this.URL_FICHA + GenericService.URL_DATOS_FICHA, data, true);
    }

    getListadoFicha(): Promise<any> {
        return this.httpService.get(this.URL_FICHA + GenericService.URL_LISTADO, true);
    }

    guarda(objeto: any): Promise<any> {
        return this.httpService.post(this.URL_FICHA + GenericService.URL_GUARDAR, objeto, true);
    }

    eliminaPorId(id: number): Promise<any> {
        return this.httpService.post(this.URL_FICHA + GenericService.URL_ELIMINAR_POR_ID, {id: id}, true);
    }
}