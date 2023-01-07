import { Pipe, PipeTransform } from '@angular/core';
import { ListadoEsquemaFormato } from '@models/listado_esquema_formato';

@Pipe({ name: 'FiltrarListadoEsquemaFormatoVisiblePipe' })
export class FiltrarListadoEsquemaFormatoVisiblePipe implements PipeTransform {
    transform(formato: ListadoEsquemaFormato[] = []): ListadoEsquemaFormato[] {
        return formato.filter(registro => {
            return registro.visible;
        });
    }
}