export class Pais {

    public id?: number;
    public codigo?: string;
    public nombre?: string;
    public estatusId?: number;
    public fechaCreacion?: string;
    public creadoPorId?: number;
    public fechaUltimaModificacion?: string;
    public modificadoPorId?: number;
    public timestamp?: string;
    public modificado?: boolean;
}

export class PaisMap {
	[key:number]: Pais;
}