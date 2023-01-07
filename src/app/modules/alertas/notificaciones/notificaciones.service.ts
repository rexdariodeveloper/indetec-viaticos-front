import { Injectable } from '@angular/core';
import { GenericService } from '@services/generic.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Empleado } from '@models/empleado';
import { EmpleadoService } from '@services/empleado.service';
import { AlertaListadoProjection } from '@models/alerta';
import { AlertaService } from '@services/alerta.service';

@Injectable({ providedIn: 'root' })
export class NotificacionesComponentService implements Resolve<any> {

  alertasListadoProjection: AlertaListadoProjection[];
  onAlertasChanged: BehaviorSubject<any>;

  constructor(private _alertasService: AlertaService) {
    this.onAlertasChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
  {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.getAlertas()
      ]).then(() => {
          resolve();
      },reject);
    });
  }

  getAlertas(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._alertasService.getListadoAlertas().then((response:any) =>{
        this.alertasListadoProjection = response.data;
        this.onAlertasChanged.next(response);
        resolve(response);
      },reject);
    });
  }
  
  autorizar(alertaId: number): Promise<any> {
    return new Promise((resolve, reject) => {
        this._alertasService.autorizar(alertaId)
            .then((response: any) => {
                resolve(response);
            }, reject);
    });
  }

  revision(alertaId: number, motivo: string): Promise<any> {
    return new Promise((resolve, reject) => {
        this._alertasService.revision(alertaId, motivo)
            .then((response: any) => {
                resolve(response);
            }, reject);
    });
  }

  rechazar(alertaId: number, motivo: string): Promise<any> {
    return new Promise((resolve, reject) => {
        this._alertasService.rechazar(alertaId, motivo)
            .then((response: any) => {
                resolve(response);
            }, reject);
    });        
  }

  ocultarNotificaciones(listAlertasId: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
        this._alertasService.ocultarNotificaciones(listAlertasId)
            .then((response: any) => {
                resolve(response);
            }, reject);
    });   
  }

}
