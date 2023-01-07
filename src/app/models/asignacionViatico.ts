import { Asignacion } from './asignacion';
import { ConceptoViatico } from './concepto_viatico';
import { Listado_CMM } from './listado_cmm';
import { ListadoCMM } from './mapeos/listadoCMM';

export class AsignacionViatico {
    public id?: number;
    public asignacionId?: number;
    public asignacion?: Asignacion;
    public conceptoViaticoId?: number;
    public conceptoViatico?: ConceptoViatico;
    public conceptoViaticoCodigo?: string;
    public conceptoViaticoNombre?: string;
    public montoConPernocta?: number;
    public montoSinPernocta?: number;
    public montoPorTransferir?: number;
    public estatusId?: number;
    public estatus?: Listado_CMM;
    public fechaCreacion?: Date;
    public creadoPorId?: number;
    public fechaUltimaModificacion?: number;
    public modificadoPorId?: number;
    public timestamp?: Date;

    constructor(asignacionViatico?)
    {
        asignacionViatico = asignacionViatico || {};
        this.id = asignacionViatico.id || null;
        this.asignacionId = asignacionViatico.asignacionId || null;
        this.asignacion = asignacionViatico.asignacion || Asignacion;
        this.conceptoViaticoId = asignacionViatico.conceptoViaticoId || null;
        this.conceptoViatico = asignacionViatico.conceptoViatico || ConceptoViatico;
        this.conceptoViaticoCodigo = asignacionViatico.conceptoViaticoCodigo || '';
        this.conceptoViaticoNombre = asignacionViatico.conceptoViaticoNombre || '';
        this.montoConPernocta = asignacionViatico.montoConPernocta || 0;
        this.montoSinPernocta = asignacionViatico.montoSinPernocta || 0;
        this.montoPorTransferir = asignacionViatico.montoPorTransferir || 0;
        this.estatusId = asignacionViatico.estatusId || ListadoCMM.EstatusRegistro.ACTIVO;
        this.estatus = asignacionViatico.estatus || Listado_CMM;
        this.fechaCreacion = asignacionViatico.fechaCreacion || '';
        this.creadoPorId = asignacionViatico.creadoPorId || null;
        this.fechaUltimaModificacion = asignacionViatico.fechaUltimaModificacion || '';
        this.modificadoPorId = asignacionViatico.modificadoPorId || null;
    }

}