import { GenericComponent } from 'app/modules/base/generic.component';
import { Component, OnInit, OnDestroy, AfterViewInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { SolicitudViatico } from '@models/solicitud_viatico';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SolicitudComponentService } from './solicitud.service';
import { takeUntil } from 'rxjs/operators';
import { Listado_CMM } from '@models/listado_cmm';
import { GenericService } from '@services/generic.service';
import { ComboEmpleadoSolicitudProjection } from '@models/empleado';
import { Pais } from '@models/pais';
import { Estado } from '@models/estado';
import { Ciudad } from '@models/ciudad';
import { ListadoCMM } from '@models/mapeos/listadoCMM';
import { ProgramaGobierno } from '@models/programa_gobierno';
import { Proyecto } from '@models/proyecto';
import { Dependencia } from '@models/dependencia';
import { FuenteFinanciamiento } from '@models/fuente_financiamiento';
import { Archivo } from '@models/archivo';
import { ArchivoService } from '@services/archivo.service';
import { NgOption } from '@ng-select/ng-select';
import { DateTimeAdapter } from 'ng-pick-datetime';
import { ConfiguracionEnte } from '@models/configuracion_ente';
import * as moment from 'moment';
import { ConceptoViaticoMapeo } from '@models/mapeos/concepto_viatico_mapeo';
import { Console } from 'console';
moment.locale('es');
declare let jQuery: any;

@Component({
    selector: 'solicitud',
    templateUrl: './solicitud.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./solicitud.component.scss'],
})
export class SolicitudComponent extends GenericComponent implements AfterViewInit, OnInit, OnDestroy {

    @ViewChild('deshacerModal', null) deshacerModal;

    // URL
    private URL_SOLICITUDES: string = 'app/viaticos/solicitudes/'

    // Variables 
    public solicitud: SolicitudViatico;
    public empleado: ComboEmpleadoSolicitudProjection;
    public permisoEmpleados: boolean = false;
    private ejercicioActual: number = new Date().getFullYear();
    public minFechaSalida: Date = new Date();
    public maxFechaSalida: Date;
    public minFechaRegreso: Date = new Date();
    public maxFechaRegreso: Date = new Date();
    public minFechaInicioEvento: Date = new Date();
    public maxFechaInicioEvento: Date;
    public minFechaFinEvento: Date = new Date();
    public maxFechaFinEvento: Date;
    private pernoctaCon: number = 0;
    private pernoctaSin: number = 0;
    private viaticosTotalPernocta: number = 0;
    private viaticosTotalSinPernocta: number = 0;
    private viaticosTotalTransferir: number = 0;
    private pasajeTotalAereo: number = 0;
    private pasajeTotalTerrestre: number = 0;
    private pasajeTotalMaritimo: number = 0;
    private pasajeTotalTransferir: number = 0;
    private viaticosDataTable: any[];
    private pasajesDataTable: any[];
    public historial: any[];
    public pageType: string;
    private unsubscribeAll: Subject<any>;    

    // Listados para combos
    private empleados: ComboEmpleadoSolicitudProjection[];
    private ejercicios: any[];
    private programas: ProgramaGobierno[];
    private proyectos: Proyecto[];
    private fuentesFinanciamiento: FuenteFinanciamiento[];
    private dependencias: Dependencia[];
    private tiposViaje: Listado_CMM[];
    private tiposRepresentacion: Listado_CMM[];
    private paises: Pais[];    
    private estados: Estado[];
    private ciudades: Ciudad[];
    private gastoRepresentacion: Listado_CMM[];

    private listadoEmpleados: NgOption[] = [];
    public listadoEjercicios: NgOption[] = [];
    public listadoProgramas: NgOption[] = [];
    public listadoProyectos: NgOption[] = [];
    public listadoFuentesFinanciamiento: NgOption[] = [];
    public listadoDependencias: NgOption[] = [];
    public listadoTiposViaje: NgOption[] = [];
    public listadoTiposRepresentacion: NgOption[] = [];
    public listadoPaisesOrigen: NgOption[] = [];
    public listadoEstadosOrigen: NgOption[] = [];
    public listadoCiudadesOrigen: NgOption[] = [];
    public listadoPaisesDestino: NgOption[] = [];
    public listadoEstadosDestino: NgOption[] = [];
    public listadoCiudadesDestino: NgOption[] = [];
    public listadoGastoRepresentacion: NgOption[] = [];

    //Arreglo para los archivos de fotografias
    fotografias: { [key: number]: string } = {};

    //Forms
    datosForm: FormGroup;
    mySubscription: any;

    //Variables de control
    mostrarErroresForm: boolean = false;
    mostrarFormActions: boolean = true;
    mostrarCancelarSolicitud: boolean = true;
    mostrarEliminarAutorizar: boolean = true;
    mostrarImprimir: boolean = false;
    asignacion: boolean = false;
    soloLectura: boolean = false;

