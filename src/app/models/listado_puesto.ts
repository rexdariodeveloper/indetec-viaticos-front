import { ControlesMaestrosMultiples } from './mapeos/controles_maestros_multiples';

export class ListadoPuesto {

    public id?: number;
    public clave?: string;
    public nombre?: string;
    public descripcion?: string;
    public activo?: boolean;
    public fechaCreacion?: Date;
    public creadoPorId?: number;
    public fechaUltimaModificacion?: Date;
    public modificadoPorId?: number;
    public timestamp?: string;

    constructor(listadoPuesto?)
    {
        listadoPuesto = listadoPuesto || {};
        this.id = listadoPuesto.id || null;
        this.clave = listadoPuesto.clave || '';
        this.nombre = listadoPuesto.nombre || '';
        this.descripcion = listadoPuesto.descripcion || null;
        this.activo = listadoPuesto.activo || true;
        this.fechaCreacion = listadoPuesto.fechaCreacion ||  null;
        this.creadoPorId = listadoPuesto.creadoPorId || null;
        this.fechaUltimaModificacion = listadoPuesto.fechaUltimaModificacion || null;
        this.modificadoPorId = listadoPuesto.modificadoPorId || null;
        this.timestamp = listadoPuesto.timestamp || '';     
    }
}

export class ListadoPuestoEditar {

    public id?: number;
    public clave?: string;
    public nombre?: string;
    public descripcion?: string;
    public activo?: boolean;
    public fechaCreacion?: Date;
    public creadoPorId?: number;
    public fechaUltimaModificacion?: Date;
    public modificadoPorId?: number;
    public timestamp?: string;
    public orden?: number;

    constructor(listadoPuesto?)
    {
        listadoPuesto = listadoPuesto || {};
        this.id = listadoPuesto.id || null;
        this.clave = listadoPuesto.clave || '';
        this.nombre = listadoPuesto.nombre || '';
        this.descripcion = listadoPuesto.descripcion || null;
        this.activo = listadoPuesto.activo || true;
        this.fechaCreacion = listadoPuesto.fechaCreacion ||  null;
        this.creadoPorId = listadoPuesto.creadoPorId || null;
        this.fechaUltimaModificacion = listadoPuesto.fechaUltimaModificacion || null;
        this.modificadoPorId = listadoPuesto.modificadoPorId || null;
        this.timestamp = listadoPuesto.timestamp || '';  
        this.orden = listadoPuesto.orden || null;   
    }
}