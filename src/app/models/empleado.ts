import { ListadoCMM } from './mapeos/listadoCMM';
import { Organigrama } from './organigrama';
import { ListadoPuesto } from './listado_puesto';
import { ListadoCargo } from './listado_cargo';
import { Archivo } from './archivo';

export class Empleado {

    public id?: number;
    public numeroEmpleado?: string;
    public nombre?: string;
    public primerApellido?: string;
    public segundoApellido?: string;
    public tipoEmpleadoId?: number;
    public areaAdscripcionId?: number;
    public areaAdscripcion?: Organigrama;
    public puestoId?: number;
    public puesto?: ListadoPuesto;
    public cargoId?: number;
    public cargo?: ListadoCargo;
    public emailInstitucional?: string;
    public emailPersonal?: string;
    public fotografia?: string;
    public rfc?: string;
    public catalogoCuentaId?: number;
    public cuenta?: string;
    public nombreCuenta?: string;
    public estatusId?: number;
    public fechaCreacion?: Date;
    public creadoPorId?: number;
    public fechaUltimaModificacion?: Date;
    public modificadoPorId?: number;
    public timestamp?: string;

    public nombreArchivoTemporal?: string;
    public archivoFotografia?: Archivo;
    public fotografiaEliminada?: boolean;
    public crearSolicitudesTerceros?: boolean;
    public visualizarSolicitudesTerceros?: boolean;
    public listadoOrganigrama?: number[];

    constructor(empleado?) {
        empleado = empleado || {};
        this.id = empleado.id || empleado.empleadoId || null;
        this.numeroEmpleado = empleado.numeroEmpleado || '';
        this.nombre = empleado.nombre || '';
        this.primerApellido = empleado.primerApellido || '';
        this.segundoApellido = empleado.segundoApellido || null;
        this.tipoEmpleadoId = empleado.tipoEmpleadoId || null;
        this.areaAdscripcionId = empleado.areaAdscripcionId || null;
        this.puestoId = empleado.puestoId || null;
        this.cargoId = empleado.cargoId || null;
        this.emailInstitucional = empleado.emailInstitucional || '';
        this.emailPersonal = empleado.emailPersonal || '';
        this.fotografia = empleado.fotografia || null;
        this.rfc = empleado.rfc || '';
        this.catalogoCuentaId = empleado.catalogoCuentaId || null;
        this.cuenta = empleado.cuenta || '';
        this.nombreCuenta = empleado.nombreCuenta || '';
        this.estatusId = empleado.estatusId || ListadoCMM.EstatusRegistro.ACTIVO;
        this.timestamp = empleado.timestamp || '';
        
        this.nombreArchivoTemporal = empleado.nombreArchivoTemporal || null;
        this.fotografiaEliminada = empleado.fotografiaEliminada || false;
        this.crearSolicitudesTerceros = empleado.crearSolicitudesTerceros || false;
        this.visualizarSolicitudesTerceros = empleado.visualizarSolicitudesTerceros || false;
    }
}

export class ComboEmpleadoProjection {
    id?: number;
    nombre?: string;
    primerApellido?: string;
    segundoApellido?: string;
}

export class ComboEmpleadoSolicitudProjection {
    public id?: number;
    public nombre?: string;
    public puestoId?: number;
    public puesto?: string;
    public cargoId?: number;
    public cargo?: string;
    public areaAdscripcionId?: number;
    public areaAdscripcion?: string;
    public fotografia?: string;
}