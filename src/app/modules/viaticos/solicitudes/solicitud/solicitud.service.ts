import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve, Router } from '@angular/router';
import { SolicitudService } from '@services/solicitud.service';
import { Sesion } from 'app/utils/sesion';
import { GenericService } from '@services/generic.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class SolicitudComponentService implements Resolve<any>{

    routeParams: any;
    jsonDatosFicha: any;
    onSolicitudChanged: BehaviorSubject<any>;

    constructor(private _solicitudService: SolicitudService, 
        private router: Router,
        private toastr: ToastrService) {
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
                this.getDatosFicha()
            ]).then(
                () => {
                    resolve();
                },
                error => {
                    // throw error;
                    if (GenericService.getError(error).status == 6303) {
                        this.router.navigate(['/forbidden']);
                    } else {
                        this.toastr.error(GenericService.getError(error).message);
                        this.router.navigate(['app/viaticos/solicitudes/']);
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
    getDatosFicha(): Promise<any> {

        let solicitudId: any = null;
        let empleadoId: any = null;

        //Si se esta editando algun registro, obtener el Id
        if (this.routeParams.id && this.routeParams.id !== 'nueva') {
            solicitudId = this.routeParams.id;
        }
        //Si no, solo obtenemos el Id el empleado
        else {
            empleadoId = Sesion.getUsuario().empleado.id;
        }

        return new Promise((resolve, reject) => {
            this._solicitudService.getDatosFichaEmpleado(solicitudId, empleadoId)
                .then((response: any) => {
                    this.jsonDatosFicha = response.data;
                    this.onSolicitudChanged.next(response);
                    resolve(response);
                }, reject);
        });
    }

    guarda(datos: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._solicitudService.guarda(datos)
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    elimina(id: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this._solicitudService.eliminaPorId(id)
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    enviar(id: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this._solicitudService.enviar(id)
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    getDatosPrograma(ejercicio: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this._solicitudService.getDatosPrograma(ejercicio)
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    cancelar(id: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this._solicitudService.cancelar(id)
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    cambiarEstatus(id: number, estatusId: number, motivo: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this._solicitudService.cambiarEstatusSolicitudPorId(id, estatusId, motivo)
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    imprimir(id: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this._solicitudService.imprimir(id)
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }
}