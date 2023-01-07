import { Pais } from './pais';
import { Estado } from './estado';
import { Listado_CMM } from './listado_cmm';

export class Ciudad {

    public id?: number;
    public estadoId?: number;
    public estado?: Estado;
    public paisId?: number;
    public pais?: Pais;
    public nombre?: string;
    public zonaEconomicaId?: number;
    public zonaEconomica?: Listado_CMM;
    public estatusId?: number;
    public fechaCreacion?: string;
    public creadoPorId?: number;
    public fechaUltimaModificacion?: string;
    public modificadoPorId?: number;
    public timestamp?: string;
    public modificado?: boolean;
}

export class CiudadMap {
	[key:number]: Ciudad;
}