    constructor(private spinner: NgxSpinnerService,
        private service: SolicitudComponentService,
        private archivoService: ArchivoService,
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
        // Subscribe to update rol on changes
        this.service.onSolicitudChanged.pipe(takeUntil(this.unsubscribeAll))
            .subscribe(response => {
                let jsonDatosFicha = this.service.jsonDatosFicha;
                
                if (jsonDatosFicha) {
                    this.empleado = jsonDatosFicha.empleado;
                    this.ejercicios = jsonDatosFicha.ejercicios;
                    this.tiposViaje = jsonDatosFicha.tipoviaje;
                    this.tiposRepresentacion = jsonDatosFicha.tiporepresentacion;
                    this.paises = jsonDatosFicha.paises;
                    this.estados = jsonDatosFicha.estados;
                    this.ciudades = jsonDatosFicha.ciudades;
                    this.gastoRepresentacion = jsonDatosFicha.gastoRepresentacion;
                    let fotografias = jsonDatosFicha.fotografias;

                    //Cargamos la fotografía del empleado
                    if (this.empleado.fotografia) {
                        this.descargarArchivoTmp(fotografias[this.empleado.id], this.empleado.id);
                    }                    

                    //Cargamos los combos
                    this.cargaCombos(true);

                    //Cargamos la informacion de la ficha
                    //Si se recibe objeto Solicitud, quiere decir que vamos a editarlo
                    if (jsonDatosFicha.solicitud) {
                        
                        //Asignamos el objeto Solicitud a editar
                        this.solicitud = jsonDatosFicha.solicitud;
                        this.historial = jsonDatosFicha.historial;
                        this.soloLectura = jsonDatosFicha.soloLectura;

                        //Cargamos los combos
                        this.cargaCombos(false);
                        this.cargaCombosDatosPrograma(jsonDatosFicha.datosPrograma.data);
                        this.fechasIniciales();

                        this.pageType = 'edit';
                    }
                    //De lo contrario, es un registro nuevo
                    else {
                        this.solicitud = new SolicitudViatico();
                        this.solicitud.estatusId = ListadoCMM.EstatusRegistro.ACTIVO;

                        if (jsonDatosFicha.ente) {
                            let ente: ConfiguracionEnte = jsonDatosFicha.ente;

                            this.solicitud.paisOrigenId = ente.paisId;
                            this.solicitud.paisDestinoId = ente.paisId;
                            this.solicitud.estadoOrigenId = ente.estadoId;
                            this.solicitud.ciudadOrigenId = ente.ciudadId;

                            //Cargamos los combos
                            this.cargaCombos(false);
                        }

                        this.permisoEmpleados = jsonDatosFicha.permisoEmpleados;

                        if (this.permisoEmpleados) {
                            this.empleados = jsonDatosFicha.empleados;

                            let list: NgOption[] = [];
                            this.empleados.forEach(empleado => {
                                list.push({ id: empleado.id, name: empleado.nombre });
                                if (empleado.fotografia) {
                                    this.descargarArchivoTmp(fotografias[empleado.id], empleado.id);
                                }
                            });
                            this.listadoEmpleados = [...list];
                        }
                        
                        this.pageType = 'new';
                    }

                    this.mostrarFormActions = (this.pageType == 'new'
                        || this.solicitud.estatusId == ListadoCMM.EstatusSolicitud.ACTIVA
                        || this.solicitud.estatusId == ListadoCMM.EstatusSolicitud.EN_PROCESO
                        || this.solicitud.estatusId == ListadoCMM.EstatusSolicitud.EN_REVISION)
                        && !this.soloLectura;

                    this.mostrarEliminarAutorizar = this.pageType == 'edit'
                        && (this.solicitud.estatusId == ListadoCMM.EstatusSolicitud.ACTIVA
                            || this.solicitud.estatusId == ListadoCMM.EstatusSolicitud.EN_REVISION);
                    
                    this.mostrarCancelarSolicitud = this.pageType == 'edit'
                        && (this.solicitud.estatusId == ListadoCMM.EstatusSolicitud.EN_PROCESO);
                        
                    this.mostrarImprimir = this.pageType == 'edit'
                        && this.solicitud.estatusId != ListadoCMM.EstatusSolicitud.ACTIVA
                        && this.solicitud.estatusId != ListadoCMM.EstatusSolicitud.BORRADA
                        && this.solicitud.estatusId != ListadoCMM.EstatusSolicitud.CANCELADA
                        && this.solicitud.estatusId != ListadoCMM.EstatusSolicitud.EN_PROCESO
                        && this.solicitud.estatusId != ListadoCMM.EstatusSolicitud.EN_REVISION
                        && this.solicitud.estatusId != ListadoCMM.EstatusSolicitud.RECHAZADA;

                    this.asignacion = jsonDatosFicha.asignacion != null;

                    if (this.asignacion) {
                        this.viaticoCalculatorPernoctaConAndSin();
                        this.viaticosDataTable = jsonDatosFicha.asignacionViatico || [];
                        this.pasajesDataTable = jsonDatosFicha.asignacionPasaje || [];

                        this.viaticosDataTable.forEach(registro => {
                            this.viaticosTotalPernocta += registro.montoConPernocta;
                            this.viaticosTotalSinPernocta += registro.montoSinPernocta;
                            this.viaticosTotalTransferir += registro.montoPorTransferir;
                        });

                        this.pasajesDataTable.forEach(registro => {
                            if (registro.conceptoViatico) {
                                this.pasajeTotalAereo += (registro.conceptoViatico.id === ConceptoViaticoMapeo.TipoPasaje.AEREO ? registro.costo : 0); //Aereo
                                this.pasajeTotalMaritimo += (registro.conceptoViatico.id === ConceptoViaticoMapeo.TipoPasaje.MARITIMO ? registro.costo : 0); //Maritimo
                                this.pasajeTotalTerrestre += (registro.conceptoViatico.id === ConceptoViaticoMapeo.TipoPasaje.TERRESTRE ? registro.costo : 0); //Terrestre
                                this.pasajeTotalTransferir += (registro.asignadoAFuncionario ? registro.costo : 0);
                            }
                        });
                    }
                }
                this.datosForm = this.createDatosForm();

                //Carga combo de Ejercicio
                let list: NgOption[] = [];
                this.ejercicios.forEach(registro => {
                    if (this.deshabilitarForm() || registro.ejercicio <= this.ejercicioActual) {
                        list.push({ id: registro.ejercicio, name: registro.ejercicio});
                    }
                });
                this.listadoEjercicios = [...list];
            }, error => {
                this.toastr.error(GenericService.getError(error).message);
            });

        this.componentStateStart();
        //Ocultamos  el spinner  
        this.spinner.hide();
    }
    //By:AGG
    componentStateStart(){
        this.datosForm.controls.programaGobiernoId.disable();
        this.datosForm.controls.proyectoId.disable();
        this.datosForm.controls.ramoId.disable();
        this.datosForm.controls.dependenciaId.disable();
        this.solicitud.estatusId==ListadoCMM.EstatusSolicitud.EN_REVISION?'': this.datosForm.controls.fechaSalida.disable();  
        this.datosForm.controls.fechaRegreso.disable();
        this.datosForm.controls.fechaInicioEvento.disable();
        this.datosForm.controls.fechaFinEvento.disable();
        this.datosForm.controls.duracionEvento.disable();
        this.datosForm.controls.duracionComision.disable();
    }

