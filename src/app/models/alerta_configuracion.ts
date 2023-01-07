import { ListadoCMM } from './mapeos/listadoCMM';
import { AlertaEtapaAccion, ConfigurarAlertaEtapaAccionProjection } from './alerta_etapa_accion';
import { Empleado, ComboEmpleadoProjection } from './empleado';
import { ComboListadoCMMProjection } from './listado_cmm';

export class AlertaConfiguracion {

    public id?: number;
    public etapaAccionId?: number;
    public etapaAccion?: AlertaEtapaAccion;
    public empleadoId?: number;
    public empleado?: Empleado;
    public figuraId?: number;
    public figura?: ListadoCMM;
    public tipoNotificacionId?: number;
    public tipoNotificacion?: ListadoCMM;
    public enPlataforma?: boolean;
    public enCorreoElectronico?: boolean;
    public estatusId?: number;
    public estatus?: ListadoCMM;
    public fechaCreacion?: string;
    public creadoPorId?: number;
    public CreadoPor?: Empleado;
    public fechaUltimaModificacion?: string;
    public modificadoPorId?: number;
    public modificadoPor?: Empleado;
    public timestamp?: string;

}

export class EditarAlertaConfiguracionProjection {

    id?: number;
    etapaAccion?: ConfigurarAlertaEtapaAccionProjection;
    empleado?: ComboEmpleadoProjection;
    figura?: ComboListadoCMMProjection;
    tipoNotificacion?: ComboListadoCMMProjection;
    enPlataforma?: boolean;
    enCorreoElectronico?: boolean;
    estatusId?: number;
    timestamp?: string;

}