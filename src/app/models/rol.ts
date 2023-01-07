export class Rol {
	public id: number;
    public nombre: string;
    public descripcion? : string;
    public estatusId : number;
    public fechaCreacion : Date;
    public creadoPorId : number;
    public fechaUltimaModificacion? : Date;
    public modificadoPorId? : number;
    public timestamp : string;
    public menus?: number[];
}
