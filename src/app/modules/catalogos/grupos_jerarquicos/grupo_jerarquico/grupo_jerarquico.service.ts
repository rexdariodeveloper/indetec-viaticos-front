import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { GrupoJerarquicoService } from '@services/grupo_jerarquico.service';

@Injectable({ providedIn: 'root' })
export class GrupoJerarquicoComponentService implements Resolve<any>{

    routeParams: any;
    jsonDatosFicha: any;
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
        this.routeParams = route.params;

        return new Promise((resolve, reject) => {

            Promise.all([
                this.getDatosFicha()
            ]).then(() => {
                    resolve();
                },
                reject
            );
        });
    }

    /**
     * Obtener datos generales para el funcionamiento de la Ficha
     *
     * @returns {Promise<any>}
     */
    getDatosFicha(): Promise<any> {

        let grupoJerarquicoId: any = null;

        //Si se esta editando algun registro, obtener el Id
        if (this.routeParams.id && this.routeParams.id !== 'nuevo') {
            grupoJerarquicoId = this.routeParams.id;
        }

        return new Promise((resolve, reject) => {
            this.grupoService.getDatosFicha(grupoJerarquicoId)
                .then((response: any) => {
                    this.jsonDatosFicha = response.data;
                    this.onChanged.next(response);
                    resolve(response);
                }, reject);
        });
    }

    guarda(datos: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.grupoService.guarda(datos)
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    elimina(id: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this.grupoService.eliminaPorId(id)
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }
}