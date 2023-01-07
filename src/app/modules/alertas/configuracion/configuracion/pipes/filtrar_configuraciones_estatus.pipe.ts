import { Pipe, PipeTransform } from '@angular/core';
import { EditarAlertaConfiguracionProjection } from '@models/alerta_configuracion';
import { ListadoCMM } from '@models/mapeos/listadoCMM';

@Pipe({name: 'FiltrarConfiguracionesEstatusPipe'})
export class FiltrarConfiguracionesEstatusPipe implements PipeTransform {
    transform(configuraciones: EditarAlertaConfiguracionProjection[] = []): EditarAlertaConfiguracionProjection[] {
        return configuraciones.filter(configuracion => {
            return configuracion.estatusId != ListadoCMM.EstatusRegistro.BORRADO;
        });
    }
}