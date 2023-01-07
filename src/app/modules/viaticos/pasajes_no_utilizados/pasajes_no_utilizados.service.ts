import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { PasajeUtilizadoService } from '@services/pasaje_utilizado.service';
import { PasajeUtilizado } from '@models/pasaje_utilizado';

@Injectable({ providedIn: 'root' })
export class PasajesNoUtilizadosComponentService implements Resolve<any>{

    pasajes: PasajeUtilizado[];
    onChanged: BehaviorSubject<any>;

    constructor(private service: PasajeUtilizadoService) {
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
                this.getListado()
            ]).then(() => {
                resolve();
            }, reject);
        });
    }

    /**
     * Get listado
     *
     * @returns {Promise<any>}
     */
    getListado(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.service.getListadoFicha().then((response: any) => {
                this.pasajes = response.data;
                this.onChanged.next(response);
                resolve(response);
            }, reject);
        });
    }

    guarda(datos: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.service.guarda(datos)
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }
}