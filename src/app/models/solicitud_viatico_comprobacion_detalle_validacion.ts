import { Listado_CMM } from './listado_cmm';
import { ListadoCMM } from './mapeos/listadoCMM';
import { SolicitudViaticoComprobacionDetalle } from './solicitud_viatico_comprobacion_detalle';
import { SolicitudViaticoComprobacion } from './solicitud_viatico_comprobacion';

export class SolicitudViaticoComprobacionDetalleValidacion {
    public id?: number;
    public solicitudViaticoComprobacionDetalleId?: number;
    public solicitudViaticoComprobacionDetalle?: SolicitudViaticoComprobacionDetalle;
    public textoValidacion?: string;
    public estatusId?: number;
    public estatus?: Listado_CMM;
    public fechaCreacion?: Date;
    public creadoPorId?: number;
    public fechaUltimaModificacion?: number;
    public modificadoPorId?: number;
    public timestamp?: Date;
    public solicitudViaticoComprobacionId?: number;
    public solicitudViaticoComprobacion?: SolicitudViaticoComprobacion;

    constructor(comporobacion?)
    {
        comporobacion = comporobacion || {
            id: null,
            solicitudViaticoComprobacionDetalleId: null,
            textoValidacion: '',
            estatusId: ListadoCMM.EstatusRegistro.ACTIVO,
            solicitudViaticoComprobacionId: null
        };
        this.id = comporobacion.id;
        this.solicitudViaticoComprobacionDetalleId = comporobacion.solicitudViaticoComprobacionDetalleId;
        this.textoValidacion = comporobacion.textoValdacion;
        this.estatusId = comporobacion.estatusId;
        this.solicitudViaticoComprobacionId = comporobacion.solicitudViaticoComprobacionId;
    }

}