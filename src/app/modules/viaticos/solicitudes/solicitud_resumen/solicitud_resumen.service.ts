import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve, Router } from '@angular/router';
import { SolicitudService } from '@services/solicitud.service';
import { GenericService } from '@services/generic.service';
import { ListadoCMM } from '@models/mapeos/listadoCMM';
import { AlertaService } from '@services/alerta.service';

@Injectable({ providedIn: 'root' })
export class SolicitudResumenComponentService implements Resolve<any> {

    routeParams: any;
    jsonDatosFicha: any;
    onSolicitudChanged: BehaviorSubject<any>;
    
    private formularioCompleto: boolean;

    constructor(private _solicitudService: SolicitudService, 
        private alertaService: AlertaService, 
        private router: Router) {
        // Set the defaults
        this.onSolicitudChanged = new BehaviorSubject({});
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
                this.getDatosFicha(this.routeParams.id, this.routeParams.formularioCompleto == 1)
            ]).then(
                () => {
                    resolve();
                },
                error => {
                    // throw error;
                    if (GenericService.getError(error).status == 6303) {
                        this.router.navigate(['/forbidden']);
                    }
                    reject();
                }
            );
        });
    }

    /**
     * Obtener datos generales para el funcionamiento de la Ficha
     *
     * @returns {Promise<any>}
     */
    getDatosFicha(solicitudId: number, formularioCompleto?: boolean): Promise<any> {
        this.formularioCompleto = formularioCompleto || false;

        return new Promise((resolve, reject) => {
            this._solicitudService.getSolicitudResumenDetalle(solicitudId, this.formularioCompleto)
                .then((response: any) => {
                    this.jsonDatosFicha = response.data;
                    this.onSolicitudChanged.next(response);
                    resolve(response);
                }, reject);
        });
    }

    cambiarEstatus(id: number, estatusId: number, motivo: string, alertaId: number): Promise<any> {
        switch (estatusId) {
            case ListadoCMM.EstatusSolicitud.AUTORIZADA: 
                return new Promise((resolve, reject) => {
                    this.alertaService.autorizar(alertaId)
                        .then((response: any) => {
                            resolve(response);
                        }, reject);
                });

            case ListadoCMM.EstatusSolicitud.EN_REVISION: 
                return new Promise((resolve, reject) => {
                    this.alertaService.revision(alertaId, motivo)
                        .then((response: any) => {
                            resolve(response);
                        }, reject);
                });
                
            case ListadoCMM.EstatusSolicitud.RECHAZADA: 
                return new Promise((resolve, reject) => {
                    this.alertaService.rechazar(alertaId, motivo)
                        .then((response: any) => {
                            resolve(response);
                        }, reject);
                });
        }

        // return new Promise((resolve, reject) => {
        //     this._solicitudService.cambiarEstatusSolicitudPorId(id, estatusId, motivo)
        //         .then((response: any) => {
        //             resolve(response);
        //         }, reject);
        // });
    }

    isFormularioCompleto() {
        return this.formularioCompleto;
    }
}