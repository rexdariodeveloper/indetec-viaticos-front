import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { ConceptoViaticoService } from '@services/concepto_viatico.service';
import { ConceptoViatico } from '@models/concepto_viatico';

@Injectable({
  providedIn: 'root'
})
export class ConceptoViaticosComponentService implements Resolve<any>  {

    conceptoViaticos: ConceptoViatico[];
    objetoGasto: any[];

    onViaticosChanged: BehaviorSubject<any>;

    constructor(
        private _conceptoViaticoService: ConceptoViaticoService,
    ) { 
        this.onViaticosChanged = new BehaviorSubject({});
    }
  

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
  {
    return new Promise((resolve, reject) => {
        Promise.all([
            this.getDataFicha()
        ]).then(() => {
            resolve();
        },reject);
    });
  }

  getDataFicha(): Promise<any> {
    return new Promise((resolve, reject) => {
        this._conceptoViaticoService.getDatosFicha(null).then((response:any) =>{
            this.conceptoViaticos = response.data.viaticos;
            this.objetoGasto = response.data.objetoGasto;
            this.onViaticosChanged.next(response);
            resolve(response);
        }, reject);
    });
  }

  /**
   * Save Conceptos Viaticos
   *
   * @returns {Promise<any>}
  */
  save(data: any) : Promise<any>{
    return new Promise((resolve, reject) => {
      this._conceptoViaticoService.guarda(data).then((response:any) =>{
          resolve(response);
      },reject);
    });
  }

}
