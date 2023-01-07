import { GenericComponent } from 'app/modules/base/generic.component';
import { Component, OnInit, OnDestroy, AfterViewInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { GrupoJerarquico } from '@models/grupo_jerarquico';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { SelectionType } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { GrupoJerarquicoComponentService } from './grupo_jerarquico.service';
import { takeUntil } from 'rxjs/operators';
import { ListadoCMM } from '@models/mapeos/listadoCMM';
import { GenericService } from '@services/generic.service';
declare let jQuery: any;

@Component({
    selector: 'grupo_jerarquico',
    templateUrl: './grupo_jerarquico.component.html',
    styleUrls: ['./grupo_jerarquico.component.scss']
})
export class GrupoJerarquicoComponent extends GenericComponent implements AfterViewInit, OnInit, OnDestroy {
    
    @ViewChild('deshacerModal', null) deshacerModal;

    // URL
    private URL_GRUPOS_JERARQUICOS: string = 'app/catalogos/grupos_jerarquicos/';

    // Variables 
    private grupoJerarquico: GrupoJerarquico;
    private grupoJerarquicoTemp: GrupoJerarquico;
    public pageType: string;
    private unsubscribeAll: Subject<any>;
    public puestos: any[];
    public puestosSeleccionados = [];
    public SelectionType = SelectionType;

    //Forms
    datosForm: FormGroup;
    mySubscription: any;

    constructor(private spinner: NgxSpinnerService,
        private grupoService: GrupoJerarquicoComponentService,
        private toastr: ToastrService,
        private formBuilder: FormBuilder,
        private router: Router
    ) {
        super();

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

        // Subscribe to update changes
        this.grupoService.onChanged.pipe(takeUntil(this.unsubscribeAll))
            .subscribe(response => {
                let jsonDatosFicha = this.grupoService.jsonDatosFicha;
                if (jsonDatosFicha) {
                    //Cargamos la informacion de la ficha
                    //Si se recibe objeto a editar
                    if (jsonDatosFicha.grupoJerarquico) {
                        //Asignamos el objeto a editar
                        this.grupoJerarquico = jsonDatosFicha.grupoJerarquico;
                        this.pageType = 'edit';
                    }
                    //De lo contrario, es un registro nuevo
                    else {
                        this.grupoJerarquico = new GrupoJerarquico();
                        this.grupoJerarquico.estatusId = ListadoCMM.EstatusRegistro.ACTIVO;
                        this.pageType = 'new';
                    }
                    
                    this.puestos = jsonDatosFicha.puestos;

                    if (jsonDatosFicha.grupoJerarquicoPuestos) {
                        jsonDatosFicha.grupoJerarquicoPuestos.forEach(grupoPuesto => {
                            this.puestos.forEach(puesto => {
                                if (puesto.id == grupoPuesto.listadoPuestoId) {
                                    this.puestosSeleccionados.push(puesto);
                                }
                            })
                        });
                    }

                    this.grupoJerarquicoTemp = this.grupoJerarquico;
                    this.grupoJerarquicoTemp.puestosId = [];
                    this.puestosSeleccionados.forEach(puesto => { this.grupoJerarquicoTemp.puestosId.push(puesto.id) });
                }
                this.datosForm = this.createDatosForm();
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
        if (this.mySubscription) {
            this.mySubscription.unsubscribe();
        }
    }

    ngAfterViewInit(): void {
        jQuery('.parsleyjsGrupoJerarquico').parsley();
    }

    createDatosForm(): FormGroup {
        return this.formBuilder.group({
            id: [this.grupoJerarquico.id],
            nombre: [this.grupoJerarquico.nombre],
            descripcion: [this.grupoJerarquico.descripcion],
            estatusId: [this.grupoJerarquico.estatusId],
            estatus: [this.grupoJerarquico.estatusId == ListadoCMM.EstatusRegistro.ACTIVO],
            timestamp: [this.grupoJerarquico.timestamp]
        });
    }

    validarForm(): boolean {
        return this.datosForm.valid;
    }

    guardar(): boolean {
        //Validamos que se hayan llenado los datos requeridos
        if (!this.validarForm()) {
            return false;
        }

        //Recuperamos los valores a guardar
        let grupoJerarquico: GrupoJerarquico = this.datosForm.getRawValue();
        grupoJerarquico.estatusId = this.datosForm.controls.estatus.value ? ListadoCMM.EstatusRegistro.ACTIVO : ListadoCMM.EstatusRegistro.INACTIVO;

        grupoJerarquico.puestosId = [];

        this.puestosSeleccionados.forEach(puesto => {
            grupoJerarquico.puestosId.push(puesto.id);
        });

        let cambios: boolean = grupoJerarquico.nombre != this.grupoJerarquicoTemp.nombre
            || grupoJerarquico.descripcion != this.grupoJerarquicoTemp.descripcion
            || grupoJerarquico.estatusId != this.grupoJerarquicoTemp.estatusId
            || grupoJerarquico.puestosId.length != this.grupoJerarquicoTemp.puestosId.length;

        cambios = !cambios ? this.validaCambioPuestos() : cambios;

        if (cambios) {
            //Mostramos el spinner
            this.spinner.show();

            //Guardamos la informacion en BD
            this.grupoService.guarda(grupoJerarquico).then(
                response => {
                    this.toastr.success(response.message);
                    this.router.navigate([this.URL_GRUPOS_JERARQUICOS]);
                    this.spinner.hide();
                }, 
                error => {
                    this.toastr.error(GenericService.getError(error).message);
                    this.spinner.hide();
                }
            )
        } else {
            this.toastr.success('Registro guardado.');
            this.router.navigate([this.URL_GRUPOS_JERARQUICOS]);
        }
        return true;
    }

    validaCambioPuestos() {
        let cambios: boolean = false;

        let grupoJerarquico: GrupoJerarquico = this.datosForm.getRawValue();

        grupoJerarquico.puestosId = [];

        this.puestosSeleccionados.forEach(puesto => {
            grupoJerarquico.puestosId.push(puesto.id);
        });

        if (grupoJerarquico.puestosId.length != this.grupoJerarquicoTemp.puestosId.length) {
            return true;
        }

        grupoJerarquico.puestosId.forEach(puestoId => {
            cambios = this.grupoJerarquicoTemp.puestosId.filter(puestoTempId => puestoTempId == puestoId).length == 0 ? true : cambios;
        });

        return cambios;
    }

    validaDeshacer(eventoRegresar: boolean) {
        this.deshacerModal.eventoRegresar = eventoRegresar;
        if (this.datosForm.dirty || this.validaCambioPuestos()) {
            this.deshacerModal.show();
        } else {
            this.cancelar();
        }
    }

    cancelar(): void {
        jQuery('.parsleyjsGrupoJerarquico').parsley().reset();
        this.router.navigate([this.deshacerModal.eventoRegresar ? this.URL_GRUPOS_JERARQUICOS : this.router.url]);
    }

    eliminar(): boolean {
        this.spinner.show();

        this.grupoService.elimina(this.grupoJerarquico.id).then(
            response => {
                this.toastr.success(response.message);
                this.router.navigate([this.URL_GRUPOS_JERARQUICOS]);
                this.spinner.hide();
            },
            error => {
                this.toastr.error(GenericService.getError(error).message);
                this.spinner.hide();
            }
        )
        return true;
    }

    // Seleccionar registro
    onSelect(row: any): void {
        if (!this.getChecked(row)) {
            this.puestosSeleccionados.push(row);
        } else {
            this.puestosSeleccionados = this.puestosSeleccionados.filter(registro => registro.id != row.id);
        }
    }

    // Verificar si está seleccionado
    getChecked(row: any): boolean {
        return this.puestosSeleccionados.filter(registro => registro.id == row.id).length > 0;
    }

    disableCheck(event) {
        if(this.pageType == 'new') {
            event.target.checked = this.pageType == 'new';
        }
    }
}