import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { AsignacionService } from '@services/asignacion.service';
import { AsignacionListado } from '@models/asignacion';
import * as moment from 'moment';
moment.locale('es');

@Injectable({
  providedIn: 'root'
})
export class AsignacionesComponentService implements Resolve<any> {

  asignacionListado: AsignacionListado[];

  onAsignacionesChanged: BehaviorSubject<any>;
  
  constructor(private _asignacionService: AsignacionService) {
    this.onAsignacionesChanged = new BehaviorSubject({});
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
     * Get listado de Solicitudes
     *
     * @returns {Promise<any>}
     */
  getListadoFicha(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._asignacionService.getListadoFicha().then((response: any) => {
        this.asignacionListado = response.data;
        this.onAsignacionesChanged.next(response);
        resolve(response);
      }, reject);
    });
  }  
}
