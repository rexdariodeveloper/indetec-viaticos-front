import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { ListadoService } from '@services/listado.service';
import { ListadoEsquema } from '@models/listado_esquema';
import { ListadoEsquemaFormato } from '@models/listado_esquema_formato';
import { ListadoPuesto } from '@models/listado_puesto';
import { ListadoPuestoService } from '@services/listado_puesto.service';
import { ListadoCargoService } from '@services/listado_cargo.service';
import { ListadoCargo } from '@models/listado_cargo';

@Injectable({
  providedIn: 'root'
})
export class ListadosComponentService implements Resolve<any>  {

  esquemas: ListadoEsquema[];
  esquemasFormato: ListadoEsquemaFormato[];
  listadoData: any[];
  listadoPuesto: ListadoPuesto[];
  listadoCargo: ListadoCargo[];

  onListadosChanged: BehaviorSubject<any>;

  constructor(
    private _listadoService: ListadoService,
    private _listadoPuestoService: ListadoPuestoService,
    private _listadoCargoService: ListadoCargoService
  ) { 
    this.onListadosChanged = new BehaviorSubject({});
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
   * Get Listados
   *
   * @returns {Promise<any>}
  */
  getListadoFicha(){
    return new Promise((resolve, reject) => {
      this._listadoService.getListadoFicha().then((response:any) =>{
        this.esquemas = response.data;
        this.onListadosChanged.next(response);
        resolve(response);
      },reject);
    });
  }

  /**
   * Get Listado Ficha
   *
   * @returns {Promise<any>}
  */
  getDatosFicha(esquemaId: any){
    return new Promise((resolve, reject) => {
      this._listadoService.getDatosFicha(esquemaId).then((response:any) =>{
        this.esquemasFormato = response.data.esquemasFormato;
        this.listadoData = response.data.listadoData;
        resolve(response);
      },reject);
    });
  }

  /**
   * Save Listado Data
   *
   * @returns {Promise<any>}
  */
  saveListadoData(data: any){
    return new Promise((resolve, reject) => {
        this._listadoService.guarda(data).then((response:any) =>{
            resolve(response);
        },reject);
    });
    
  }

  /**
   * Save Listado Puesto
   *
   * @returns {Promise<any>}
  */
  // saveListadoPuesto(data: any) : Promise<any>{
  //   return new Promise((resolve, reject) => {
  //     this._listadoPuestoService.guarda(data).then((response:any) =>{
  //         resolve(response);
  //     },reject);
  //   });
  // }

  // /**
  //  * Save Listado Cargo
  //  *
  //  * @returns {Promise<any>}
  // */
  // saveListadoCargo(data: any) : Promise<any>{
  //   return new Promise((resolve, reject) => {
  //     this._listadoCargoService.guarda(data).then((response:any) =>{
  //         resolve(response);
  //     },reject);
  //   });
  // }
}
