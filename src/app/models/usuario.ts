import { Empleado } from './empleado';
import { Rol } from './rol';
import { ListadoCMM } from './mapeos/listadoCMM';

export class Usuario {
    public id: string;
    public usuario: string;
    public contrasenia? : string;
    public empleado : Empleado;
    public empleadoId : number;
    public rolId : number;
    public estatusId : number;
    public fechaCreacion : Date;
    public creadoPorId : number;
    public fechaUltimaModificacion? : Date;
    public modificadoPorId? : number;
    public timestamp : string;

    public token : string;
    public athid : string;

    public confirmContrasenia : string;
    public rol: Rol;


    constructor(usuario?)
    {
        usuario = usuario || {};
        this.id = usuario.id || usuario.usuarioId || null;
        this.usuario = usuario.usuario || '';
        this.contrasenia = usuario.contrasenia || '';
        this.empleado = usuario.empleado || Empleado;
        this.empleadoId = usuario.empleadoId || null;
        this.rolId = usuario.rolId || null;
        this.estatusId = usuario.estatusId || ListadoCMM.EstatusRegistro.ACTIVO;
        this.fechaCreacion = usuario.fechaCreacion || '';
        this.creadoPorId = usuario.creadoPorId || null;
        this.fechaUltimaModificacion = usuario.fechaUltimaModificacion || '';
        this.modificadoPorId = usuario.modificadoPorId || null;
        this.timestamp = usuario.timestamp || ''; 
    }
    
}