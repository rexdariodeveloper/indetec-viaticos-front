import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, ActivatedRoute, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { ConfiguracionEnteService } from '@services/configuracion_ente.service';
import { ConfiguracionEnte } from '@models/configuracion_ente';
import { Pais } from '@models/pais';
import { Estado } from '@models/estado';
import { Ciudad } from '@models/ciudad';
import { Moneda } from '@models/moneda';
import { Listado_CMM } from '@models/listado_cmm';

@Injectable({
  providedIn: 'root'
})

export class ConfiguracionEnteComponentService implements Resolve<any> {

  //ROUTE
  routeParams: any;
  configuracionEnte: ConfiguracionEnte;
  onEnteChanged: BehaviorSubject<any>;
  paises: Pais[];
  estados: Estado[];
  ciudades: Ciudad[];
  monedas: Moneda[];
  protocolos: Listado_CMM[];
  protocolosFTP: Listado_CMM[];

  constructor(
    private _configuracionEnteService : ConfiguracionEnteService,
    ){
    this.onEnteChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
  {
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
    //Como solo debe existir un solo ente por base, nos traemos el único registro que debe existi
    return new Promise((resolve, reject) => {
      this._configuracionEnteService.getDatosFicha(null).then((response:any) =>{
        this.configuracionEnte = response.data.ente;
        this.paises = response.data.paises;
        this.estados = response.data.estados;
        this.ciudades = response.data.ciudades;
        this.monedas = response.data.monedas;
        this.protocolos = response.data.protocolos;
        this.protocolosFTP = response.data.protocolosFTP;
        this.onEnteChanged.next(response);
        resolve(response);
      }, reject);
    });
  }

  /**
   * Este es funcion para guardar el empleado y el usuario
   * @param data
   * @returns {Promise<any>}
   */
  guarda(objecto: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._configuracionEnteService.guarda(objecto).then((response: any) => {
        resolve(response);
      }, reject);
    });
  }

  remove(empleadoId: number){
    return new Promise((resolve, reject) => {
      this._configuracionEnteService.eliminaPorId(empleadoId).then((response: any) => {
        resolve(response);
      }, reject);
    });
  }
 

}


// export class EmpleadoService extends GenericService {
  
//   URL_FICHA = 'empleado';
//   // constructor(
//   //   private httpService: HttpService
//   // ) { }

//   guarda(): Promise<any>{
//     return 
//   };
//   eliminaPorId(): Promise<any>{
//     return
//   };
//   getDatosFicha(): Promise<any>{
//     return
//   };
//     //Que raro a mi si funciona sin generic
//   /**
//      * Este es funcion para guardar el empleado y el usuario
//      * @param data
//      * @returns {Promise<any>}
//      */   

// }
