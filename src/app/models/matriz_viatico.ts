import { GrupoJerarquico } from './grupo_jerarquico';
import { ConceptoViatico } from './concepto_viatico';
import { ListadoCMM } from './mapeos/listadoCMM';

export class MatrizViatico {

    public id?: number;
    public grupoJerarquicoId?: number;
    public grupoJerarquico?: GrupoJerarquico;
    public conceptoViaticoId?: number;
    public conceptoViatico?: ConceptoViatico;
    public listadoZonaId?: number;
    public listadoZona?: ListadoCMM;
    public monto?: number;
    public fechaCreacion?: Date;
    public creadoPorId?: number;
    public fechaUltimaModificacion?: Date;
    public modificadoPorId?: number;
    public timestamp?: string;

    constructor(matrizViatico?)
    {
        matrizViatico = matrizViatico || {};
        this.id = matrizViatico.id || null;
        this.grupoJerarquicoId = matrizViatico.grupoJerarquicoId || null;
        this.grupoJerarquico = matrizViatico.grupoJerarquico || null;
        this.conceptoViaticoId = matrizViatico.conceptoViaticoId || null;
        this.conceptoViatico = matrizViatico.conceptoViatico || null;
        this.listadoZonaId = matrizViatico.listadoZonaId || null;
        this.listadoZona = matrizViatico.listadoZona || null;
        this.monto = matrizViatico.monto || 0.00;
        this.fechaCreacion = matrizViatico.fechaCreacion ||  null;
        this.creadoPorId = matrizViatico.creadoPorId || null;
        this.fechaUltimaModificacion = matrizViatico.fechaUltimaModificacion || null;
        this.modificadoPorId = matrizViatico.modificadoPorId || null;
        this.timestamp = matrizViatico.timestamp || '';     
    }
}

export class MatrizViaticoRecomendacionConceptoViatico {

    public conceptoViaticoId?: number;
    public monto?: number;

    constructor(matrizViaticoRecomendacionConceptoViatico?)
    {
        matrizViaticoRecomendacionConceptoViatico = matrizViaticoRecomendacionConceptoViatico || {
            conceptoViaticoId: null,
            monto: 0
        };
        this.conceptoViaticoId = matrizViaticoRecomendacionConceptoViatico.conceptoViaticoId;
        this.monto = matrizViaticoRecomendacionConceptoViatico.monto;
    }
}