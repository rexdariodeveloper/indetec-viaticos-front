import { ListadoCMM } from './mapeos/listadoCMM';

export class Organigrama {

    public id?: number;
    public nodoPadreId?: number;
    public clave?: string
    public descripcion?: string;
    public responsableId?: number;
    public permiteAutorizacion?: boolean;
    public orden?: number;
    public estatusId?: number;
    public fechaRegistro?: Date;
    public registradoPorId?: number;
    public fechaUltimaModificacion?: Date;
    public modificadoPorId?: number;
    public timestamp?: string;

    constructor(organigrama?)
    {
        organigrama = organigrama || {};
        this.id = organigrama.id || null;
        this.nodoPadreId = organigrama.nodoPadreId || null;
        this.clave = organigrama.clave || '';
        this.descripcion = organigrama.descripcion || '';
        this.responsableId = organigrama.responsableId || null;
        this.permiteAutorizacion = organigrama.permiteAutorizacion || false;
        this.orden = organigrama.orden || null;
        this.estatusId = organigrama.estatusId || ListadoCMM.EstatusRegistro.ACTIVO;
        this.fechaRegistro = organigrama.fechaRegistro ||  null;
        this.registradoPorId = organigrama.registradoPorId || null;
        this.fechaUltimaModificacion = organigrama.fechaUltimaModificacion || null;
        this.modificadoPorId = organigrama.modificadoPorId || null;
        this.timestamp = organigrama.timestamp || '';
       
    }
}

export class ArbolOrganigramaProjection {
    
    public id?: number;
    public nodoPadreId?: number;
    public nombre?: string;
    public ordenamiento?: string;
    public tienePermiso?: boolean;
}