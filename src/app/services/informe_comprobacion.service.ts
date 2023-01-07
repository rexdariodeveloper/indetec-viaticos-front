import { GenericService } from './generic.service';
import { HttpService } from './http.service';
import { Injectable } from '@angular/core';
import { SolicitudViaticoComprobacionDetalle } from '@models/solicitud_viatico_comprobacion_detalle';

@Injectable({ providedIn: 'root' })
export class InformeComprobacionService extends GenericService {

    URL_FICHA = '/solicitudviaticoinformecomprobacion';
    
    constructor(private _httpService: HttpService) { 
        super();
    }

    getListadoFicha(): Promise<any> {
        return this._httpService.get(this.URL_FICHA + GenericService.URL_LISTADO, true);
    }

    
    getDatosFicha(solicitudViaticoId : any): Promise<any> {        
        return this._httpService.post(this.URL_FICHA + GenericService.URL_DATOS_FICHA, JSON.stringify({solicitudViaticoId}), true);
    }
    
    guarda(data: any): Promise<any> {
        return this._httpService.post(this.URL_FICHA + GenericService.URL_GUARDAR, data, true);
    }
    
    eliminaPorId(registroId: number): Promise<any> {
        throw new Error("Method not implemented.");
    }

    buscaCompartida(solicitudViaticoComprobacionDetalle: SolicitudViaticoComprobacionDetalle): Promise<any> {
        return this._httpService.post(this.URL_FICHA + '/buscacompartida', solicitudViaticoComprobacionDetalle, true);
    }

    getListadoProveedoresAndPaises(ejercicio:number): Promise<any> {       
        return this._httpService.getRFC(this.URL_FICHA + '/listadoproveedoresandpaises',{'ejercicio':ejercicio} ,true);
    }

    getListadoProveedores(ejercicio:number): Promise<any> {
        return this._httpService.getRFC(this.URL_FICHA + '/listadoproveedores',{'ejercicio':ejercicio} , true);
    }

    searchProveedor(json:any ): Promise<any> {        
        return this._httpService.post(this.URL_FICHA + '/searchProveedor', json, true);
    }

    registerProveedor(json: any,ejercicio:number): Promise<any> {
        json.ejercicio=ejercicio;
        return this._httpService.post(this.URL_FICHA + '/registerProveedor', json, true);
    }

    getListadoCuentaConTableRM(ejercicio:number): Promise<any> {
        return this._httpService.getCtasActivasRM(this.URL_FICHA + '/listadocuentacontablerm',{'ejercicio':ejercicio} , true);
    }
}