import { SolicitudViaticoComprobacionDetalle } from './solicitud_viatico_comprobacion_detalle';
import { Listado_CMM } from './listado_cmm';
import { ListadoCMM } from './mapeos/listadoCMM';

export class SolicitudViaticoComprobacionDetalleImpuesto{
    public id?: number;
    public solicitudViaticoComprobacionDetalleId?: number;
    public solicitudViaticoComprobacionDetalle?: SolicitudViaticoComprobacionDetalle;
    public tipoImpuestoId?: number;
    public tipoImpuesto?: Listado_CMM;
    public impuestoId?: number;
    public impuesto?: Listado_CMM
    public impuestoImporte?: number;
    public tasaOCuota?: number;
    public impuestoComprobado?: number;
    public estatusId?: number;
    public estatus?: Listado_CMM;
    public fechaRegistro?: Date;
    public registradoPorId?: number;
    public fechaUltimaModificacion?: Date;
    public modificadoPorId?: number;
    public timestamp?: Date;

    constructor(impuesto?)
    {
        impuesto = impuesto || {
            id: null,
            solicitudViaticoComprobacionDetalleId: null,
            tipoImpuestoId: null,
            impuestoId: null,
            impuestoImporte: null,
            tasaOCuota: null,
            impuestoComprobado: null,
            estatusId: ListadoCMM.EstatusRegistro.ACTIVO
        };
        this.id = impuesto.id;
        this.solicitudViaticoComprobacionDetalleId = impuesto.solicitudViaticoComprobacionDetalleId;
        this.tipoImpuestoId = impuesto.tipoImpuestoId;
        this.impuestoId = impuesto.impuestoId;
        this.impuestoImporte = impuesto.impuestoImporte;
        this.tasaOCuota = impuesto.tasaOCuota;
        this.impuestoComprobado = impuesto.impuestoComprobado;
        this.estatusId = impuesto.estatusId;
    }

}