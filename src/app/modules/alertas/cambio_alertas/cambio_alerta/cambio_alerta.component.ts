import { GenericComponent } from 'app/modules/base/generic.component';
import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { CambioAlerta } from '@models/cambio_alerta';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CambioAlertaComponentService } from './cambio_alerta.service';
import { takeUntil } from 'rxjs/operators';
import { GenericService } from '@services/generic.service';
import { NgOption } from '@ng-select/ng-select';
import { DateTimeAdapter } from 'ng-pick-datetime';
declare let jQuery: any;

@Component({
    selector: 'cambio_alerta',
    templateUrl: './cambio_alerta.component.html',
    styleUrls: ['./cambio_alerta.component.scss']
})
export class CambioAlertaComponent extends GenericComponent implements AfterViewInit, OnInit, OnDestroy {

    @ViewChild('deshacerModal', null) deshacerModal;

    // URL
    private URL_CAMBIO_ALERTAS: string = 'app/alertas/cambio_alertas/';

    // Variables
    public minFechaInicio: Date = this.getDate();
    public minFechaFin: Date = this.getDate();
    private cambioAlerta: CambioAlerta;
    public pageType: string;
    private unsubscribeAll: Subject<any>;

    // Variables de control
    public mostrarErroresForm: boolean = false;
    private fechaActualInicio: number;
    private fechaActualFin: number;

    // Models
    public listadoEmpleadosOrigen: NgOption[] = [];
    public listadoEmpleadosDestino: NgOption[] = [];

    //Forms
    datosForm: FormGroup;
    mySubscription: any;

