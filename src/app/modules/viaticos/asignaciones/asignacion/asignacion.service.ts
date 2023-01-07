import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { AsignacionService } from '@services/asignacion.service';
import { ToastrService } from 'ngx-toastr';
import { GenericService } from '@services/generic.service';
import { Asignacion } from '@models/asignacion';
import { AsignacionViatico } from '@models/AsignacionViatico';
import { ConceptoViatico } from '@models/concepto_viatico';
import { MatrizViatico } from '@models/matriz_viatico';
import { SolicitudViatico } from '@models/solicitud_viatico';
import { Listado_CMM } from '@models/listado_cmm';
import { AsignacionPasaje } from '@models/asignacionPasaje';
import { AlertaService } from '@services/alerta.service';

@Injectable({
  providedIn: 'root'
})
export class AsignacionComponentService implements Resolve<any> {

  routeParams: any;
  solicitudViatico: SolicitudViatico;
  asignacion: Asignacion;
  asignacionViatico: AsignacionViatico[] = [];
  conceptoViatico: ConceptoViatico[] = [];
  matrizViatico: MatrizViatico[] = [];

  //Registro de pasaje
  asignacionPasaje: AsignacionPasaje[] = [];
  tipoPasaje: Listado_CMM[];
  onAsignacionChanged: BehaviorSubject<any>;

  constructor(
    private _asignacionService: AsignacionService,
    private _toastr: ToastrService,
    private router: Router
  ) {
    this.onAsignacionChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    this.routeParams = route.params;
    return new Promise((resolve, reject) => {
      Promise.all([
        this.getDatosFicha()
      ]).then(() => {
        resolve();
      }, reject);
    });
  }

  /**
   * Obtener datos generales para el funcionamiento de la Ficha
   *
   * @returns {Promise<any>}
   */
  getDatosFicha(): Promise<any> {
    //Get ID register
    let solicitudId: number = this.routeParams.id

    return new Promise((resolve, reject) => {
      this._asignacionService.getDatosFicha(solicitudId).then(
        response => {
          if (response.data.solicitudViatico) {
          //Solicitud Viatico
          this.solicitudViatico = response.data.solicitudViatico;

          //Concepto Viatico
          this.conceptoViatico = response.data.conceptoViatico;

          //Tipo Pasaje
          this.tipoPasaje = response.data.tipoPasaje;

          //Asignacion
          this.asignacion = response.data.asignacion;

          //Asignacion Viatico
          this.asignacionViatico = response.data.asignacionViatico;

          //Asignacion Pasaje
          this.asignacionPasaje = response.data.asignacionPasaje;

          //Matriz Viatico
          this.matrizViatico = response.data.matrizViatico;
          
          this.onAsignacionChanged.next(response);
          resolve(response);
        } else {
          this._toastr.error("El ID no es correcto", 'Error.');
          this.router.navigate(['app/viaticos/asignaciones/']);
        }
        },
        error => {
          this._toastr.error(GenericService.getError(error).message);
          this.router.navigate(['app/viaticos/asignaciones/']);
        })
    });
  }

  saveAsignacion(data: any) {
    return new Promise((resolve, reject) => {
      this._asignacionService.guarda(data).then((response: any) => {
        resolve(response);
      }, reject);
    });
  }

  enviarRevision(solicitudId : number, motivo: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this._asignacionService.enviarRevision(solicitudId, motivo).then((response: any) => {
        resolve(response);
      }, reject);
    });
  }
}
