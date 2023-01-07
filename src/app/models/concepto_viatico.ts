import { ListadoCMM } from './mapeos/listadoCMM';
import { Listado_CMM } from './listado_cmm';

export class ConceptoViatico {

    public id?: number;
    public categoriaId?: number;
    public categoria?: Listado_CMM;
    public codigo?: string;
    public concepto?: string;
    public objetoGastoId?: number;
    public objetoGasto?: Object;
    public noPermitirSinPernocta?: boolean;
    public estatusId?: number;
    public estatus?: Listado_CMM;
    public fechaCreacion?: Date;
    public creadoPorId?: number;
    public fechaUltimaModificacion?: Date;
    public modificadoPorId?: number;
    public timestamp?: string;
    public orden?: number;

    constructor(conceptoViatico?) {
        conceptoViatico = conceptoViatico || {};
        this.id = conceptoViatico.id || null;
        this.categoriaId = conceptoViatico.categoriaId || null;
        this.categoria = conceptoViatico.categoria || Listado_CMM;
        this.codigo = conceptoViatico.codigo || '';
        this.concepto = conceptoViatico.concepto || '';
        this.objetoGastoId = conceptoViatico.objetoGastoId || null;
        this.objetoGasto = conceptoViatico.objetoGasto || [];
        this.noPermitirSinPernocta = conceptoViatico.noPermitirSinPernocta || false;
        this.estatusId = conceptoViatico.estatusId || ListadoCMM.EstatusRegistro.ACTIVO;
        this.estatus = conceptoViatico.estatusId || Listado_CMM;
        this.fechaCreacion = conceptoViatico.fechaCreacion || null;
        this.creadoPorId = conceptoViatico.creadoPorId || null;
        this.fechaUltimaModificacion = conceptoViatico.fechaUltimaModificacion || null;
        this.modificadoPorId = conceptoViatico.modificadoPorId || null;
        this.timestamp = conceptoViatico.timestamp || '';
        this.orden = conceptoViatico.orden || 0;
    }
}