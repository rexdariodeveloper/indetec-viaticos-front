import { ListadoCMM } from './mapeos/listadoCMM';
import { SolicitudViatico } from './solicitud_viatico';
import { Listado_CMM } from './listado_cmm';

export class Asignacion {
    public id?: number;
    public solicitudViaticoId?: number;
    public solicitudViatico?: SolicitudViatico;
    public fechaComprometido?: Date;
    public polizaComprometidoId?: number;
    public estatusId?: number;
    public estatus?: Listado_CMM;
    public fechaCreacion?: Date;
    public creadoPorId?: number;
    public fechaUltimaModificacion?: number;
    public modificadoPorId?: number;
    public timestamp?: Date;
    public polizaGastoPorComprobarId?:number;    

    constructor(asignacion?)
    {
        asignacion = asignacion || {};
        this.id = asignacion.id || null;
        this.solicitudViaticoId = asignacion.solicitudViaticoId || null;
        this.solicitudViatico = asignacion.solicitudViatico || SolicitudViatico;
        this.fechaComprometido = asignacion.fechaComprometido || null;
        this.polizaComprometidoId = asignacion.polizaComprometidoId || null;
        this.polizaGastoPorComprobarId=asignacion.polizaGastoPorComprobarId || null;        
        this.estatusId = asignacion.estatusId || ListadoCMM.EstatusRegistro.ACTIVO;
        this.estatus = asignacion.estatus || Listado_CMM;
        this.fechaCreacion = asignacion.fechaCreacion || '';
        this.creadoPorId = asignacion.creadoPorId || null;
        this.fechaUltimaModificacion = asignacion.fechaUltimaModificacion || '';
        this.modificadoPorId = asignacion.modificadoPorId || null;
        this.timestamp = asignacion.timestamp || '';         
    }

}

export class AsignacionListado {
    public id?: number;
    public numeroSolicitud: string;
    public image?: string;
    public nombre?: string;
    public fechaSolicitud?: Date
    public fechaViaje?: Date
    public ciudadDestino?: string;
    public montoAsignado?: number;
    public estatus?: string;

    constructor(asignacionListado?)
    {
        asignacionListado = asignacionListado || {};
        this.id = asignacionListado.id || null;
        this.image = asignacionListado.image || '';
        this.nombre = asignacionListado.nombre || '';
        this.fechaSolicitud = asignacionListado.fechaSolicitud || null;
        this.fechaViaje = asignacionListado.fechaViaje || null;
        this.ciudadDestino = asignacionListado.ciudadDestino || '';
        this.montoAsignado = asignacionListado.modificadoPorId || 0;
        this.estatus = asignacionListado.creadoPorId || '';
    }
}



