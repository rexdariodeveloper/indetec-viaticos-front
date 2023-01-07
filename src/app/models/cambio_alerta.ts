export class CambioAlerta {
    public id: number;
    public folio: string;
    public empleadoOrigenId: number;
    public empleadoDestinoId: number;
    public fechaInicio: Date;
    public fechaFin: Date;
    public borrado: boolean;
    public fechaCreacion: string;
    public creadoPorId: number;
    public fechaUltimaModificacion?: string;
    public modificadoPorId?: number;
    public timestamp: string;
}