    constructor(private spinner: NgxSpinnerService,
        private service: CambioAlertaComponentService,
        private toastr: ToastrService,
        private formBuilder: FormBuilder,
        private router: Router,
        private dateTimeAdapter: DateTimeAdapter<any>
    ) {
        super();

        // Date Time Adapter Locale In Mexico
        dateTimeAdapter.setLocale('es-MX');

        // Set the private defaults
        this.unsubscribeAll = new Subject();

        // this.router.routeReuseStrategy.shouldReuseRoute = function () {
        //     return false;
        // };

        this.mySubscription = this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                // Trick the Router into believing it's last link wasn't previously loaded
                this.router.navigated = false;
            }
        });
    }

    ngOnInit(): void {
        //Mostramos el spinner
        this.spinner.show();

        // Subscribe to update on changes
        this.service.onChanged.pipe(takeUntil(this.unsubscribeAll))
            .subscribe(response => {
                let jsonDatosFicha = this.service.jsonDatosFicha;
                if (jsonDatosFicha) {

                    //Si se recibe objeto, quiere decir que vamos a editarlo
                    if (jsonDatosFicha.cambioAlerta) {
                        //Asignamos el objeto a editar
                        this.cambioAlerta = jsonDatosFicha.cambioAlerta;

                        //Agregamos validaciones para las fechas
                        this.minFechaFin = new Date(this.cambioAlerta.fechaInicio);

                        this.pageType = 'edit';
                    }
                    //De lo contrario, es un registro nuevo
                    else {
                        this.cambioAlerta = new CambioAlerta();
                        this.cambioAlerta.borrado = false;
                        this.pageType = 'new';
                    }

                    let list: NgOption[] = [];
                    jsonDatosFicha.empleados.forEach(empleado => {
                        list.push({
                            id: empleado.id, 
                            name: empleado.nombre + ' ' + empleado.primerApellido + (!!empleado.segundoApellido ? (' ' + empleado.segundoApellido) : '')
                        });
                    });
                    this.listadoEmpleadosOrigen = [...list];
                    this.listadoEmpleadosDestino = [...list];
                }
                this.datosForm = this.createdatosForm();

                this.fechaActualInicio = this.compararFechas(this.getDate(), this.datosForm.controls.fechaInicio.value);
                this.fechaActualFin = this.compararFechas(this.getDate(), this.datosForm.controls.fechaFin.value);
                this.habilitarForm();
            }, error => {
                this.toastr.error(GenericService.getError(error).message);
            });

        //Ocultamos  el spinner  
        this.spinner.hide();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this.unsubscribeAll.next();
        this.unsubscribeAll.complete();
    }

    ngAfterViewInit(): void {
        jQuery('.parsleyjsCambioAlerta').parsley();
    }

    // Validate Date
    validateDate(name: string): void {
        jQuery("input[id=" + name + "]").parsley().reset();
        this.validacionFechas();
    }

    validacionFechas() {
        this.minFechaInicio = this.getDate();
        this.minFechaInicio = this.datosForm.controls.fechaInicio.value && this.datosForm.controls.fechaInicio.valid ? null : this.getDate();
        this.minFechaFin = this.datosForm.controls.fechaFin.value ? null : this.datosForm.controls.fechaInicio.value;
    }

    createdatosForm(): FormGroup {
        return this.formBuilder.group({
            id: [this.cambioAlerta.id],
            folio: [this.cambioAlerta.folio],
            empleadoOrigenId: [this.cambioAlerta.empleadoOrigenId, Validators.required],
            empleadoDestinoId: [this.cambioAlerta.empleadoDestinoId, Validators.required],
            fechaInicio: [this.cambioAlerta.fechaInicio ? new Date(this.cambioAlerta.fechaInicio) : null],
            fechaFin: [this.cambioAlerta.fechaFin ? new Date(this.cambioAlerta.fechaFin) : null],
            borrado: [this.cambioAlerta.borrado],
            fechaCreacion: [this.cambioAlerta.fechaCreacion],
            creadoPorId: [this.cambioAlerta.creadoPorId],
            fechaUltimaModificacion: [this.cambioAlerta.fechaUltimaModificacion],
            modificadoPorId: [this.cambioAlerta.modificadoPorId],
            timestamp: [this.cambioAlerta.timestamp]
        });
    }

    validarForm(): boolean {
        this.validacionFechas();
        this.mostrarErroresForm = true;
        if (this.datosForm.invalid) {
            for (var i in this.datosForm.controls) {
                this.datosForm.controls[i].markAsTouched();
            }
        }

        return this.datosForm.valid;
    }

    guardar(): boolean {
        //Validamos que se hayan llenado los datos requeridos
        if (!this.validarForm()) {
            return false;
        }

        //Recuperamos los valores a guardar    
        let cambioAlerta: CambioAlerta = this.datosForm.getRawValue();

        //Agregamos minutos para abarcar el fin del día
        let date = new Date(cambioAlerta.fechaFin);
        date.setSeconds(date.getSeconds() + 86399);
        cambioAlerta.fechaFin = date;

        if (this.datosForm.dirty) {
            //Mostramos el spinner
            this.spinner.show();

            //Guardamos la informacion en BD 
            this.service.guarda(cambioAlerta)
                .then(response => {
                    //Ocultamos el spinner
                    this.spinner.hide();

                    //Si nos regreso estatus 200, mostramos mensaje de exito y regresamos al listado
                    if (response.status == 200) {
                        this.toastr.success(response.message);
                        this.router.navigate([this.URL_CAMBIO_ALERTAS]);
                    }
                }, error => {
                    //Ocultamos el spinner
                    this.spinner.hide();

                    //Mostramos error 
                    this.toastr.error(GenericService.getError(error).message);
                }
                );
        } else {
            this.toastr.success('Registro guardado.');
            this.router.navigate([this.URL_CAMBIO_ALERTAS]);
        }
        return true;
    }

    validaDeshacer(eventoRegresar: boolean) {
        this.deshacerModal.eventoRegresar = eventoRegresar;
        if (this.datosForm.dirty) {
            this.deshacerModal.show();
        } else {
            this.cancelar();
        }
    }

    cancelar(): void {
        this.router.navigate([this.URL_CAMBIO_ALERTAS]);

        this.router.navigate([this.deshacerModal.eventoRegresar ? this.URL_CAMBIO_ALERTAS : this.router.url]);
    }

    eliminar(): boolean {

        this.spinner.show();

        this.service.elimina(this.cambioAlerta.id).then(
            response => {
                this.toastr.success(response.message);
                this.router.navigate([this.URL_CAMBIO_ALERTAS]);
                this.spinner.hide();
            },
            error => {
                this.toastr.error(GenericService.getError(error).message);
                this.spinner.hide();
            }
        )
        return true;
    }

    mostrarPanelAcciones(): boolean {
        return this.cambioAlerta.borrado == false && this.fechaActualFin <= 0;
    }
    
    habilitarForm() {
        if (this.cambioAlerta.borrado == true || this.fechaActualFin == 1) {
            this.datosForm.controls.empleadoOrigenId.disable();
            this.datosForm.controls.empleadoDestinoId.disable();
            this.datosForm.controls.fechaInicio.disable();
            this.datosForm.controls.fechaFin.disable();
        } else if (this.cambioAlerta.borrado == false && (this.fechaActualInicio == null || this.fechaActualFin == null || this.fechaActualInicio == -1)) {
            this.datosForm.controls.empleadoOrigenId.enable();
            this.datosForm.controls.empleadoDestinoId.enable();
            this.datosForm.controls.fechaInicio.enable();
            this.datosForm.controls.fechaFin.enable();
        } else {
            this.datosForm.controls.empleadoOrigenId.disable();
            this.datosForm.controls.empleadoDestinoId.disable();
            this.datosForm.controls.fechaInicio.disable();
            this.datosForm.controls.fechaFin.enable();
        }
    }

    getDate(): Date {
        return new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    }

    fechaInicioChange() {
        let fecha = this.datosForm.controls.fechaInicio.value;
        this.minFechaInicio = this.getDate();
        
        if (fecha < this.minFechaInicio) {
            this.toastr.error('La Fecha de Inicio debe ser mayor o igual que la Fecha Actual.');
            this.datosForm.controls.fechaInicio.setValue(null);
        }

        this.minFechaFin = this.datosForm.controls.fechaInicio.value ? this.datosForm.controls.fechaInicio.value : this.getDate();
        this.datosForm.controls.fechaFin.setValue(null);
    }

    compararFechas(fecha1, fecha2): number {
        if (fecha1 == null || fecha2 == null) {
            return null;
        }

        if (new Date(new Date(fecha1).toDateString()).getTime() == new Date(new Date(fecha2).toDateString()).getTime()) {
            return 0;
        } else if (new Date(new Date(fecha1).toDateString()).getTime() > new Date(new Date(fecha2).toDateString()).getTime()) {
            return 1;
        } else {
            return -1;
        }
    }
}