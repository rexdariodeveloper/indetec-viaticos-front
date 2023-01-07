import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { RolService } from '@services/rol.service';

@Injectable({ providedIn: 'root' })
export class RolComponentService implements Resolve<any>{
    
    routeParams : any;
    jsonDatosFicha: any;
    onRolChanged: BehaviorSubject<any>;

    constructor( private _rolService :  RolService){
        // Set the defaults
        this.onRolChanged = new BehaviorSubject({});
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
        this.routeParams = route.params;

        return new Promise((resolve, reject) => {

            Promise.all([
                this.getDatosFicha()
            ]).then(
                () => {
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
    getDatosFicha() : Promise<any>{

        let rolId : any = null;

        //Si se esta editando algun registro, obtener el Id
        if(this.routeParams.id && this.routeParams.id !== 'nuevo'){
            rolId = this.routeParams.id;
        }

        return new Promise((resolve, reject) => {
            this._rolService.getDatosFicha(rolId)
                            .then((response:any) =>{
                                this.jsonDatosFicha = response.data;
                                this.onRolChanged.next(response);
                                resolve(response);
                                },reject);
                            });
    }

    guarda(datos : any) : Promise<any>{
        return new Promise((resolve, reject) => {
            this._rolService.guarda(datos)
                            .then((response: any) => {
                                resolve(response);
                            }, reject);
        });
    }

    elimina(id: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this._rolService.eliminaPorId(id)
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }
}