import { Injectable } from '@angular/core';
import { RolService } from '@services/rol.service';
import { Rol } from '@models/rol';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RolesComponentService implements Resolve<any>{

    roles: Rol[];
    onRolesChanged: BehaviorSubject<any>;

    constructor( private _rolService : RolService){

      // Set the defaults
      this.onRolesChanged = new BehaviorSubject({});
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
        return new Promise((resolve, reject) => {

            Promise.all([
                this.getListadoRoles()
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    /**
     * Get listado de Roles
     *
     * @returns {Promise<any>}
     */
    getListadoRoles() : Promise<any>{
      return new Promise((resolve, reject) => {
        this._rolService.getListadoFicha()
                        .then((response:any) =>{
                            this.roles = response.data;
                            this.onRolesChanged.next(response);
                            resolve(response);
                          },reject);
                        });
    }

}