export class GrupoJerarquico {

    public id?: number;
    public nombre?: string;
    public descripcion?: string;
    public estatusId?: number;
    public fechaCreacion?: string;
    public creadoPorId?: number;
    public fechaUltimaModificacion?: string;
    public modificadoPorId?: number;
    public timestamp?: string;
    public puestosId?: number[];
    public noPuestos?: number;
}

export class GrupoJerarquicoMap {
	[key:number]: GrupoJerarquico;
}