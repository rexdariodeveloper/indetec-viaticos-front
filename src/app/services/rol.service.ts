import { GenericService } from './generic.service';
import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

@Injectable({ providedIn: 'root' })
export class RolService extends GenericService{

    URL_FICHA: string = '/rol';    

    constructor( private _httpService : HttpService){
        super();
    }
    
    getDatosFicha(rolId : any): Promise<any> {
        let data : any;
        if(rolId === null){
            data = JSON.stringify({})
        }
        else{
            data = JSON.stringify({rolId});
        }

        return this._httpService.post(this.URL_FICHA + GenericService.URL_DATOS_FICHA, data, true);
    }

    getListadoFicha() : Promise<any>{
        return this._httpService.get(this.URL_FICHA + GenericService.URL_LISTADO, true);
    }

    guarda(data: any): Promise<any> {
        return this._httpService.post(this.URL_FICHA + GenericService.URL_GUARDAR, data, true);
    }
    
    eliminaPorId(id: number): Promise<any> {
        return this._httpService.post(this.URL_FICHA + GenericService.URL_ELIMINAR_POR_ID, {id: id}, true);
    }
}