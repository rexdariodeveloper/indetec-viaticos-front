import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { InformeComprobacionService } from '@services/informe_comprobacion.service';
import { ToastrService } from 'ngx-toastr';
import { SolicitudViatico } from '@models/solicitud_viatico';
import { SolicitudViaticoInforme } from '@models/solicitud_viatico_informe';
import { AsignacionViatico } from '@models/asignacionViatico';
import { SolicitudViaticoComprobacion } from '@models/solicitud_viatico_comprobacion';
import { SolicitudViaticoComprobacionPasaje } from '@models/solicitud_viatico_comprobacion_pasaje';
import { SolicitudViaticoComprobacionCargo } from '@models/solicitud_viatico_comprobacion_cargo';
import { ConceptoViatico } from '@models/concepto_viatico';
import { Listado_CMM } from '@models/listado_cmm';
import { Moneda } from '@models/moneda';
import { AsignacionPasaje } from '@models/asignacionPasaje';
import { SolicitudViaticoComprobacionDetalle } from '@models/solicitud_viatico_comprobacion_detalle';
import { SolicitudViaticoComprobacionService } from '@services/solicitud_viatico_comprobacion.service';
import { MatrizViatico } from '@models/matriz_viatico';
import { Archivo } from '@models/archivo';
import { ConfiguracionEnte } from '@models/configuracion_ente';
import { GenericService } from '@services/generic.service';
import { SolicitudViaticoComprobacionDetalleImpuesto } from '@models/solicitud_viatico_comprobacion_detalle_impuesto';

@Injectable({ providedIn: 'root' })
export class InformeComprobacionComponentService implements Resolve<any> {

    routeParams: any;
    onInformeComprobacionChanged: BehaviorSubject<any>;
    soloLectura: boolean;

    solicitudViatico: SolicitudViatico;
    solicitudViaticoInforme: SolicitudViaticoInforme;
    asignacionViatico: AsignacionViatico[];
    asignacionPasaje: AsignacionPasaje[];
    solicitudViaticoComprobacion: SolicitudViaticoComprobacion;
    solicitudViaticoComprobacionDetalle: SolicitudViaticoComprobacionDetalle[];
    solicitudViaticoComprobacionDetalleImpuesto: SolicitudViaticoComprobacionDetalleImpuesto[];
    solicitudViaticoComprobacionDetalleRMBorrado: SolicitudViaticoComprobacionDetalle[];
    solicitudViaticoComprobacionPasaje: SolicitudViaticoComprobacionPasaje[];
    solicitudViaticoComprobacionCargo: SolicitudViaticoComprobacionCargo[];
    archivo: Archivo[];
    categoriaViatico: Listado_CMM[];
    tipoComprobante: Listado_CMM[];
    formaComprobacion: Listado_CMM[];
    formaPago: Listado_CMM[]
    conceptoViatico: ConceptoViatico[];
    moneda: Moneda[];
    permisoRM: boolean;
    usuarioSolicitante: boolean;
    matrizViatico: MatrizViatico[];
    configuracionEnte: ConfiguracionEnte;

    // Listado CMM Claves Productos Hospedaje
    listadoCMMClavesProductosHospedaje: Listado_CMM[];

