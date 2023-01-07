import { Injectable } from '@angular/core';
import { GrupoJerarquicoService } from '@services/grupo_jerarquico.service';
import { GrupoJerarquico } from '@models/grupo_jerarquico';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class GruposJerarquicosComponentService implements Resolve<any>{

    gruposJerarquicos: GrupoJerarquico[];
    onChanged: BehaviorSubject<any>;

    constructor(private grupoService: GrupoJerarquicoService) {
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
            this.grupoService.getListadoFicha().then((response: any) => {
                this.gruposJerarquicos = response.data;
                this.onChanged.next(response);
                resolve(response);
            }, reject);
        });
    }
}