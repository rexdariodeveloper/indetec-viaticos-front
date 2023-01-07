import { GenericService } from './generic.service';
import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

@Injectable({ providedIn: 'root' })
export class PasajeUtilizadoService extends GenericService {

    URL_FICHA: string = '/pasajeUtilizado';

    constructor(private _httpService: HttpService) {
        super();
    }

    getDatosFicha(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    getListadoFicha(): Promise<any> {
        return this._httpService.get(this.URL_FICHA + GenericService.URL_LISTADO, true);
    }

    guarda(data: any): Promise<any> {
        return this._httpService.post(this.URL_FICHA + GenericService.URL_GUARDAR, data, true);
    }

    eliminaPorId(id: number): Promise<any> {
        return this._httpService.post(this.URL_FICHA + GenericService.URL_ELIMINAR_POR_ID, {id: id}, true);
    }
}