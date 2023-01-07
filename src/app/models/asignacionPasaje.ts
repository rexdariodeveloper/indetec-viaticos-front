import { Asignacion } from './asignacion';
import { ConceptoViatico } from './concepto_viatico';
import { Listado_CMM } from './listado_cmm';
import { ListadoCMM } from './mapeos/listadoCMM';

export class AsignacionPasaje {
    public id?: number;
    public asignacionId?: number;
    public asignacion?: Asignacion;
    public conceptoViaticoId?: number;
    public conceptoViatico?: ConceptoViatico;
    public viajeRedondo?: boolean;
    public fechaCompra?: Date;
    public codigoReservacion?: string;
    public nombreLinea?: string;
    public fechaSalida?: Date;
    public fechaRegreso?: Date;
    public costo?: number;
    public asignadoAFuncionario?: boolean;
    public estatusId?: number;
    public estatus?: Listado_CMM;
    public fechaCreacion?: Date;
    public creadoPorId?: number;
    public fechaUltimaModificacion?: number;
    public modificadoPorId?: number;
    public timestamp?: Date;

    constructor(asignacionPasaje?)
    {
        asignacionPasaje = asignacionPasaje || {};
        this.id = asignacionPasaje.id || null;
        this.asignacionId = asignacionPasaje.asignacionId || null;
        this.asignacion = asignacionPasaje.asignacion || Asignacion;
        this.conceptoViaticoId = asignacionPasaje.conceptoViaticoId || null;
        this.conceptoViatico = asignacionPasaje.conceptoViatico || ConceptoViatico;
        this.viajeRedondo = asignacionPasaje.viajeRedondo || true;
        this.fechaCompra = asignacionPasaje.fechaCompra || null;
        this.codigoReservacion = asignacionPasaje.codigoReservacion || '';
        this.nombreLinea = asignacionPasaje.nombreLinea || '';
        this.fechaSalida = asignacionPasaje.fechaSalida || null;
        this.fechaRegreso = asignacionPasaje.fechaRegreso || null;
        this.costo = asignacionPasaje.costo || 0.00;
        this.asignadoAFuncionario = asignacionPasaje.asignadoAFuncionario || false;
        this.estatusId = asignacionPasaje.estatusId || ListadoCMM.EstatusRegistro.ACTIVO;
        this.estatus = asignacionPasaje.estatus || Listado_CMM;
        this.fechaCreacion = asignacionPasaje.fechaCreacion || '';
        this.creadoPorId = asignacionPasaje.creadoPorId || null;
        this.fechaUltimaModificacion = asignacionPasaje.fechaUltimaModificacion || '';
        this.modificadoPorId = asignacionPasaje.modificadoPorId || null;
        this.timestamp = asignacionPasaje.timestamp || ''; 
    }
}

export class AsignacionPasajeTotal {
    public aereoTotal?: number;
    public maritimoTotal?: number;
    public terrestreTotal?: number;
    public pasajeTotal?: number;
    public transferirTotal?: number;

    constructor(asignacionPasaje?)
    {
        asignacionPasaje = asignacionPasaje || {};
        this.aereoTotal = asignacionPasaje.aereoTotal || 0.00;
        this.maritimoTotal = asignacionPasaje.maritimoTotal || 0.00;
        this.terrestreTotal = asignacionPasaje.terrestreTotal || 0.00;
        this.pasajeTotal = asignacionPasaje.pasajeTotal || 0.00;
        this.transferirTotal = asignacionPasaje.transferirTotal || 0.00;
    }
}