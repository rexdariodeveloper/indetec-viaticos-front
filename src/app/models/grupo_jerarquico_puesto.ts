export class GrupoJerarquicoPuesto {

    public id?: number;
    public grupoJerarquicoId?: number;
    public listadoPuestoId?: number;
    public estatusId?: number;
    public fechaCreacion?: string;
    public creadoPorId?: number;
    public fechaUltimaModificacion?: string;
    public modificadoPorId?: number;
    public timestamp?: string;
}

export class GrupoJerarquicoPuestoMap {
	[key:number]: GrupoJerarquicoPuesto;
}