import { Component, OnDestroy, ViewEncapsulation, OnInit } from '@angular/core';
import { GenericComponent } from 'app/modules/base/generic.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertasConfiguracionComponentService } from './configuracion.service';
import { Subject, Subscription } from 'rxjs';
import { ComboListadoCMMProjection } from '@models/listado_cmm';
import { ConfigurarAlertaEtapaAccionProjection } from '@models/alerta_etapa_accion';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';
import { ComboEmpleadoProjection } from '@models/empleado';
import { ListadoCMM } from '@models/mapeos/listadoCMM';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AlertaConfiguracion, EditarAlertaConfiguracionProjection } from '@models/alerta_configuracion';
import { SelectionType } from '@swimlane/ngx-datatable';

interface EmpleadoFigura {
	id: string;
	figuraId: number;
	empleadoId: number;
	nombre: string;
}

interface EditarAlertaConfiguracionProjectionConSelect extends EditarAlertaConfiguracionProjection {
	selectId: number;
}

@Component({
	selector: 'alertas-configuracion',
	templateUrl: './configuracion.component.html',
	styleUrls: ['./configuracion.component.scss']
})
export class AlertasConfiguracionComponent extends GenericComponent implements OnInit, OnDestroy {

	TipoNotificacion = ListadoCMM.TipoNotificacion;

	// Models
	private unsubscribeAll: Subject<any>;
	private selected = [];
    private SelectionType = SelectionType;

	bloquearEtapas: boolean = false;

	generalSelect2Options: Select2Options = {
		theme: 'bootstrap'
	};

	private onErrorSubscribe: Subscription = null;
	private onDatosChangedSubscribe: Subscription = null;
	private onEtapaAccionesChangedSubscribe: Subscription = null;
	private onConfiguracionesChangedSubscribe: Subscription = null;
	private onGuardarChangedSubscribe: Subscription = null;
	private onEliminarChangedSubscribe: Subscription = null;

	listadoEtapas: ComboListadoCMMProjection[] = [];
	etapaSeleccionadaId: number = null;

	listadoFiguras: ComboListadoCMMProjection[] = [];
	figurasMap: { [key: string]: ComboListadoCMMProjection } = {}
	listadoEmpleados: ComboEmpleadoProjection[] = [];
	empleadosMap: { [key: string]: ComboEmpleadoProjection } = {}
	listadoEmpleadosFiguras: EmpleadoFigura[] = [];
	empleadoFiguraSeleccionado: EmpleadoFigura = null;

	listadoEtapaAcciones: ConfigurarAlertaEtapaAccionProjection[] = [];
	etapaAccionesMap: { [key: string]: ConfigurarAlertaEtapaAccionProjection } = {}
	accionSeleccionada: ConfigurarAlertaEtapaAccionProjection = null;

	listadoConfiguraciones: EditarAlertaConfiguracionProjectionConSelect[] = [];
	configuracionSeleccionada: EditarAlertaConfiguracionProjectionConSelect = null;
	configuracionesColumns = [];

	listadoTiposNotificacion: ComboListadoCMMProjection[] = [];
	tiposNotificacionMap: { [key: string]: ComboListadoCMMProjection } = {};

	accionForm: FormGroup;
	accionFormControl: FormControl;
	empleadoFormControl: FormControl;
	tipoAlertaFormControl: FormControl;
	plataformaFormControl: FormControl;
	correoElectronicoFormControl: FormControl;
	mostrarErroresForm: boolean = false;
	tableOffset = 0;

	private configuracionesActualizar: AlertaConfiguracion[] = [];

	private siguienteSelectId: number = 0;

	private configuracionesEditarSelectIds: number[] = [];

	constructor(
		private _spinner: NgxSpinnerService,
		private _alertasConfiguracionComponentService: AlertasConfiguracionComponentService,
		private _toastr: ToastrService,
		private formBuilder: FormBuilder
	) {
		super();
		this.unsubscribeAll = new Subject();
	}	

