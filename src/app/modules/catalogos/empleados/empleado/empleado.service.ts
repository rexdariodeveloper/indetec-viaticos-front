import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, ActivatedRoute, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { EmpleadoService } from '@services/empleado.service';

@Injectable({ providedIn: 'root' })
export class EmpleadoComponentService implements Resolve<any> {

  routeParams: any;
  jsonDatosFicha: any;
  onEmpleadoChanged: BehaviorSubject<any>;

  constructor(private _empleadoService: EmpleadoService) {
    this.onEmpleadoChanged = new BehaviorSubject({});
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
        this.getDataFicha()
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }

  getDataFicha(): Promise<any> {
    let empleadoId: any = null;

    //Si se esta editando algun registro, obtener el Id
    if (this.routeParams.id != null) {
      empleadoId = this.routeParams.id;
    }

    return new Promise((resolve, reject) => {
      this._empleadoService.getDatosFicha(empleadoId).then(
        response => {
          this.jsonDatosFicha = response.data;
          this.onEmpleadoChanged.next(response);
          resolve(response);
        }, reject);
    });
  }

  guarda(objecto: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._empleadoService.guarda(objecto).then((response: any) => {
        resolve(response);
      }, reject);
    });
  }

  remove(empleadoId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this._empleadoService.eliminaPorId(empleadoId).then((response: any) => {
        resolve(response);
      }, reject);
    });
  }
}