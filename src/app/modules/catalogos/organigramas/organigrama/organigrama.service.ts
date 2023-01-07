import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { OrganigramaService } from '@services/organigrama.service';
import { Organigrama } from '@models/organigrama';
import { Empleado } from '@models/empleado';

@Injectable({
  providedIn: 'root'
})
export class OrganigramaComponentService implements Resolve<any> {

  organigrama: Organigrama[];
  empleados: Empleado[];
  onOrganigramaChanged: BehaviorSubject<any>;


  constructor(private _organigramaService: OrganigramaService) {
    this.onOrganigramaChanged = new BehaviorSubject({});
   }


  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
  {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.getDataOrganigrama()
      ]).then(() => {
        resolve();
      },reject);
    });
  }

  /**
   * Get Data Organigrama
   *
   * @returns {Promise<any>}
  */
  getDataOrganigrama() : Promise<any>{
    return new Promise((resolve, reject) => {
      this._organigramaService.getListadoFicha().then((response:any) =>{
        //console.log(response);
        this.organigrama = response.data.organigramas;
        this.empleados = response.data.empleados;
        this.onOrganigramaChanged.next(response);
        resolve(response);
      },reject);
    });
  }

  /**
   * Save Organigrama
   *
   * @returns {Promise<any>}
  */
  saveOrganigrama(data: any) : Promise<any>{
    return new Promise((resolve, reject) => {
      this._organigramaService.guarda(data).then((response:any) =>{
        resolve(response);
      },reject);
    });
  }

}
