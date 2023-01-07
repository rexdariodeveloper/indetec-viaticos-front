import { Empleado } from './empleado';
import { Estado } from './estado';
import { Ciudad } from './ciudad';

export class SolicitudViatico {

    public id: number;
    public numeroSolicitud: string;
    public empleadoId: number;
    public empleado?: Empleado;
    public puestoId: number;
    public puesto: string;
    public cargoId: number;
    public cargo: string;
    public areaAdscripcionId: number;
    public areaAdscripcion: string;
    public ejercicio: number;
    public programaGobiernoId: string;
    public programaGobierno: string;
    public proyectoId: string;
    public proyecto: string;
    public ramoId: string;
    public ramo: string;
    public dependenciaId: string;
    public dependencia: string;
    public noOficio: string;
    public tipoViajeId: number;
    public tipoViaje: string;
    public tipoRepresentacionId: number;
    public tipoRepresentacion: string;
    public fechaSalida: Date;
    public fechaRegreso: Date;
    public duracionComision: string;
    public paisOrigenId: number;
    public estadoOrigenId: number;
    public ciudadOrigenId: number;
    public paisDestinoId: number;
    public estadoDestinoId: number;
    public estadoDestino?: Estado;
    public ciudadDestinoId: number;
    public ciudadDestino?: Ciudad;
    public gastoRepresentacionId?: number;
    public gastoRepresentacion?: string;
    public sugerencias?: string;
    public fechaInicioEvento: Date;
    public fechaFinEvento: Date;
    public duracionEvento: string;
    public motivo: string;
    public descripcionComision: string;
    public organizador: string;
    public linkEvento?: string;
    public archivoInformeId?: string;
    public estatusId: number;
    public autorizadoPorId?: number;
    public fechaAutorizacion?: string;
    public fechaCreacion: string;
    public creadoPorId: number;
    public fechaUltimaModificacion?: string;
    public modificadoPorId?: number;
    public timestamp: string;
}

export class SolicitudViaticoResumen {

    public id?: number;
    public numeroSolicitud: string;
    public solicitante?: string;
    public puesto?: string;
    public cargo?: string;
    public areaAdscripcionId: number;
    public areaAdscripcion?: string;
    public programaGobierno?: string;
    public proyecto?: string;
    public ramo?: string;
    public dependencia?: string;
    public noOficio?: string;
    public tipoViaje?: string;
    public tipoRepresentacion?: string;
    public fechaSalida?: string;
    public fechaRegreso?: string;
    public duracionComision?: string;
    public origen?: string;
    public destino?: string;
    public gastoRepresentacion?: string;
    public sugerencias?: string;
    public fechaInicioEvento?: string;
    public fechaFinEvento?: string;
    public duracionEvento?: string;
    public motivo?: string;
    public descripcionComision?: string;
    public organizador?: string;
    public linkEvento?: string;
    public estatusId: number;
    public empleadoId : number;
    public estatus : string;
    public numeroPolizaComprometido?:string;
    public numeroPolizaGastoPorComprobarId?:string;
    public numeroPolizaGastoComprobado?:string;
}


export class ListadoRevisionSolicitudViatico{
    public id?: number;
    public numeroSolicitud: string;
    public fechaSolicitud?: Date;
    public fechaViaje?: Date;
    public ciudadDestino?: string;
    public montoAsignado?: number;
    public montoTransferido?: number;
    public estatus?: string;
}