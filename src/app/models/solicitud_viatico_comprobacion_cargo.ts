import { SolicitudViaticoComprobacionPasaje } from './solicitud_viatico_comprobacion_pasaje';
import { Listado_CMM } from './listado_cmm';
import { ListadoCMM } from './mapeos/listadoCMM';

export class SolicitudViaticoComprobacionCargo {
    public id?: number;
    public solicitudViaticoComprobacionPasajeId?: number;
    public solicitudViaticoComprobacionPasaje?: SolicitudViaticoComprobacionPasaje;
    public fechaCargoSalida?: Date;
    public fechaCargoRegreso?: Date;
    public montoCargoSalida?: number;
    public montoCargoRegreso?: number;
    public solicitudCambio?: string;
    public estatusId?: number;
    public estatus?: Listado_CMM;
    public fechaCreacion?: Date;
    public creadoPorId?: number;
    public fechaUltimaModificacion?: number;
    public modificadoPorId?: number;
    public timestamp?: Date;

    constructor(comporobacionCargo?)
    {
        comporobacionCargo = comporobacionCargo || {};
        this.id = comporobacionCargo.id || null;
        this.solicitudViaticoComprobacionPasajeId = comporobacionCargo.solicitudViaticoComprobacionPasajeId || null;
        this.fechaCargoSalida = comporobacionCargo.fechaCargoSalida || null;
        this.fechaCargoRegreso = comporobacionCargo.fechaCargoRegreso || null;
        this.montoCargoSalida = comporobacionCargo.montoCargoSalida || 0;
        this.montoCargoRegreso = comporobacionCargo.montoCargoRegreso || 0;
        this.solicitudCambio = comporobacionCargo.solicitudCambio || '';
        this.estatusId = comporobacionCargo.estatusId || ListadoCMM.EstatusRegistro.ACTIVO;
    }

}