    fechasIniciales(){
        try {
             //Fechas de viaje            
            this.minFechaSalida=new Date(this.solicitud.ejercicio, 0, 1);
            this.maxFechaSalida=new Date(this.solicitud.ejercicio, 11, 31);
            this.minFechaRegreso=new Date(this.solicitud.ejercicio, 0, 1);
            this.maxFechaRegreso=new Date(this.solicitud.ejercicio, 11, 31);

            //Fechas de evento
            this.minFechaInicioEvento=new Date(this.solicitud.ejercicio, 0, 1);
            this.maxFechaInicioEvento=new Date(this.solicitud.ejercicio, 11, 31);
            this.minFechaFinEvento=new Date(this.solicitud.ejercicio, 0, 1);
            this.maxFechaFinEvento=new Date(this.solicitud.ejercicio, 11, 31);
        } catch (error) {
            console.log("Solicitud.components.fechasIniciales()\n"+error);
        }
       

    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this.unsubscribeAll.next();
        this.unsubscribeAll.complete();
        if (this.mySubscription) {
            this.mySubscription.unsubscribe();
        }
    }

    ngAfterViewInit(): void {
        jQuery('.parsleyjs').parsley();
    }

    // Validate Date
    validateDate(name: string): void {
        jQuery("input[id=" + name + "]").parsley().reset();

        this.validacionFechas();
    }

    validacionFechas() {

        let ejercicio = this.datosForm.controls.ejercicio.value;
        let fechaSalida = this.datosForm.controls.fechaSalida.value;
        let fechaRegreso = this.datosForm.controls.fechaRegreso.value;
        let fechaInicioEvento = this.datosForm.controls.fechaInicioEvento.value;
        let fechaFinEvento = this.datosForm.controls.fechaFinEvento.value;
        //by: AGG
        if(fechaSalida && fechaRegreso){
            this.minFechaInicioEvento=fechaSalida;
            this.maxFechaInicioEvento=fechaRegreso;

            this.minFechaFinEvento=fechaSalida;
            this.maxFechaFinEvento=fechaRegreso;
        }
        //end AGG

        //by:Alonso
        // this.minFechaSalida = ejercicio && ejercicio > this.ejercicioActual ? new Date(ejercicio - 1, 12, 1) : new Date();
        // this.maxFechaSalida = ejercicio ? new Date(ejercicio, 11, 31, 23, 59, 59, 0) : null;
        // this.minFechaRegreso = fechaSalida;
        // this.minFechaInicioEvento = fechaSalida;
        // this.maxFechaInicioEvento = fechaRegreso;
        // this.minFechaFinEvento = fechaInicioEvento;
        // this.maxFechaFinEvento = fechaRegreso;

        if (ejercicio && fechaSalida) 
        {
            //add comment by: AGG
            // if (fechaSalida <= this.minFechaSalida || fechaSalida > this.maxFechaSalida) {
            //     this.toastr.error('La Fecha de Salida debe estar entre '
            //         + (ejercicio > this.ejercicioActual
            //             ? 'el 01 de Enero de ' + ejercicio
            //             : 'la Fecha Actual')
            //         + ' y el 31 de Diciembre de ' + ejercicio + '.'
            //     );
            //     this.datosForm.controls.fechaSalida.setValue(null);
            //     return;
            // } else {
            //     this.minFechaSalida = null;
            //     this.maxFechaSalida = null;
            // }

            if (fechaRegreso) {
                if (fechaRegreso <= fechaSalida) {
                    this.toastr.error('La Fecha de Regreso debe ser mayor que la Fecha de Salida.');
                    this.datosForm.controls.fechaRegreso.setValue(null);
                    return;
                } else {
                    // this.minFechaRegreso = null;
                }

                if (fechaInicioEvento) {
                    if (fechaInicioEvento <= fechaSalida || fechaInicioEvento > fechaRegreso) {
                        this.toastr.error('La Fecha Inicio del Evento debe estar entre la Fecha de Salida y la Fecha de Regreso.');
                        this.datosForm.controls.fechaInicioEvento.setValue(null);
                        return;
                    } else {
                        //add comment by: AGG
                        // this.minFechaInicioEvento = null;
                        // this.maxFechaInicioEvento = null;
                    }

                    if (fechaFinEvento && fechaFinEvento <= fechaInicioEvento || fechaFinEvento > fechaRegreso) {
                        this.toastr.error('La Fecha Fin del Evento debe estar entre la Fecha Inicio del Evento y la Fecha de Regreso.');
                        this.datosForm.controls.fechaFinEvento.setValue(null);
                        return;
                    } else {
                        // add comment by: AGG
                        // this.minFechaFinEvento = null;
                        // this.maxFechaFinEvento = null;
                    }
                }
            }
        }
    }

