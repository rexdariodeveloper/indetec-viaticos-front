import { Pipe, PipeTransform } from '@angular/core';
import { EditarAlertaConfiguracionProjection } from '@models/alerta_configuracion';
import { ListadoCMM } from '@models/mapeos/listadoCMM';

@Pipe({name: 'GetCheckedPipe'})
export class GetCheckedPipe implements PipeTransform {
    transform(row: any, selected: any[]): boolean {
        let item = selected.filter(e => e.selectId == row.selectId);
        return item.length > 0;
    }
}