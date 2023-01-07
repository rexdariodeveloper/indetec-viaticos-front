import { GenericService } from './generic.service';
import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

@Injectable({ providedIn: 'root' })
export class CambioAlertaService extends GenericService {

    URL_FICHA: string = '/cambio_alerta';

    constructor(private _httpService: HttpService) {
        super();
    }

    getDatosFicha(cambioAlertaId: any): Promise<any> {
        let data: any;
        if (cambioAlertaId == null) {
            data = JSON.stringify({})
        } else {
            data = JSON.stringify({ cambioAlertaId });
        }

        return this._httpService.post(this.URL_FICHA + GenericService.URL_DATOS_FICHA, data, true);
    }

    getListadoFicha(): Promise<any> {
        return this._httpService.get(this.URL_FICHA + GenericService.URL_LISTADO, true);
    }

    guarda(data: any): Promise<any> {
        return this._httpService.post(this.URL_FICHA + GenericService.URL_GUARDAR, data, true);
    }

    eliminaPorId(id: number): Promise<any> {
        return this._httpService.post(this.URL_FICHA + GenericService.URL_ELIMINAR_POR_ID, { id: id }, true);
    }
}