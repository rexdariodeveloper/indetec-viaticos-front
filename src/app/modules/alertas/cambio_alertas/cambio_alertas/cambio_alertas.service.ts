import { Injectable } from '@angular/core';
import { CambioAlertaService } from '@services/cambio_alerta.service';
import { CambioAlerta } from '@models/cambio_alerta';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class CambioAlertasComponentService implements Resolve<any>{

    cambioAlertas: CambioAlerta[];
    onChanged: BehaviorSubject<any>;

    constructor(private cambioAlertaService: CambioAlertaService) {
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
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    /**
     * Get listado
     *
     * @returns {Promise<any>}
     */
    getListado(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.cambioAlertaService.getListadoFicha()
                .then((response: any) => {
                    this.cambioAlertas = response.data;
                    this.onChanged.next(response);
                    resolve(response);
                }, reject);
        });
    }
}