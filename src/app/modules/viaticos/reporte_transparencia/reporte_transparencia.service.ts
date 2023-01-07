import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { SolicitudService } from '@services/solicitud.service';
import { SolicitudViatico } from '@models/solicitud_viatico';

@Injectable({ providedIn: 'root' })
export class ReporteTransparenciaComponentService implements Resolve<any>{

    solicitudes: SolicitudViatico[];
    onChanged: BehaviorSubject<any>;

    constructor(private _solicitudService: SolicitudService) {
        // Set the defaults
        this.onChanged = new BehaviorSubject({});
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        return null;
    }

    /**
     * Get listado
     *
     * @returns {Promise<any>}
     */
    getListado(): Promise<any> {
        return null;
    }

    getReporteTransparencia(fechaInicio: Date, fechaFin: Date): Promise<any> {
        return new Promise((resolve, reject) => {
            this._solicitudService.reporteTransparencia(fechaInicio, fechaFin)
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }
    
    descargarReporteTransparencia(fechaInicio: Date, fechaFin: Date, 
        fechaValidacion: Date, fechaActualizacion: Date, rows: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._solicitudService.descargarReporteTransparencia(fechaInicio, fechaFin, fechaValidacion, fechaActualizacion, rows)
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    descargarReporteTransparenciaConcentrado(solicitudIds: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this._solicitudService.descargarReporteTransparenciaConcentrado(solicitudIds)
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }
}