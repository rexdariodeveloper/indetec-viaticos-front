import { Listado_CMM } from './listado_cmm';
import { ConceptoViatico } from './concepto_viatico';
import { ListadoCMM } from './mapeos/listadoCMM';
import { SolicitudViaticoComprobacion } from './solicitud_viatico_comprobacion';

export class SolicitudViaticoComprobacionDetalle {
    public id?: number;
    public solicitudViaticoComprobacionId?: number;
    public solicitudViaticoComprobacion?: SolicitudViaticoComprobacion;
    public categoriaId?: number;
    public categoria?: Listado_CMM;
    public conceptoViaticoId?: number;
    public conceptoViatico?: ConceptoViatico;
    public tipoComprobanteId?: number;
    public tipoComprobante?: Listado_CMM;
    public rfc?: string;
    public razonSocial?: string;
    public proveedorId?: number;
    public proveedorPaisId?: string;
    public fechaComprobante?: Date;
    public folio?: string;
    public formaPagoId?: number;
    public formaPago: Listado_CMM;
    public monedaId?: number;
    public tipoCambio?: number;
    public importe?: number;
    public importePesos?: number;
    public esComprobadoPorRM?: boolean;
    public asignacionViaticoId?: number;
    public asignacionPasajeId?: number;
    public comentarios?: string;
    public estatusId?: number;
    public estatus?: Listado_CMM;
    public fechaCreacion?: Date;
    public creadoPorId?: number;
    public fechaUltimaModificacion?: number;
    public modificadoPorId?: number;
    public timestamp?: Date;
    public totalFactura?: number;
    public subTotalFactura?: number;
    public descuentoFactura?: number;
    public numeroPartida?: number;
    public conceptoDescripcion?: string;
    public claveProdServ?: string;
    public conceptoImporte?: number;
    public conceptoDescuento?: number;
    public subTotalComprobacion?: number;
    public descuentoComprobacion?: number;
    public cuentaPagoGastoId?: number;
    public formaComprobacionId?: number;
    public formaComprobacion?: Listado_CMM;
    public uuid?: string;
    public fileXML?: any;
    public fileOther?: any;

    constructor(detalle?)
    {
        detalle = detalle || {
            id: null,
            solicitudViaticoComprobacionId: null,
            categoriaId: null,
            conceptoViaticoId: null,
            tipoComprobanteId: null,
            rfc: '',
            razonSocial: '',
            proveedorId: null,
            proveedorPaisId: '',
            fechaComprobante: null,
            folio: '',
            formaPagoId: null,
            monedaId: null,
            tipoCambio: 0,
            importe: 0,
            importePesos: 0,
            esComprobadoPorRM: true,
            asignacionViaticoId: null,
            asignacionPasajeId: null,
            comentarios: '',
            estatusId: ListadoCMM.EstatusRegistro.ACTIVO,
            totalFactura: null,
            subTotalFactura: null,
            descuentoFactura: null,
            numeroPartida: null,
            conceptoDescripcion: '',
            claveProdServ: '',
            conceptoImporte: null,
            conceptoDescuento: null,
            subTotalComprobacion: null,
            descuentoComprobacion: null,
            cuentaPagoGastoId: null,
            formaComprobacionId: null,
            formaComprobacion: null,
            uuid: '',
            fileXML: '',
            fileOther: ''
        };
        this.id = detalle.id;
        this.solicitudViaticoComprobacionId = detalle.solicitudViaticoComprobacionId;
        this.categoriaId = detalle.categoriaId;
        this.conceptoViaticoId = detalle.conceptoViaticoId;
        this.tipoComprobanteId = detalle.tipoComprobanteId;
        this.rfc = detalle.rfc;
        this.razonSocial = detalle.razonSocial;
        this.proveedorId = detalle.proveedorId;
        this.proveedorPaisId = detalle.proveedorPaisId;
        this.fechaComprobante = detalle.fechaComprobante;
        this.folio = detalle.folio;
        this.formaPagoId = detalle.formaPagoId;
        this.monedaId = detalle.monedaId;
        this.tipoCambio = detalle.tipoCambio;
        this.importe = detalle.importe;
        this.importePesos = detalle.importePesos;
        this.esComprobadoPorRM = detalle.esComprobadoPorRM;
        this.asignacionViaticoId = detalle.asignacionViaticoId;
        this.asignacionPasajeId = detalle.asignacionPasajeId;
        this.comentarios = detalle.comentarios;
        this.estatusId = detalle.estatusId;
        this.totalFactura = detalle.totalFactura;
        this.subTotalFactura = detalle.subTotalFactura;
        this.descuentoFactura = detalle.descuentoFactura;
        this.numeroPartida = detalle.numeroPartida;
        this.conceptoDescripcion = detalle.conceptoDescripcion;
        this.claveProdServ = detalle.claveProdServ;
        this.conceptoImporte = detalle.conceptoImporte;
        this.conceptoDescuento = detalle.conceptoDescuento;
        this.subTotalComprobacion = detalle.subTotalComprobacion;
        this.descuentoComprobacion = detalle.descuentoComprobacion;
        this.cuentaPagoGastoId = detalle.cuentaPagoGastoId;
        this.formaComprobacionId = detalle.formaComprobacionId;
        this.formaComprobacion = detalle.formaComprobacion;
        this.uuid = detalle.uuid;
        this.fileXML = detalle.fileXML;
        this.fileOther = detalle.fileOther;
    }
}

export class SolicitudViaticoComprobacionDetalleRMBorrado {
    public id?: number;
    public categoriaId?: number;
    public conceptoViaticoId?: number;
    public tipoComprobanteId?: number;
    public importePesos?: number;
    public esComprobadoPorRM?: boolean;
    public asignacionViaticoId?: number;
    public asignacionPasajeId?: number;
    public already?: boolean;

    constructor(comporobacion?)
    {
        comporobacion = comporobacion || {};
        this.id = comporobacion.id || null;
        this.categoriaId = comporobacion.categoriaId || null;
        this.conceptoViaticoId = comporobacion.conceptoViaticoId || null;
        this.tipoComprobanteId = comporobacion.tipoComprobanteId || null;
        this.importePesos = comporobacion.importePesos || 0;
        this.esComprobadoPorRM = comporobacion.esComprobadoPorRM || true;
        this.asignacionViaticoId = comporobacion.asignacionViaticoId || null;
        this.asignacionPasajeId = comporobacion.asignacionPasajeId || null;
        this.already = false;
    }
}