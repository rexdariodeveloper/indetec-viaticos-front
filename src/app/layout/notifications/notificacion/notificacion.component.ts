import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertaListadoProjection } from '@models/alerta';
import { ToastrService } from 'ngx-toastr';

@Component({
	selector: '[notificacion]',
	templateUrl: './notificacion.template.html'
})
export class Notificacion implements OnInit {

	@Input() notificacion: AlertaListadoProjection;

	constructor(
		private router: Router,
		private toastr: ToastrService,
	) { }

	ngOnInit() {
		jQuery(window.document).on('click', '.close', (e) => {
			e.preventDefault();
			return false;
		});
	}

	onClick() {
		if (this.notificacion.rutaAccion) {
			this.router.navigateByUrl(this.notificacion.rutaAccion);
		} else {
			this.toastr.info('La alerta no tiene ruta de acción');
		}
	}
}
