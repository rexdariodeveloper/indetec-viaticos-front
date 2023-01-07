import { Listado_CMM, ComboListadoCMMProjection } from './listado_cmm';

export class AlertaEtapaAccion {
    id?: number;
    etapaId?: number;
    etapa?: Listado_CMM;
    accionId?: number;
    accion?: Listado_CMM;
    permiteAutorizacion?: boolean;
    permiteNotificacion?: boolean;
    timestamp?: string;
}

/************************/
/***** Proyecciones *****/
/************************/

export class ConfigurarAlertaEtapaAccionProjection{
    id?: number;
    etapa?: ComboListadoCMMProjection;
    accion?: ComboListadoCMMProjection;
    permiteAutorizacion?: boolean;
    permiteNotificacion?: boolean;
}