	ngOnInit(): void {
		this.inicializarBehaviorSubjects();
		this.createAccionForm();
		this._alertasConfiguracionComponentService.getDatosFicha();
	}

	ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this.unsubscribeAll.next();
		this.unsubscribeAll.complete();
	}

	// Clean data
	cleanData(): void{
		// Clean Listado Configuraciones
		this.listadoConfiguraciones = [];
	}

	cancelar() {
		this.onSeleccionarEtapa(null);
	}

	eliminar(): boolean {
		return false;
	}

	validarForm(): boolean {
		for (var i in this.accionForm.controls)
			this.accionForm.controls[i].markAsTouched();
			
		return this.accionForm.valid && (this.plataformaFormControl.value || this.correoElectronicoFormControl.value);
	}

	inicializarBehaviorSubjects() {
		if (!this.onErrorSubscribe) {
			this.onErrorSubscribe = this._alertasConfiguracionComponentService.onError.pipe(takeUntil(this.unsubscribeAll)).subscribe(jsonResponseError => {
				if (!!jsonResponseError) {
					this._spinner.hide();
					this._toastr.error(jsonResponseError.message);
				}
			});
		}
		if (!this.onDatosChangedSubscribe) {
			this.onDatosChangedSubscribe = this._alertasConfiguracionComponentService.onDatosChanged.pipe(takeUntil(this.unsubscribeAll)).subscribe(actualizar => {
				if (actualizar) {
					this.listadoEtapas = this._alertasConfiguracionComponentService.jsonDatosFicha.etapas;
					this.listadoEmpleados = this._alertasConfiguracionComponentService.jsonDatosFicha.empleados;
					this.listadoFiguras = this._alertasConfiguracionComponentService.jsonDatosFicha.figuras;
					this.listadoTiposNotificacion = this._alertasConfiguracionComponentService.jsonDatosFicha.tiposNotificacion;

					this.figurasMap = {};
					this.empleadosMap = {};

					this.listadoEmpleadosFiguras = this.listadoFiguras.map((figura): EmpleadoFigura => {
						this.figurasMap[figura.id] = figura;
						return {
							id: 'f-' + figura.id,
							figuraId: figura.id,
							empleadoId: null,
							nombre: figura.valor
						};
					}).concat(this.listadoEmpleados.map((empleado): EmpleadoFigura => {
						this.empleadosMap[empleado.id] = empleado;
						return {
							id: 'e-' + empleado.id,
							figuraId: null,
							empleadoId: empleado.id,
							nombre: empleado.nombre + ' ' + empleado.primerApellido + (
								!!empleado.segundoApellido
									? (' ' + empleado.segundoApellido)
									: ''
							)
						};
					}));

					this.tiposNotificacionMap = {};
					this.listadoTiposNotificacion.forEach(tipoNotificacion => {
						this.tiposNotificacionMap[tipoNotificacion.id] = tipoNotificacion;
					});
				}
			});
		}
		if (!this.onEtapaAccionesChangedSubscribe) {
			this.onEtapaAccionesChangedSubscribe = this._alertasConfiguracionComponentService.onEtapaAccionesChanged.pipe(takeUntil(this.unsubscribeAll)).subscribe(actualizar => {
				if (actualizar) {
					this.listadoEtapaAcciones = this._alertasConfiguracionComponentService.listadoEtapaAcciones;
					this.etapaAccionesMap = {};
					this.listadoEtapaAcciones.forEach((etapaAccion) => {
						this.etapaAccionesMap[String(etapaAccion.id)] = etapaAccion;
					});
					this.configuracionesActualizar = [].concat(this.listadoEtapaAcciones);
					this._spinner.hide();
				}
			});
		}
		if (!this.onConfiguracionesChangedSubscribe) {
			this.onConfiguracionesChangedSubscribe = this._alertasConfiguracionComponentService.onConfiguracionesChanged.pipe(takeUntil(this.unsubscribeAll)).subscribe(actualizar => {
				if (actualizar) {
					this.listadoConfiguraciones = this._alertasConfiguracionComponentService.listadoConfiguraciones.map(configuracion => {
						return {
							selectId: this.getSiguienteSelectId(),
							...configuracion
						};
					});
					this.bloquearEtapas = false;
					this.selected = [];
					this._spinner.hide();
				}
			});
		}
		if (!this.onGuardarChangedSubscribe) {
			this.onGuardarChangedSubscribe = this._alertasConfiguracionComponentService.onGuardarChanged.pipe(takeUntil(this.unsubscribeAll)).subscribe(actualizar => {
				if (actualizar) {
					this.limpiarFormAccion();
					this.listadoConfiguraciones = []
					this.configuracionesActualizar = []
					this._alertasConfiguracionComponentService.buscarConfiguracionesPorEtapa(this.etapaSeleccionadaId);
				}
			});
		}
		if (!this.onEliminarChangedSubscribe) {
			this.onEliminarChangedSubscribe = this._alertasConfiguracionComponentService.onEliminarChanged.pipe(takeUntil(this.unsubscribeAll)).subscribe(actualizar => {
				if (actualizar) {
					this.selected = [];
					this._alertasConfiguracionComponentService.buscarConfiguracionesPorEtapa(this.etapaSeleccionadaId);
				}
			});
		}
	}

	//Titulos en las etapas
	titleEtapas(etapaId:number){

		if(etapaId==1000026)//SOLICITUD NUEVA
		{
			return 'Actores involucrados Jefe Inmediato registrado en el organigrama y opcionalmente cualquier otro usuario que requiera Autorizar Solicitudes o ser noficado.';
		}if(etapaId==1000027)//VALIDACIÓN JEFE INMEDIATO
		{
			return 'Actores involucrados Recursos Materiales, Solicitante y opcionalmente cualquier otro usuario que se requiera notificar.';
		}if(etapaId==1000028)
		{
			return 'Actores involucrados Tesorería, Solicitante, Jefe Inmediato registrado en el organigrama y opcionalmente cualquier otro usuario que se requiera notificar.';
		}if(etapaId==1000029)
		{
			return 'Actores involucrados Tesorería, Recursos Materiales, Jefe Inmediato registrado en el organigrama  y opcionalmente cualquier otro usuario que se requiera notificar.';
		}if(etapaId==1000030)
		{
			return 'Actores involucrados Jefe Inmediato registrado en el organigrama, Solicitante, Recursos Materiales, Tesoriría y opcionalmente cualquier otro usuario que se requiera notificar.';
		}				
		else{
			return "";
		}

	}

	//Titulos a cada opcion de las acciones
	titleAcciones(itemOption:any){		
		if(this.etapaSeleccionadaId==1000026)//NUEVO
		{
			
			if(itemOption.id == 1000031)//ENVIAR
			{
				return "Enviar Solicitud a Jefe Inmediato u otro usuario para su autorización";
			}else if(itemOption.id == 1000032)//CANCELAR
			{
				return "Notificar a Jefe Inmediato u otro usuario la cancelacíon de la Solicitud";
			}else{
				return "";
			}

		}else if(this.etapaSeleccionadaId==1000027)//VALIDACION JEFE INMEDIATO
		{
			if(itemOption.id == 1000033)//AUTORIZAR
			{
				return "Notificar a Recursos Materiales y Solicitante que fue autorizada la Solicitud";
			}else if(itemOption.id == 1000034)//RECHAZAR
			{
				return "Notificar a Solicitante que la Solicitud no procede y fue cancelada";
			}else if(itemOption.id == 1000036)//REVISION
			{
				return "Enviar la Solicitud a Revisión con el Solicitante";
			}else{
				return "";
			}

		}else if(this.etapaSeleccionadaId==1000028)//RECURSOS MATERIALES ASIGNACIÓN
		{
			if(itemOption.id == 1000035)//ASIGNAR VIATICOS
			{
				return "Notificar a Tesorería y Solicitante que el Gasto esta comprometido";
			}else if(itemOption.id == 1000036)//REVISION
			{
				return "Enviar la Solicitud a Revisión con el Solicitante";
			}else{
				return "";
			}

		}else if(this.etapaSeleccionadaId==1000029)//INFORME Y COMPROBACION
		{
			if(itemOption.id == 1000037)//FINALIZAR
			{
				return 'Notificar a Recursos Materiales, Solicitante y Tesorería que la comprobación fue Finalizada "Primero debe finalizar la comprobacion Recursos Materiales y despues el Solicitante';
			}else if(itemOption.id == 1000031)//ENVIAR
			{
				return "Notificar a Tesorería que la comprobación fue finalizada";
			}else{
				return "";
			}

		}else if(this.etapaSeleccionadaId==1000030)//REVISION TESORERIA
		{
			if(itemOption.id == 1000037)//FINALIZAR
			{
				return 'Notificar al Solicitante y/o cualquier otro usuario que la comprobación es aceptada"';
			}else if(itemOption.id == 1000038)//ENVIAR AUTORIZAR
			{
				return "Enviar al Jefe Inmediato del Solicitante que autorice una comprobación que excede los montos de los Víaticos asignados";
			}else if(itemOption.id == 1000039)//GASTO AUTORIZADO
			{
				return "Notificar a Tesorería y/o Solicitante que el Jefe Inmediato del Solicitante autoriza la comprobación con montos excedentes en los Víaticos asignado";
			}else if(itemOption.id == 1000040)//VALIDACION REVISION
			{
				return "Notificar Recursos Materiales y Solicitante se revise la comprobación porque hay mayor Gasto Comprobado de lo asignado";
			}else{
				return "";
			}

		}
		else{
			return "";
		}


	}

	onSeleccionarEtapa(etapaId: number) {
		this.etapaSeleccionadaId = etapaId;
		this.limpiarFormAccion();
		if (this.etapaSeleccionadaId) {
			this._spinner.show();

			// Clean Data
			this.cleanData();

			this._alertasConfiguracionComponentService.buscarAccionesPorEtapa(this.etapaSeleccionadaId);
			this._alertasConfiguracionComponentService.buscarConfiguracionesPorEtapa(this.etapaSeleccionadaId);
		} else {
			this.bloquearEtapas = false;
			this.listadoEtapaAcciones = [];
			this.configuracionesEditarSelectIds = [];
		}
	}

	onAccionSelect2(accionSeleccionada: ConfigurarAlertaEtapaAccionProjection) {
		this.accionSeleccionada = accionSeleccionada;
		this.tipoAlertaFormControl.setValue(null);
		this.plataformaFormControl.setValue(false);
		this.correoElectronicoFormControl.setValue(false);
	}

	onEmpleadoSelect2(empleadoSeleccionado: EmpleadoFigura) {
		this.empleadoFiguraSeleccionado = empleadoSeleccionado;
	}

	createAccionForm() {
		this.accionFormControl = new FormControl(null, [Validators.required]);
		this.empleadoFormControl = new FormControl(null, [Validators.required]);
		this.tipoAlertaFormControl = new FormControl(null, [Validators.required]);
		this.plataformaFormControl = new FormControl(false, []);
		this.correoElectronicoFormControl = new FormControl(false, []);
		this.accionForm = this.formBuilder.group({
			accion: this.accionFormControl,
			empleado: this.empleadoFormControl,
			tipoAlerta: this.tipoAlertaFormControl,
			plataforma: this.plataformaFormControl,
			correoElectronico: this.correoElectronicoFormControl
		});
	}

	agregar() {
		this.mostrarErroresForm = true;
		if (!this.validarForm()) {
			return;
		}
		this.bloquearEtapas = true;
		if (!!this.configuracionSeleccionada) {
			this.tableOffset = 0;
			for (let i = 0; i < this.listadoConfiguraciones.length; i++) {
				let configuracion: EditarAlertaConfiguracionProjectionConSelect = this.listadoConfiguraciones[i];
				if (
					this.configuracionSeleccionada.selectId != (configuracion.selectId || null)
					&& configuracion.etapaAccion.id == this.accionFormControl.value
					&& configuracion.estatusId != ListadoCMM.EstatusRegistro.BORRADO
					&& ((configuracion.empleado || {}).id || null) == this.empleadoFiguraSeleccionado.empleadoId
					&& ((configuracion.figura || {}).id || null) == this.empleadoFiguraSeleccionado.figuraId
					&& (configuracion.tipoNotificacion.id == this.tipoAlertaFormControl.value)
				) {
					this._toastr.warning('Ya existe una configuración con la combinación de acción y empleado seleccionados');
					return;
				}
			}
			this.configuracionSeleccionada.etapaAccion = this.accionSeleccionada;
			this.configuracionSeleccionada.empleado = this.empleadosMap[this.empleadoFiguraSeleccionado.empleadoId];
			this.configuracionSeleccionada.figura = this.figurasMap[this.empleadoFiguraSeleccionado.figuraId];
			this.configuracionSeleccionada.tipoNotificacion = this.tiposNotificacionMap[this.tipoAlertaFormControl.value];
			this.configuracionSeleccionada.enPlataforma = this.plataformaFormControl.value || false;
			this.configuracionSeleccionada.enCorreoElectronico = this.correoElectronicoFormControl.value || false;
			this.configuracionesEditarSelectIds = this.configuracionesEditarSelectIds.concat(this.configuracionSeleccionada.selectId);
			this.listadoConfiguraciones = [].concat(this.listadoConfiguraciones);
		} else {
			for (let i = 0; i < this.listadoConfiguraciones.length; i++) {
				let configuracion: EditarAlertaConfiguracionProjectionConSelect = this.listadoConfiguraciones[i];
				if (
					configuracion.etapaAccion.id == this.accionFormControl.value
					&& configuracion.estatusId != ListadoCMM.EstatusRegistro.BORRADO
					&& ((configuracion.empleado || {}).id || null) == this.empleadoFiguraSeleccionado.empleadoId
					&& ((configuracion.figura || {}).id || null) == this.empleadoFiguraSeleccionado.figuraId
					&& (configuracion.tipoNotificacion.id == this.tipoAlertaFormControl.value)
				) {
					this._toastr.warning('Ya existe una configuración con la combinación de acción y empleado seleccionados');
					return;
				}
			}
			let configuracionGuardar: AlertaConfiguracion = {
				id: null,
				etapaAccionId: this.accionFormControl.value,
				etapaAccion: this.accionSeleccionada,
				empleadoId: this.empleadoFiguraSeleccionado.empleadoId,
				empleado: this.empleadosMap[this.empleadoFiguraSeleccionado.empleadoId],
				figuraId: this.empleadoFiguraSeleccionado.figuraId,
				figura: this.figurasMap[this.empleadoFiguraSeleccionado.figuraId],
				tipoNotificacionId: this.tipoAlertaFormControl.value,
				tipoNotificacion: this.tiposNotificacionMap[this.tipoAlertaFormControl.value],
				enPlataforma: this.plataformaFormControl.value || false,
				enCorreoElectronico: this.correoElectronicoFormControl.value || false
			};
			let selectId = this.getSiguienteSelectId();
			this.listadoConfiguraciones.unshift({ selectId, ...configuracionGuardar });
			this.listadoConfiguraciones = [...this.listadoConfiguraciones];
			//this.listadoConfiguraciones = this.listadoConfiguraciones.concat({ selectId, ...configuracionGuardar });
			this.configuracionesEditarSelectIds = this.configuracionesEditarSelectIds.concat(selectId);
			this.configuracionesActualizar = this.configuracionesActualizar.concat(configuracionGuardar);
		}
		this.limpiarFormAccion();
	}

	limpiarFormAccion() {
		if (this.accionFormControl) {

			this.accionFormControl.setValue(null);
			this.accionSeleccionada = null;
			this.empleadoFormControl.setValue(null);
			this.empleadoFiguraSeleccionado = null;
			this.tipoAlertaFormControl.setValue(null);
			this.plataformaFormControl.setValue(false);
			this.correoElectronicoFormControl.setValue(false);
			this.accionForm.markAsUntouched();
			this.mostrarErroresForm = false;
			this.configuracionSeleccionada = null;
		}
	}

	llenarFormAccion() {
		this.accionFormControl.setValue(this.configuracionSeleccionada.etapaAccion.id);
		this.accionSeleccionada = this.configuracionSeleccionada.etapaAccion;
		this.empleadoFiguraSeleccionado = {
			id: !!this.configuracionSeleccionada.empleado
				? ('e-' + this.configuracionSeleccionada.empleado.id)
				: 'f-' + this.configuracionSeleccionada.figura.id,
			empleadoId: (this.configuracionSeleccionada.empleado || {}).id || null,
			figuraId: (this.configuracionSeleccionada.figura || {}).id || null,
			nombre: (this.configuracionSeleccionada.figura || {}).valor || (
				this.configuracionSeleccionada.empleado.nombre + ' ' + this.configuracionSeleccionada.empleado.primerApellido + (
					this.configuracionSeleccionada.empleado.segundoApellido
						? (' ' + this.configuracionSeleccionada.empleado.segundoApellido)
						: ''
				)
			)
		};
		this.empleadoFormControl.setValue(this.empleadoFiguraSeleccionado.id);
		this.tipoAlertaFormControl.setValue(this.configuracionSeleccionada.tipoNotificacion.id);
		this.plataformaFormControl.setValue(this.configuracionSeleccionada.enPlataforma);
		this.correoElectronicoFormControl.setValue(this.configuracionSeleccionada.enCorreoElectronico);
		this.accionForm.markAsTouched();
	}

	guardar(): boolean {
		this._spinner.show();
		let configuracionesActualizar = this.listadoConfiguraciones.filter((configuracion: EditarAlertaConfiguracionProjectionConSelect) => {
			return this.configuracionesEditarSelectIds.includes(configuracion.selectId);
		}).map((configuracion: EditarAlertaConfiguracionProjectionConSelect) => {
			return this.editarAlertaConfiguracionProjectionConSelectToAlertaConfig(configuracion);
		});
		this._alertasConfiguracionComponentService.guardar(configuracionesActualizar);
		return true;
	}

	editarAlertaConfiguracionProjectionConSelectToAlertaConfig(configuracion: EditarAlertaConfiguracionProjectionConSelect): AlertaConfiguracion {
		let configEdit: any = { ...configuracion };
		configEdit.etapaAccionId = configuracion.etapaAccion.id;
		delete configEdit.etapaAccion;
		configEdit.tipoNotificacionId = configuracion.tipoNotificacion.id;
		delete configEdit.tipoNotificacion;
		configEdit.empleadoId = (configuracion.empleado || {}).id || null;
		delete configEdit.empleado;
		configEdit.figuraId = (configuracion.figura || {}).id || null;
		delete configEdit.figura;
		delete configEdit.selectId;
		return configEdit;
	}

	borrar() {
		this._spinner.show();
		this.bloquearEtapas = true;
		this.selected.forEach((configuracion: EditarAlertaConfiguracionProjectionConSelect) => {
			this.configuracionesEditarSelectIds = this.configuracionesEditarSelectIds.concat(configuracion.selectId);
			configuracion.estatusId = ListadoCMM.EstatusRegistro.BORRADO;
		});
		this.selected = [];
		let listadoConfiguraciones = [].concat(this.listadoConfiguraciones);
		this.listadoConfiguraciones = [];
		setTimeout(() => {
			this.listadoConfiguraciones = [].concat(listadoConfiguraciones);
			this._spinner.hide();
		});
	}

	getSiguienteSelectId() {
		this.siguienteSelectId++;
		return this.siguienteSelectId;
	}

	// Seleccionar todos los registros
    onSelectAll() {
        this.selected = this.listadoConfiguraciones.length == this.selected.length ? [] : [...this.listadoConfiguraciones];
        // this.createEstadoForm(null);
    }

    // Seleccionar registro
    onSelect(row: any): void {
        if (!this.getChecked(row)) {
            this.selected.push(row);
        } else {
            this.selected = this.selected.filter(registro => {
                return registro.id != row.id;
            });
        }
        // this.createEstadoForm(null);
    }

    // Verificar si está seleccionado
    getChecked(row: any): boolean {
        const item = this.selected.filter(e => e.id == row.id);
        return item.length > 0;
	}
	
	// Editar registro
    onActivate(event) {
        if (event.type === "dblclick") {
            // let estado = this.crearEstado(event.row);
			// this.createEstadoForm(estado);
			this.configuracionSeleccionada = event.row;
			this.llenarFormAccion();
        }
	}

	onPageChange(event) {
		this.tableOffset = event.offset;
	}

	disableCheck(event) {
        if(this.tipoAlertaFormControl.value == this.TipoNotificacion.AUTORIZACION) {
            event.target.checked = true;
        }
	}
}
