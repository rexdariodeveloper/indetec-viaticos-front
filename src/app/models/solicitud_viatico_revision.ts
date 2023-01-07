import { SolicitudViatico } from './solicitud_viatico';
import { Listado_CMM } from './listado_cmm';
import { ListadoCMM } from './mapeos/listadoCMM';

export class SolicitudViaticoRevision{
    public id?: number;
    public solicitudViaticoId: number;
    public solicitudViatico: SolicitudViatico;
    public estatusId?: number;
    public estatus?: Listado_CMM;
    public fechaCreacion?: Date;
    public creadoPorId?: number;
    public fechaUltimaModificacion?: number;
    public modificadoPorId?: number;
    public timestamp?: Date;
    
    constructor(revision?){
        revision = revision || {
            id: null,
            solicitudViaticoId: null,
            estatusId: ListadoCMM.EstatusSolicitud.ACTIVA
        }
        this.id = revision.id;
        this.solicitudViaticoId = revision.solicitudViaticoId;
        this.estatusId = revision.estatusId;
    }
}