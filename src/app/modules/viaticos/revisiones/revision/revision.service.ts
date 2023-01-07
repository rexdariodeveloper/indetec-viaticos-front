import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { RevisionService } from '@services/revision.service';
import { SolicitudViatico } from '@models/solicitud_viatico';
import { AsignacionViatico } from '@models/asignacionViatico';
import { AsignacionPasaje } from '@models/asignacionPasaje';
import { SolicitudViaticoComprobacion } from '@models/solicitud_viatico_comprobacion';
import { SolicitudViaticoComprobacionDetalle } from '@models/solicitud_viatico_comprobacion_detalle';
import { SolicitudViaticoComprobacionPasaje } from '@models/solicitud_viatico_comprobacion_pasaje';
import { SolicitudViaticoComprobacionCargo } from '@models/solicitud_viatico_comprobacion_cargo';
import { ToastrService } from 'ngx-toastr';
import { Archivo } from '@models/archivo';
import { SolicitudViaticoComprobacionDetalleValidacion } from '@models/solicitud_viatico_comprobacion_detalle_validacion';
import { AlertaService } from '@services/alerta.service';
import { GenericService } from '@services/generic.service';
import { SolicitudViaticoComprobacionDetalleImpuesto } from '@models/solicitud_viatico_comprobacion_detalle_impuesto';
import { Moneda } from '@models/moneda';
import { Listado_CMM } from '@models/listado_cmm';
import { ConceptoViatico } from '@models/concepto_viatico';

@Injectable({
    providedIn: 'root'
})

export class RevisionComponentService implements Resolve<any> {

    routeParams: any;
    onRevisionChanged: BehaviorSubject<any>;

    solicitudViatico: SolicitudViatico;
    solicitudViaticoAsignacionViatico: AsignacionViatico[];
    solicitudViaticoAsignacionPasaje: AsignacionPasaje[];
    solicitudViaticoComprobacion: SolicitudViaticoComprobacion;
    solicitudViaticoComprobacionDetalle: SolicitudViaticoComprobacionDetalle[];
    solicitudViaticoComprobacionDetalleImpuesto: SolicitudViaticoComprobacionDetalleImpuesto[];
    solicitudViaticoComprobacionPasaje: SolicitudViaticoComprobacionPasaje[];
    solicitudViaticoComprobacionCargo: SolicitudViaticoComprobacionCargo[];
    solicitudViaticoComprobacionDetalleValidacion: SolicitudViaticoComprobacionDetalleValidacion[];
    archivo: Archivo[];
    mostrarAcciones: boolean;
    alertaId: number;
    moneda: Moneda[];
    formaPago: Listado_CMM[];
    conceptoViatico: ConceptoViatico[];

    constructor(
        private revisionService: RevisionService,
        private alertaService: AlertaService,
        private toastr: ToastrService,
        private router: Router) {

        this.onRevisionChanged = new BehaviorSubject({});
    }

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
                    if (GenericService.getError(error).status == 6303) {
                        this.router.navigate(['/forbidden']);
                    } else {
                        this.toastr.error(GenericService.getError(error).message);
                        this.router.navigate(['app/viaticos/revisiones/']);
                    }
                    reject();
                }
            );
        });
    }

    /**
     * Get Data Revision Solicitud Viatico
     *
     * @returns {Promise<any>}
     */
    getDatosFicha(): Promise<any> {
        let solicitudViaticoId: number = this.routeParams.id

        return new Promise((resolve, reject) => {
            this.revisionService.getDatosFicha({ solicitudViaticoId: solicitudViaticoId, alertaId: this.alertaId }).then((response: any) => {
                this.solicitudViatico = response.data.solicitudViatico;
                this.solicitudViaticoAsignacionViatico = response.data.asignacionViatico;
                this.solicitudViaticoAsignacionPasaje = response.data.asignacionPasaje;
                this.solicitudViaticoComprobacion = response.data.solicitudViaticoComprobacion;
                this.solicitudViaticoComprobacionDetalle = response.data.solicitudViaticoComprobacionDetalle;
                this.solicitudViaticoComprobacionDetalleImpuesto = response.data.solicitudViaticoComprobacionDetalleImpuesto;
                this.solicitudViaticoComprobacionPasaje = response.data.solicitudViaticoComprobacionPasaje;
                this.solicitudViaticoComprobacionCargo = response.data.solicitudViaticoComprobacionCargo;
                this.solicitudViaticoComprobacionDetalleValidacion = response.data.solicitudViaticoComprobacionDetalleValidacion;
                this.archivo = response.data.archivo;
                this.mostrarAcciones = response.data.mostrarAcciones;
                this.alertaId = response.data.alertaId;
                this.moneda = response.data.moneda;
                this.formaPago = response.data.formaPago;
                this.conceptoViatico = response.data.conceptoViatico;

                this.onRevisionChanged.next(response);
                resolve(response);
            }, reject);
        });
    }


    /**
     * Save Revision
     *
     * @returns {Promise<any>}
     * @param {data: any}
     */
    saveRevision(data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.revisionService.guarda(data).then((response: any) => {
                this.solicitudViatico = response.data;
                resolve(response);
            }, reject);
        });
    }

    autorizar(alertaId: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this.alertaService.autorizar(alertaId)
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    revision(motivo: string, alertaId: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this.alertaService.revision(alertaId, motivo)
                .then((response: any) => {
                    resolve(response);
                }, reject);
        });
    }
}