    createDatosForm(): FormGroup {
        return this.formBuilder.group(
            {
                id: [this.solicitud.id],
                empleadoId: [this.empleado.id, Validators.required],
                nombre: [this.empleado.nombre],
                puestoId: [this.empleado.puestoId],
                puesto: [this.empleado.puesto],
                cargoId: [this.empleado.cargoId],
                cargo: [this.empleado.cargo],
                areaAdscripcionId: [this.empleado.areaAdscripcionId],
                areaAdscripcion: [this.empleado.areaAdscripcion],
                ejercicio: [this.solicitud.ejercicio ? this.solicitud.ejercicio.toString() : null, Validators.required],
                programaGobiernoId: [this.solicitud.programaGobiernoId, Validators.required],
                programaGobierno: [this.solicitud.programaGobierno],
                proyectoId: [this.solicitud.proyectoId, Validators.required],
                proyecto: [this.solicitud.proyecto],
                ramoId: [this.solicitud.ramoId, Validators.required],
                ramo: [this.solicitud.ramo],
                dependenciaId: [this.solicitud.dependenciaId, Validators.required],
                dependencia: [this.solicitud.dependencia],
                noOficio: [this.solicitud.noOficio],
                tipoViajeId: [this.solicitud.tipoViajeId, Validators.required],
                tipoViaje: [this.solicitud.tipoViaje],
                tipoRepresentacionId: [this.solicitud.tipoRepresentacionId, Validators.required],
                tipoRepresentacion: [this.solicitud.tipoRepresentacion],
                fechaSalida: [this.solicitud.fechaSalida ? new Date(this.solicitud.fechaSalida) : null],
                fechaRegreso: [this.solicitud.fechaRegreso ? new Date(this.solicitud.fechaRegreso) : null],
                duracionComision: [this.solicitud.duracionComision],
                paisOrigenId: [this.solicitud.paisOrigenId, Validators.required],
                estadoOrigenId: [this.solicitud.estadoOrigenId, Validators.required],
                ciudadOrigenId: [this.solicitud.ciudadOrigenId, Validators.required],
                paisDestinoId: [this.solicitud.paisDestinoId, Validators.required],
                estadoDestinoId: [this.solicitud.estadoDestinoId, Validators.required],
                ciudadDestinoId: [this.solicitud.ciudadDestinoId, Validators.required],
                gastoRepresentacionId: [this.solicitud.gastoRepresentacionId, Validators.required],
                gastoRepresentacion: [this.solicitud.gastoRepresentacion],
                sugerencias: [this.solicitud.sugerencias],
                fechaInicioEvento: [this.solicitud.fechaInicioEvento ? new Date(this.solicitud.fechaInicioEvento) : null],
                fechaFinEvento: [this.solicitud.fechaFinEvento ? new Date(this.solicitud.fechaFinEvento) : null],
                duracionEvento: [this.solicitud.duracionEvento],
                motivo: [this.solicitud.motivo],
                descripcionComision: [this.solicitud.descripcionComision],
                organizador: [this.solicitud.organizador],
                linkEvento: [this.solicitud.linkEvento],
                estatusId: [this.solicitud.estatusId]
            }
        );
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

        //Mostramos el spinner
        this.spinner.show();

        if (this.datosForm.dirty) {
            //Recuperamos los valores a guardar
            let solicitud: SolicitudViatico = this.datosForm.getRawValue();

            //Guardamos la informacion en BD 
            this.service.guarda(solicitud)
                .then(response => {
                    //Ocultamos el spinner
                    this.spinner.hide();

                    //Si nos regreso estatus 200, mostramos mensaje de exito y regresamos al listado
                    if (response.status == 200) {
                        this.toastr.success(response.message);
                        this.router.navigate([this.URL_SOLICITUDES]);
                        return true;
                    }
                }, error => {
                    //Ocultamos el spinner
                    this.spinner.hide();

                    //Mostramos error 
                    this.toastr.error(GenericService.getError(error).message);

                    return false;
                }
            );
        } else {
            //Ocultamos el spinner
            this.spinner.hide();

            this.toastr.success('Cambios guardados.');

            this.router.navigate([this.URL_SOLICITUDES]);
            return true;
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

        //Inicializar Banderas
        this.mostrarErroresForm = false;
        this.mostrarFormActions = true;
        this.mostrarCancelarSolicitud = true;
        this.mostrarEliminarAutorizar = true;
        this.mostrarImprimir = false;
        this.asignacion = false;
        this.soloLectura = false;
        jQuery('.parsleyjs').parsley().reset();

        //Navegar hacia el listado o hacia la misma url para recargar la ficha
        this.router.navigate([this.deshacerModal.eventoRegresar ? this.URL_SOLICITUDES : this.router.url]);
    }

    eliminar(): boolean {
        this.spinner.show();

        this.service.elimina(this.solicitud.id).then(
            response => {
                this.toastr.success(response.message);
                this.router.navigate([this.URL_SOLICITUDES]);
                this.spinner.hide();
            },
            error => {
                this.toastr.error(GenericService.getError(error).message);
                this.spinner.hide();
            }
        )
        return true;
    }

    cancelarSolicitud(): void {
        //Mostramos el spinner
        this.spinner.show();

        //Guardamos la informacion en BD 
        this.service.cancelar(this.solicitud.id)
            .then(response => {
                //Ocultamos el spinner
                this.spinner.hide();

                //Si nos regreso estatus 200, mostramos mensaje de exito y regresamos al listado
                if (response.status == 200) {
                    this.toastr.success(response.message);
                    this.router.navigate([this.URL_SOLICITUDES]);
                    this.spinner.hide();
                }
            }, error => {
                //Ocultamos el spinner
                this.spinner.hide();

                //Mostramos error 
                this.toastr.error(GenericService.getError(error).message);
            }
        );
    }

    enviarAutorizar(): void {
        this.spinner.show();

        this.service.enviar(this.solicitud.id).then(
            response => {
                this.toastr.success(response.message);
                this.router.navigate([this.URL_SOLICITUDES]);
                this.spinner.hide();
            },
            error => {
                this.toastr.error(GenericService.getError(error).message);
                this.spinner.hide();
            }
        );
    }

    imprimir(): void {
        this.spinner.show();

        this.service.imprimir(this.solicitud.id).then(
            response => {
                window.open(this.archivoService.generarURLTmp(response, '.pdf'));
                //this.archivoService.descargarBlob(response, 'SolicitudViatico_' + this.solicitud.numeroSolicitud, '.pdf');
                this.spinner.hide();
            },
            error => {
                this.toastr.error(GenericService.getError(error).message);
                this.spinner.hide();
            }
        );
    }

    cargaCombos(combosBase: boolean): void {
        let list: NgOption[] = [];
        if (combosBase) {
            this.tiposViaje.forEach(registro => {
                list.push({ id: registro.id, name: registro.valor});
            });
            this.listadoTiposViaje = [...list];

            list = [];
            this.tiposRepresentacion.forEach(registro => {
                list.push({ id: registro.id, name: registro.valor});
            });
            this.listadoTiposRepresentacion = [...list];

            list = [];
            this.paises.forEach(registro => {
                list.push({ id: registro.id, name: registro.nombre});
            });
            this.listadoPaisesOrigen = [...list];
            this.listadoPaisesDestino = [...list];

            list = [];
            this.gastoRepresentacion.forEach(registro => {
                list.push({ id: registro.id, name: registro.valor});
            });
            this.listadoGastoRepresentacion = [...list];
        } else {            
            list = [];
            this.estados.forEach(registro => {
                if (registro.paisId == this.solicitud.paisOrigenId) {
                    list.push({ id: registro.id, name: registro.nombre});
                }
            });
            this.listadoEstadosOrigen = [...list];

            list = [];
            this.ciudades.forEach(registro => {
                if (registro.estadoId == this.solicitud.estadoOrigenId) {
                    list.push({ id: registro.id, name: registro.nombre});
                }
            });
            this.listadoCiudadesOrigen = [...list];

            list = [];
            this.estados.forEach(registro => {
                if (registro.paisId == this.solicitud.paisDestinoId) {
                    list.push({ id: registro.id, name: registro.nombre});
                }
            });
            this.listadoEstadosDestino = [...list];

            list = [];
            this.ciudades.forEach(registro => {
                if (registro.estadoId == this.solicitud.estadoDestinoId) {
                    list.push({ id: registro.id, name: registro.nombre});
                }
            });
            this.listadoCiudadesDestino = [...list];
        }
    }

    cargaCombosDatosPrograma(data: any): void {
        this.programas = data.programas;
        this.proyectos = data.proyectos;
        this.fuentesFinanciamiento = data.fuentesFinanciamiento;
        this.dependencias = data.dependencias;

        let list: NgOption[] = [];
        this.programas.forEach(registro => {
            list.push({ id: registro.id, name: registro.id + ' - ' + registro.nombre});
        });
        this.listadoProgramas = [...list];

        list = [];
        this.proyectos.forEach(registro => {
            if (registro.programaId == this.solicitud.programaGobiernoId) {
                list.push({ id: registro.id, name: registro.id + ' - ' + registro.nombre});
            }
        });
        this.listadoProyectos = [...list];

        list = [];
        this.dependencias.forEach(registro => {
            if (registro.proyectoId == this.solicitud.proyectoId) {
                list.push({ id: registro.id, name: registro.id + ' - ' + registro.nombre});
            }
        });
        this.listadoDependencias = [...list];

        list = [];
        this.fuentesFinanciamiento.forEach(registro => {
            if (registro.proyectoId == this.solicitud.proyectoId) {
                list.push({ id: registro.id, name: registro.id + ' - ' + registro.nombre});
            }
        });
        this.listadoFuentesFinanciamiento = [...list];
    }

    cboEmpleadoChange(event) {
        this.empleado = event ? this.empleados.filter(registro => { return registro.id == event.id })[0] : new ComboEmpleadoSolicitudProjection();
        this.datosForm.controls.empleadoId.setValue(this.empleado.id);
        this.datosForm.controls.nombre.setValue(this.empleado.nombre);
        this.datosForm.controls.puestoId.setValue(this.empleado.puestoId);
        this.datosForm.controls.puesto.setValue(this.empleado.puesto);
        this.datosForm.controls.cargoId.setValue(this.empleado.cargoId);
        this.datosForm.controls.cargo.setValue(this.empleado.cargo);
        this.datosForm.controls.areaAdscripcionId.setValue(this.empleado.areaAdscripcionId);
        this.datosForm.controls.areaAdscripcion.setValue(this.empleado.areaAdscripcion);
    }

    cboEjercicioChange(event) {
        // by: Alonso
        // this.minFechaSalida = event && event.id > this.ejercicioActual ? new Date(event.id - 1, 12, 1) : new Date();
        // this.maxFechaSalida = event ? new Date(event.id, 11, 31, 23, 59, 59, 0) : null;



        this.datosForm.controls.fechaSalida.setValue(null);
        this.datosForm.controls.fechaRegreso.setValue(null);
        this.datosForm.controls.fechaRegreso.disable();
        this.datosForm.controls.duracionComision.setValue(null);
        this.datosForm.controls.fechaInicioEvento.setValue(null);
        this.datosForm.controls.fechaInicioEvento.disable();
        this.datosForm.controls.fechaFinEvento.setValue(null);
        this.datosForm.controls.fechaFinEvento.disable();
        this.datosForm.controls.duracionEvento.setValue(null);

        //by:AGG
        this.datosForm.controls.fechaSalida.enable();
        
        this.maxFechaSalida = event ? new Date(event.id, 11, 31, 23, 59, 59, 0) : null;
        this.minFechaSalida = new Date(event.id, 0, 1);
        

        this.minFechaRegreso = new Date(event.id, 0, 1);
        this.maxFechaRegreso = event ? new Date(event.id, 11, 31, 23, 59, 59, 0) : null;      
        //END AGG

        this.solicitud.programaGobiernoId = null;
        this.solicitud.proyectoId = null;
        this.solicitud.dependenciaId = null;
        this.solicitud.ramoId = null;
        
        this.datosForm.controls.programaGobiernoId.setValue(null);
        this.datosForm.controls.proyectoId.setValue(null);
        this.datosForm.controls.proyectoId.disable();
        this.datosForm.controls.dependenciaId.setValue(null);
        this.datosForm.controls.dependenciaId.disable();
        this.datosForm.controls.ramoId.setValue(null);
        this.datosForm.controls.ramoId.disable();

        this.listadoProgramas = [];
        this.listadoProyectos = [];
        this.listadoDependencias = [];
        this.listadoFuentesFinanciamiento = [];
        
        if (event) {
            //Mostramos el spinner
            this.spinner.show();

            this.service.getDatosPrograma(event.id)
                .then(response => {
                    //Ocultamos el spinner
                    this.spinner.hide();

                    if (response.status == 200) {
                        this.cargaCombosDatosPrograma(response.data);

                        this.spinner.hide();
                    }
                    this.datosForm.controls.programaGobiernoId.enable();
                }, error => {
                    //Ocultamos el spinner
                    this.spinner.hide();
                    this.componentStateStart();
                    //Mostramos error 
                    this.toastr.error(GenericService.getError(error).message);

                }
            );                    
        }
    }

    cboProgramaChange(event) {
        let id = event ? event.id : null;
        let valor = event ? event.name : null;

        this.solicitud.programaGobiernoId = id;
        this.solicitud.proyectoId = null;
        this.solicitud.dependenciaId = null;
        this.solicitud.ramoId = null;
        this.datosForm.controls.proyectoId.setValue(null);
        this.datosForm.controls.dependenciaId.setValue(null);
        this.datosForm.controls.ramoId.setValue(null);

        let list: NgOption[] = [];
        this.proyectos.forEach(registro => {
            if (registro.programaId == id) {
                list.push({ id: registro.id, name: registro.id + ' - ' + registro.nombre});
            }
        });
        this.listadoProyectos = [...list];

        if(id==null)
        {
            this.datosForm.controls.proyectoId.disable();
            this.datosForm.controls.dependenciaId.disable();
            this.datosForm.controls.ramoId.disable();

        }else{
            this.datosForm.controls.proyectoId.enable();      
        }

        this.datosForm.controls.programaGobierno.setValue(valor);
        this.listadoDependencias = [];
        this.listadoFuentesFinanciamiento = [];
    }

    cboProyectoChange(event) {
        let id = event ? event.id : null;
        let valor = event ? event.name : null;

        this.solicitud.proyectoId = id;
        this.solicitud.dependenciaId = null;
        this.solicitud.ramoId = null;
        this.datosForm.controls.dependenciaId.setValue(null);
        this.datosForm.controls.ramoId.setValue(null);

        let list: NgOption[] = [];
        this.dependencias.forEach(registro => {
            if (registro.proyectoId == id) {
                list.push({ id: registro.id, name: registro.id + ' - ' + registro.nombre});
            }
        });
        this.listadoDependencias = [...list];

        //Si el listado de dependencias tiene mas de 0 registros habilitar el txtBox Fuente Financiamiento
        if(id==null)
        {
            
            this.datosForm.controls.dependenciaId.disable();
            this.datosForm.controls.ramoId.disable();

        }else{
            this.datosForm.controls.ramoId.enable();      
        }
        list = [];
        this.fuentesFinanciamiento.forEach(registro => {
            if (registro.proyectoId == id) {
                list.push({ id: registro.id, name: registro.id + ' - ' + registro.nombre});
            }
        });
        this.listadoFuentesFinanciamiento = [...list];

        this.datosForm.controls.proyecto.setValue(valor);
    }

    cboDependenciaChange(event) {
        this.solicitud.dependenciaId = event ? event.id : null;
        this.datosForm.controls.dependencia.setValue(event ? event.name : null);
    }

    cboFuenteFinanciamientoChange(event) {
        this.solicitud.ramoId = event ? event.id : null;
        //Si el listado de dependencias tiene mas de 0 registros habilitar el txtBox Fuente Financiamiento
        if(this.solicitud.ramoId==null)
        {

            this.datosForm.controls.dependenciaId.setValue(null);
            this.datosForm.controls.dependenciaId.disable();

        }else{
            this.datosForm.controls.dependenciaId.enable();
        }
        this.datosForm.controls.ramo.setValue(event ? event.name : null);
    }

    cboTipoViajeChange(event) {
        this.solicitud.tipoViajeId = event ? event.id : null;
        this.datosForm.controls.tipoViaje.setValue(event ? event.name : null);
    }

    cboTipoRepresentacionChange(event) {
        this.solicitud.tipoRepresentacionId = event ? event.id : null;
        this.datosForm.controls.tipoRepresentacion.setValue(event ? event.name : null);
    }

    cboPaisOrigenChange(event) {
        let id = event ? event.id : null;

        this.solicitud.paisOrigenId = id;
        this.solicitud.estadoOrigenId = null;
        this.solicitud.ciudadOrigenId = null;

        let list: NgOption[] = [];
        this.estados.forEach(registro => {
            if (registro.paisId == id) {
                list.push({ id: registro.id, name: registro.nombre});
            }
        });
        this.listadoEstadosOrigen = [...list];

        this.listadoCiudadesOrigen = [];

        // Clean Estado Origen And Ciudad Origen
        this.datosForm.controls.estadoOrigenId.setValue(null);
        this.datosForm.controls.ciudadOrigenId.setValue(null);
    }

    cboEstadoOrigenChange(event) {
        let id = event ? event.id : null;

        this.solicitud.estadoOrigenId = id;
        this.solicitud.ciudadOrigenId = null;
        
        let list: NgOption[] = [];
        this.ciudades.forEach(registro => {
            if (registro.estadoId == id) {
                list.push({ id: registro.id, name: registro.nombre});
            }
        });
        this.listadoCiudadesOrigen = [...list];

        // Clean Ciudad Origen
        this.datosForm.controls.ciudadOrigenId.setValue(null);
    }

    cboCiudadOrigenChange(event) {
        this.solicitud.ciudadOrigenId = event ? event.id : null;
    }

    cboPaisDestinoChange(event) {
        let id = event ? event.id : null;

        this.solicitud.paisDestinoId = id;
        this.solicitud.estadoDestinoId = null;
        this.solicitud.ciudadDestinoId = null;

        let list: NgOption[] = [];
        this.estados.forEach(registro => {
            if (registro.paisId == id) {
                list.push({ id: registro.id, name: registro.nombre});
            }
        });
        this.listadoEstadosDestino = [...list];

        this.listadoCiudadesDestino = [];

        // Clean Estado Destino And Ciudad Destino
        this.datosForm.controls.estadoDestinoId.setValue(null);
        this.datosForm.controls.ciudadDestinoId.setValue(null);
    }

    cboEstadoDestinoChange(event) {
        let id = event ? event.id : null;
        
        let list: NgOption[] = [];
        this.ciudades.forEach(registro => {
            if (registro.estadoId == id) {
                list.push({ id: registro.id, name: registro.nombre});
            }
        });
        this.listadoCiudadesDestino = [...list];

        // Clean Ciudad Destino
        this.datosForm.controls.ciudadDestinoId.setValue(null);
    }

    cboCiudadDestinoChange(event) {
        this.solicitud.ciudadDestinoId = event ? event.id : null;
    }

    // Combo Gasto Representacion
    cboGastoRepresentacionChange(event) {
        this.datosForm.controls.gastoRepresentacion.setValue(event ? this.gastoRepresentacion.find(gasto => gasto.id == event.id).valor : '');
    }

    fechaSalidaChange() {
        this.datosForm.controls.fechaRegreso.setValue(null);
        this.datosForm.controls.duracionComision.setValue(null);
        this.datosForm.controls.fechaInicioEvento.setValue(null);
        this.datosForm.controls.fechaInicioEvento.disable();
        this.datosForm.controls.fechaFinEvento.setValue(null);
        this.datosForm.controls.fechaFinEvento.disable();
        this.datosForm.controls.duracionEvento.setValue(null);
        this.minFechaRegreso=this.datosForm.controls.fechaSalida.value;

        this.datosForm.controls.fechaRegreso.enable();

        let fecha1 = this.datosForm.controls.fechaSalida.value;

        let fecha2 = this.datosForm.controls.fechaRegreso.value;        
        
        this.datosForm.controls.duracionComision.setValue(this.getDuracion(fecha1, fecha2));
    }

    fechaRegresoChange() {
        this.datosForm.controls.duracionComision.setValue(null);
        this.datosForm.controls.fechaInicioEvento.setValue(null);
        this.datosForm.controls.fechaFinEvento.setValue(null);
        this.datosForm.controls.duracionEvento.setValue(null);

        //add by: AGG
        this.datosForm.controls.fechaInicioEvento.enable();
        this.minFechaInicioEvento=this.datosForm.controls.fechaSalida.value;
        this.maxFechaInicioEvento=this.datosForm.controls.fechaRegreso.value;

        this.minFechaFinEvento=this.datosForm.controls.fechaSalida.value;
        this.maxFechaFinEvento=this.datosForm.controls.fechaRegreso.value;
        //END add

        let fecha1 = this.datosForm.controls.fechaSalida.value;
        let fecha2 = this.datosForm.controls.fechaRegreso.value;        
        
        this.datosForm.controls.duracionComision.setValue(this.getDuracion(fecha1, fecha2));
    }

    fechaInicioEventoChange() {
        // this.datosForm.controls.fechaFinEvento.setValue(null);
        // this.datosForm.controls.duracionEvento.setValue(null);


        this.minFechaFinEvento=this.datosForm.controls.fechaInicioEvento.value;
        this.maxFechaFinEvento=this.datosForm.controls.fechaRegreso.value;
        this.datosForm.controls.fechaFinEvento.enable();
        let fecha1 = this.datosForm.controls.fechaInicioEvento.value;
        let fecha2 = this.datosForm.controls.fechaFinEvento.value;        
        
        this.datosForm.controls.duracionEvento.setValue(this.getDuracionSoloDias(fecha1, fecha2));
    }

    fechaFinEventoChange() {
        let fecha1 = this.datosForm.controls.fechaInicioEvento.value;
        let fecha2 = this.datosForm.controls.fechaFinEvento.value;
        
        this.datosForm.controls.duracionEvento.setValue(this.getDuracionSoloDias(fecha1, fecha2));
    }

    getDuracion(fecha1, fecha2): string {
        if (!fecha1 || !fecha2 || fecha1 >= fecha2) {
            return null;
        }

        let duracion = new Date(new Date(fecha2).toDateString()).getTime() - new Date(new Date(fecha1).toDateString()).getTime();
        duracion = Math.round(duracion/ (1000 * 60 * 60 * 24));
        return duracion > 0 ? ( (duracion+1) + ' días, ' + duracion + (duracion > 1 ? ' noches': ' noche') ) : '1 día';
    }

    getDuracionSoloDias(fecha1, fecha2): string {
        let duracion: string = this.getDuracion(fecha1, fecha2);

        if (!duracion) {
            return null;
        }

        if (duracion.indexOf(',') != -1) { 
            duracion = duracion.substring(0, duracion.indexOf(','));
        }
        
        return duracion;
    }

    descargarArchivoTmp(archivo: Archivo, empleadoId: number) {
        this.archivoService.descargarArchivo(archivo.id).then(
            response => {
                let extension = archivo.rutaFisica.substr(archivo.rutaFisica.indexOf('.'));
                this.fotografias[empleadoId] = this.archivoService.generarURLTmp(response, extension);
            }, error => {
                this.toastr.error(GenericService.getError(error).message);
            }
        );
    }

    deshabilitarForm() {
        let deshabilitar: boolean = (this.pageType == 'new'
            || this.solicitud.estatusId == ListadoCMM.EstatusSolicitud.ACTIVA
            || this.solicitud.estatusId == ListadoCMM.EstatusSolicitud.EN_REVISION)
            && !this.soloLectura ? false : true;

        if (!deshabilitar) {
            this.datosForm.controls.ejercicio.enable();
            // this.datosForm.controls.programaGobiernoId.enable();
            // this.datosForm.controls.proyectoId.enable();
            // this.datosForm.controls.ramoId.enable();
            // this.datosForm.controls.dependenciaId.enable();
            this.datosForm.controls.tipoViajeId.enable();
            this.datosForm.controls.tipoRepresentacionId.enable();
            this.datosForm.controls.paisOrigenId.enable();
            this.datosForm.controls.estadoOrigenId.enable();
            this.datosForm.controls.ciudadOrigenId.enable();
            this.datosForm.controls.paisDestinoId.enable();
            this.datosForm.controls.estadoDestinoId.enable();
            this.datosForm.controls.ciudadDestinoId.enable();
            this.datosForm.controls.gastoRepresentacionId.enable();
        } else {
            this.datosForm.controls.ejercicio.disable();
            this.datosForm.controls.programaGobiernoId.disable();
            this.datosForm.controls.proyectoId.disable();
            this.datosForm.controls.ramoId.disable();
            this.datosForm.controls.dependenciaId.disable();
            this.datosForm.controls.tipoViajeId.disable();
            this.datosForm.controls.tipoRepresentacionId.disable();
            this.datosForm.controls.paisOrigenId.disable();
            this.datosForm.controls.estadoOrigenId.disable();
            this.datosForm.controls.ciudadOrigenId.disable();
            this.datosForm.controls.paisDestinoId.disable();
            this.datosForm.controls.estadoDestinoId.disable();
            this.datosForm.controls.ciudadDestinoId.disable();
            this.datosForm.controls.gastoRepresentacionId.disable();
        }        

        return deshabilitar;
    }

    viaticoCalculatorPernoctaConAndSin(): void {
        var dateOut = moment(this.solicitud.fechaSalida);
        var dateBack = moment(this.solicitud.fechaRegreso);
        this.pernoctaCon = dateBack.diff(dateOut, 'days');
        this.pernoctaSin = (this.pernoctaCon + 1) - this.pernoctaCon;
    }    
}