    constructor(private _informeComprobacionService: InformeComprobacionService,
        private _solicitudViaticoComprobacionService: SolicitudViaticoComprobacionService,
        private _toastr: ToastrService,
        private router: Router) {
        this.onInformeComprobacionChanged = new BehaviorSubject({});
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
                        this._toastr.error(GenericService.getError(error).message);
                        this.router.navigate(['app/viaticos/informes_comprobaciones/']);
                    }
                    reject();
                }
            );
        });
    }

    /**
     * Get listado de Solicitud Viatico Informe y Comprobacion
     *
     * @returns {Promise<any>}
     */
    getDatosFicha(): Promise<any> {
        //Get ID register
        let solicitudViaticoId: number = this.routeParams.id

        return new Promise((resolve, reject) => {
            this._informeComprobacionService.getDatosFicha(solicitudViaticoId).then((response: any) => {
                this.solicitudViatico = response.data.solicitudViatico;
                this.solicitudViaticoInforme = response.data.solicitudViaticoInforme;
                this.asignacionViatico = response.data.asignacionViatico;
                this.asignacionPasaje = response.data.asignacionPasaje;
                this.solicitudViaticoComprobacion = response.data.solicitudViaticoComprobacion;
                this.solicitudViaticoComprobacionDetalle = response.data.solicitudViaticoComprobacionDetalle;
                this.solicitudViaticoComprobacionDetalleImpuesto = response.data.solicitudViaticoComprobacionDetalleImpuesto;
                this.solicitudViaticoComprobacionDetalleRMBorrado = response.data.solicitudViaticoComprobacionDetalleRMBorrado;
                this.solicitudViaticoComprobacionPasaje = response.data.solicitudViaticoComprobacionPasaje;
                this.solicitudViaticoComprobacionCargo = response.data.solicitudViaticoComprobacionCargo;
                this.archivo = response.data.archivo;
                this.categoriaViatico = response.data.categoriaViatico;
                this.tipoComprobante = response.data.tipoComprobante;
                this.formaComprobacion = response.data.formaComprobacion;
                this.formaPago = response.data.formaPago;
                this.conceptoViatico = response.data.conceptoViatico;
                this.moneda = response.data.moneda;
                this.permisoRM = response.data.permisoRM;
                this.usuarioSolicitante = response.data.usuarioSolicitante;
                this.matrizViatico = response.data.matrizViatico;
                this.configuracionEnte = response.data.configuracionEnte;
                this.soloLectura = response.data.soloLectura;

                // Listado CMM Claves Productos Hospedaje
                this.listadoCMMClavesProductosHospedaje = response.data.listadoCMMClavesProductosHospedaje;
                
                this.onInformeComprobacionChanged.next(response);
                resolve(response);
            }, reject);
        });
    }

    /**
     * Verify File Exists
     *
     * @returns {Promise<any>}
     * @param {data: any}
     */
    buscaCompartida(solicitudViaticoComprobacionDetalle: SolicitudViaticoComprobacionDetalle): Promise<any> {
        return new Promise((resolve, reject) => {
            this._informeComprobacionService.buscaCompartida(solicitudViaticoComprobacionDetalle).then((response: any) => {
                resolve(response);
            }, reject);
        });
    }

    /**
     * Save Solicitud Viatico Informe y Comprobacion
     *
     * @returns {Promise<any>}
     * @param {data: any}
     */
    saveInformeComprobacion(data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._informeComprobacionService.guarda(data).then((response: any) => {
                resolve(response);
            }, reject);
        });
    }

    /**
     * Save Solicitud Viatico Comprobacion and Solicitud Viatico Comprobacion Detalle Validacion
     *
     * @returns {Promise<any>}
     * @param {data: any}
     */
    saveSolicitudViaticoCoprobacion(data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._solicitudViaticoComprobacionService.guarda(data).then((response: any) => {
                resolve(response);
            }, reject);
        });
    }

    getListadoProveedoresAndPaises(ejercicio:number): Promise<any> {
        return new Promise((resolve, reject) => {
            this._informeComprobacionService.getListadoProveedoresAndPaises(ejercicio).then((response: any) => {
                resolve(response);
            }, reject);
        });
    }

    getListadoProveedores(ejercicio:number): Promise<any> {
        return new Promise((resolve, reject) => {
            this._informeComprobacionService.getListadoProveedores(ejercicio).then((response: any) => {
                resolve(response);
            }, reject);
        });
    }

    searchProveedor(json: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._informeComprobacionService.searchProveedor(json).then((response: any) => {
                resolve(response);
            }, reject);
        });
    }

    registerProveedor(json: any,ejercicio:number): Promise<any> {
        return new Promise((resolve, reject) => {
            this._informeComprobacionService.registerProveedor(json,ejercicio).then((response: any) => {
                resolve(response);
            }, reject);
        });
    }

    getListadoCuentaConTableRM(ejercicio:number): Promise<any> {
        return new Promise((resolve, reject) => {
            this._informeComprobacionService.getListadoCuentaConTableRM(ejercicio).then((response: any) => {
                resolve(response);
            }, reject);
        });
    }
}
