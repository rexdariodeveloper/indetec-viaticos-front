import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { InformeComprobacionService } from '@services/informe_comprobacion.service';
import { ListadoSolicitudViaticoInformeComprobacion } from '@models/solicitud_viatico_informe_comprobacion';

@Injectable({
  providedIn: 'root'
})
export class InformesComprobacionesComponentService implements Resolve<any> {

    listadoSolicitudViaticoInformeComprobacion: ListadoSolicitudViaticoInformeComprobacion[] = [];

    onInformesComprobacionesChanged: BehaviorSubject<any>;
    
    constructor(private _informeComprobacionService: InformeComprobacionService) {
        this.onInformesComprobacionesChanged = new BehaviorSubject({});
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.getListadoFicha()
            ]).then(() => {
                resolve();
            },reject);
        });
    }

    /**
     * Get listado de Solicitud Viatico Informe y Comprobacion
     *
     * @returns {Promise<any>}
     */
    getListadoFicha(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._informeComprobacionService.getListadoFicha().then((response: any) => {
                this.listadoSolicitudViaticoInformeComprobacion = response.data;
                this.onInformesComprobacionesChanged.next(response);
                resolve(response);
            }, reject);
        });
    }
}
