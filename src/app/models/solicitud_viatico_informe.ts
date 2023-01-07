import { Listado_CMM } from './listado_cmm';
import { ListadoCMM } from './mapeos/listadoCMM';
import { SolicitudViaticoComprobacion } from './solicitud_viatico_comprobacion';

export class SolicitudViaticoInforme {
    public id?: number;
    public solicitudViaticoComprobacionId?: number;
    public solicitudViaticoComprobacion?: SolicitudViaticoComprobacion;
    public objetivoEstrategico?: string;
    public objetivoEspecifico?: string;
    public actividadesRealizadas?: string;
    public resultadosObtenidos?: string;
    public contribuciones?: string;
    public vinculosANotas?: string;
    public listadoDocumentos?: string;
    public conclusiones?: string;
    public estatusId?: number;
    public estatus?: Listado_CMM;
    public fechaCreacion?: Date;
    public creadoPorId?: number;
    public fechaUltimaModificacion?: number;
    public modificadoPorId?: number;
    public timestamp?: Date;

    constructor(informe?)
    {
        informe = informe || {};
        this.id = informe.id || null;
        this.solicitudViaticoComprobacionId = informe.solicitudViaticoComprobacionId || null;
        this.objetivoEstrategico = informe.objetivoEstrategico || ''; 
        this.objetivoEspecifico = informe.objetivoEspecifico || '';
        this.actividadesRealizadas = informe.actividadesRealizadas || '';
        this.resultadosObtenidos = informe.resultadosObtenidos || '';
        this.contribuciones = informe.contribuciones || '';
        this.vinculosANotas = informe.vinculosANotas || '';
        this.listadoDocumentos = informe.listadoDocumentos || '';
        this.conclusiones = informe.conclusiones || '';
        this.estatusId = informe.estatusId || ListadoCMM.EstatusRegistro.ACTIVO;
        this.fechaCreacion = informe.fechaCreacion || '';
        this.creadoPorId = informe.creadoPorId || null;
        this.fechaUltimaModificacion = informe.fechaUltimaModificacion || '';
        this.modificadoPorId = informe.modificadoPorId;
        this.timestamp = informe.timestamp || '';
    }
}