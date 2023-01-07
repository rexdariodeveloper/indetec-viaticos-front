export class Listado_CMM {

    public id?: number;
    public nombre?: string;
    public valor?: string;
    public sistema?: boolean;
    public activo?: boolean;
    public controlSencillo?: boolean;
    public moduloId?: number;
    public fechaCreacion?: string;
    public creadoPorId?: number;
    public fechaUltimaModificacion?: string;
    public modificadoPorId?: number;
    public timestamp?: string;
}

export class Listado_CMM_Map {
	[key:number]: Listado_CMM;
}

/************************/
/***** Proyecciones *****/
/************************/

export class ComboListadoCMMProjection{
    id?: number;
    valor?: string;
}