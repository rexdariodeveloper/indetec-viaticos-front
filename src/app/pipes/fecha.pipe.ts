import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
moment.locale('es');

@Pipe({ name: 'FechaPipe' })
export class FechaPipe implements PipeTransform {
	transform(fecha: number | string | Date, mostrarHoras?: boolean, mostrarSegundos?: boolean): string {
		let fechaFormato: string = '';
		let formato = 'MMMM DD, YYYY' + (mostrarHoras ? ' h:mm' + (mostrarSegundos ? ':ss' : '') + ' A' : '');
		let fechaMoment: moment.Moment = moment(fecha);
		if (fechaMoment.isValid()) {
			fechaFormato = fechaMoment.format(formato);
			return fechaFormato.charAt(0).toUpperCase() + fechaFormato.slice(1);
		} else {
			return '';
		}
	}
}