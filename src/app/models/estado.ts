import { Pais } from './pais';

export class Estado {

    public id?: number;
    public paisId?: number;
    public pais?: Pais;
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

export class EstadoMap {
	[key:number]: Estado;
}