import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { MatrizViaticoService } from '@services/matriz_viatico.service';
import { GrupoJerarquico } from '@models/grupo_jerarquico';
import { MatrizViatico } from '@models/matriz_viatico';
import { Listado_CMM } from '@models/listado_cmm';
import { ConceptoViatico } from '@models/concepto_viatico';

@Injectable({
  providedIn: 'root'
})
export class MatrizViaticosComponentService implements Resolve<any>  {

    matrizViatico: MatrizViatico[];
    grupoJerarquico: GrupoJerarquico[];
    zonas: Listado_CMM[];
    viaticos: ConceptoViatico[];

    onMatrizViaticosChanged: BehaviorSubject<any>;

    constructor(
        private _matrizViatico: MatrizViaticoService,
    ) { 
        this.onMatrizViaticosChanged = new BehaviorSubject({});
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

    getListadoFicha(){
        return new Promise((resolve, reject) => {
            this._matrizViatico.getListadoFicha().then((response:any) =>{
                this.grupoJerarquico = response.data;
                this.onMatrizViaticosChanged.next(response);
                resolve(response);
            },reject);
        });
    }

    getDatosFicha(data: any){
        return new Promise((resolve, reject) => {
            this._matrizViatico.getDatosFicha(data).then((response:any) =>{
                this.matrizViatico = response.data.matrizViatico;
                this.zonas = response.data.zonas;
                this.viaticos = response.data.viaticos;

                resolve(response);
            },reject);
        });
    }

    saveViaticos(data: any){
        return new Promise((resolve, reject) => {
            this._matrizViatico.guarda(data).then((response:any) =>{
                this.matrizViatico = response.data;
                resolve(response);
            },reject);
        });
        
    }
}
