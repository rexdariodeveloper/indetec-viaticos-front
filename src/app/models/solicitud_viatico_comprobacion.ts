import { SolicitudViatico } from './solicitud_viatico';
import { Listado_CMM } from './listado_cmm';
import { ConceptoViatico } from './concepto_viatico';
import { ListadoCMM } from './mapeos/listadoCMM';

export class SolicitudViaticoComprobacion {
    public id?: number;
    public solicitudViaticoId?: number;
    public solicitudViatico?: SolicitudViatico;
    public solicitanteFinalizoComprobacion?: boolean;
    public fechaSolicitanteFinalizoComprobacion?: Date;
    public rmFinalizoComprobacion?: boolean;
    public fechaRMFinalizoComprobacion?: Date;
    public comisionNoRealizada?: boolean;
    public motivoNoRealizada?: string;
    public estatusId?: number;
    public estatus?: Listado_CMM;
    public fechaCreacion?: Date;
    public creadoPorId?: number;
    public fechaUltimaModificacion?: number;
    public modificadoPorId?: number;
    public fechaPolizaComprobacion?:Date;
    public timestamp?: Date;

    constructor(comporobacion?)
    {
        comporobacion = comporobacion || {
            id: null,
            solicitudViaticoId: null,
            solicitanteFinalizoComprobacion: false,
            fechaSolicitanteFinalizoComprobacion: null,
            rmFinalizoComprobacion: false,
            fechaRMFinalizoComprobacion: null,
            comisionNoRealizada: false,
            motivoNoRealizada: '',
            fechaPolizaComprobacion:null,
            estatusId: ListadoCMM.EstatusRegistro.ACTIVO

        };
        this.id = comporobacion.id;
        this.solicitudViaticoId = comporobacion.solicitudViaticoId;
        this.solicitanteFinalizoComprobacion = comporobacion.solicitanteFinalizoComprobacion;
        this.fechaSolicitanteFinalizoComprobacion = comporobacion.fechaSolicitanteFinalizoComprobacion;
        this.rmFinalizoComprobacion = comporobacion.rmFinalizoComprobacion;
        this.fechaRMFinalizoComprobacion = comporobacion.fechaRMFinalizoComprobacion;
        this.comisionNoRealizada = comporobacion.comisionNoRealizada;
        this.motivoNoRealizada = comporobacion.motivoNoRealizada;
        this.estatusId = comporobacion.estatusId;
        this.fechaPolizaComprobacion=comporobacion.fechaPolizaComprobacion;
    }

}