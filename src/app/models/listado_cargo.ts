import { ControlesMaestrosMultiples } from './mapeos/controles_maestros_multiples';

export class ListadoCargo {

    public id?: number;
    public nombre?: string;
    public descripcion?: string;
    public activo?: boolean;
    public fechaCreacion?: Date;
    public creadoPorId?: number;
    public fechaUltimaModificacion?: Date;
    public modificadoPorId?: number;
    public timestamp?: string;

    constructor(listadoCargo?)
    {
        listadoCargo = listadoCargo || {};
        this.id = listadoCargo.id || null;
        this.nombre = listadoCargo.nombre || '';
        this.descripcion = listadoCargo.descripcion || null;
        this.activo = listadoCargo.activo || true;
        this.fechaCreacion = listadoCargo.fechaCreacion ||  null;
        this.creadoPorId = listadoCargo.creadoPorId || null;
        this.fechaUltimaModificacion = listadoCargo.fechaUltimaModificacion || null;
        this.modificadoPorId = listadoCargo.modificadoPorId || null;
        this.timestamp = listadoCargo.timestamp || '';       
    }
}

export class ListadoCargoEditar {

    public id?: number;
    public nombre?: string;
    public descripcion?: string;
    public activo?: boolean;
    public fechaCreacion?: Date;
    public creadoPorId?: number;
    public fechaUltimaModificacion?: Date;
    public modificadoPorId?: number;
    public timestamp?: string;
    public orden?: number;

    constructor(listadoCargo?)
    {
        listadoCargo = listadoCargo || {};
        this.id = listadoCargo.id || null;
        this.nombre = listadoCargo.nombre || '';
        this.descripcion = listadoCargo.descripcion || '';
        this.activo = listadoCargo.activo || true;
        this.fechaCreacion = listadoCargo.fechaCreacion ||  null;
        this.creadoPorId = listadoCargo.creadoPorId || null;
        this.fechaUltimaModificacion = listadoCargo.fechaUltimaModificacion || null;
        this.modificadoPorId = listadoCargo.modificadoPorId || null;
        this.timestamp = listadoCargo.timestamp || '';      
        this.orden = listadoCargo.orden || null;  
    }
}