import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { SolicitudService } from '@services/solicitud.service';
import { SolicitudViatico } from '@models/solicitud_viatico';

@Injectable({ providedIn: 'root' })
export class SolicitudesComponentService implements Resolve<any>{

    solicitudes: SolicitudViatico[];
    onChanged: BehaviorSubject<any>;

    constructor(private _solicitudService: SolicitudService) {
        // Set the defaults
        this.onChanged = new BehaviorSubject({});
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        return new Promise((resolve, reject) => {

            Promise.all([
                this.getListadoSolicitudes()
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    /**
     * Get listado de Solicitudes
     *
     * @returns {Promise<any>}
     */
    getListadoSolicitudes(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._solicitudService.getListadoFicha()
                .then((response: any) => {
                    this.solicitudes = response.data;
                    this.onChanged.next(response);
                    resolve(response);
                }, reject);
        });
    }
}