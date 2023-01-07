import { Injectable } from '@angular/core';
import { GenericService } from '@services/generic.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Empleado } from '@models/empleado';
import { EmpleadoService } from '@services/empleado.service';

@Injectable({
  providedIn: 'root'
})
export class EmpleadosComponentService implements Resolve<any> {

  empleados: Empleado[];

  onEmpleadosChanged: BehaviorSubject<any>;
  
  constructor(private _empleadosService: EmpleadoService) {
    this.onEmpleadosChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
  {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.getEmpleados()
      ]).then(() => {
          resolve();
      },reject);
    });
  }

  getEmpleados(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._empleadosService.getListadoFicha().then((response:any) =>{
        this.empleados = response.data;
        this.onEmpleadosChanged.next(response);
        resolve(response);
      },reject);
    });
  } 
}
