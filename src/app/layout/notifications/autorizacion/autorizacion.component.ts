import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';

import { AlertaService } from '../../../services/alerta.service';
import { HttpService } from '../../../services/http.service';

import { JsonResponse } from '../../../models/json_response';
import { AlertaListadoProjection } from '@models/alerta';
import { Router } from '@angular/router';

@Component({
	selector: '[autorizacion]',
	templateUrl: './autorizacion.template.html'
})
export class Autorizacion implements OnInit {

	@Input() autorizacion: AlertaListadoProjection;
	@Output() onModal = new EventEmitter();

	constructor( private router : Router
	){
	}

	ngOnInit(){
		jQuery(window.document).on('click', '.close', (e) => {
			e.preventDefault();
			return false;
		});
	}

	ngOnDestroy(){
	}

	onClick(){
		this.router.navigateByUrl(this.autorizacion.rutaAccion);
	}

}
