import { Listado_CMM } from './listado_cmm';
import { ListadoCMM } from './mapeos/listadoCMM';
import { SolicitudViaticoComprobacionDetalle } from './solicitud_viatico_comprobacion_detalle';

export class SolicitudViaticoComprobacionPasaje {
    public id?: number;
    public solicitudViaticoComprobacionDetalleId?: number;
    public solicitudViaticoComprobacionDetalle?: SolicitudViaticoComprobacionDetalle;
    public fechaCompra?: Date;
    public nombreLinea?: string;
    public viajeRedondo?: boolean;
    public fechaSalida?: Date;
    public fechaRegreso?: Date;
    public numeroBoletoIda?: string;
    public numeroBoletoRegreso?: string;
    public boletoUtilizadoIda?: boolean;
    public boletoUtilizadoRegreso?: boolean;
    public codigoReservacion?: string;
    public comentarios?: string;
    public estatusId?: number;
    public estatus?: Listado_CMM;
    public fechaCreacion?: Date;
    public creadoPorId?: number;
    public fechaUltimaModificacion?: number;
    public modificadoPorId?: number;
    public timestamp?: Date;

    constructor(comporobacionPasaje?)
    {
        comporobacionPasaje = comporobacionPasaje || {
            id: null,
            solicitudViaticoComprobacionDetalleId: null,
            fechaCompra: null,
            nombreLinea: '',
            viajeRedondo: true,
            fechaSalida: null,
            fechaRegreso: null,
            numeroBoletoIda: '',
            numeroBoletoRegreso: '',
            boletoUtilizadoIda: true,
            boletoUtilizadoRegreso: true,
            codigoReservacion: '',
            comentarios: '',
            estatusId: ListadoCMM.EstatusRegistro.ACTIVO
        };
        this.id = comporobacionPasaje.id;
        this.solicitudViaticoComprobacionDetalleId = comporobacionPasaje.solicitudViaticoComprobacionDetalleId;
        this.fechaCompra = comporobacionPasaje.fechaCompra;
        this.nombreLinea = comporobacionPasaje.nombreLinea;
        this.viajeRedondo = comporobacionPasaje.viajeRedondo;
        this.fechaSalida = comporobacionPasaje.fechaSalida;
        this.fechaRegreso = comporobacionPasaje.fechaRegreso;
        this.numeroBoletoIda = comporobacionPasaje.numeroBoletoIda;
        this.numeroBoletoRegreso = comporobacionPasaje.numeroBoletoRegreso;
        this.boletoUtilizadoIda = comporobacionPasaje.boletoUtilizadoIda;
        this.boletoUtilizadoRegreso = comporobacionPasaje.boletoUtilizadoRegreso;
        this.codigoReservacion = comporobacionPasaje.codigoReservacion;
        this.comentarios = comporobacionPasaje.comentarios;
        this.estatusId = comporobacionPasaje.estatusId;
    }

}