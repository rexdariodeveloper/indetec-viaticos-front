import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CiudadesService } from './ciudades.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Pais } from '@models/pais';
import { Estado } from '@models/estado';
import { Ciudad } from '@models/ciudad';
import { Listado_CMM } from '@models/listado_cmm';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { ListadoCMM } from '@models/mapeos/listadoCMM';
import { FilterArray } from 'app/utils/filterArray';
import { SelectionType } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { GenericService } from '@services/generic.service';
import { NgOption, NgSelectComponent } from '@ng-select/ng-select';
import { GenericComponent } from 'app/modules/base/generic.component';

declare let jQuery: any;

@Component({
    selector: 'ciudades',
    templateUrl: './ciudades.component.html',
    styleUrls: ['./ciudades.component.scss']
})
export class CiudadesComponent extends GenericComponent implements OnInit, AfterViewInit {

    @ViewChild('cboPais',null) cboPais: NgSelectComponent;
    @ViewChild('cboEstado',null) cboEstado: NgSelectComponent;
    @ViewChild('cboZona',null) cboZona: NgSelectComponent;

    // Formulario
    public ciudadForm: FormGroup;

    // Models    
    public listadoPaises: NgOption[] = [];
    public listadoEstados: NgOption[] = [];
    public listadoZonasEconomicas: NgOption[] = [];

    private pais: Pais;
    private paises: Pais[];
    private estado: Estado;
    private estados: Estado[];
    private zonaEconomica: Listado_CMM;
    private zonasEconomicas: Listado_CMM[];
    private ciudades: Ciudad[];
    private ciudadesBorradas: Ciudad[];
    public dataTable: any[];
    public selected = [];
    public SelectionType = SelectionType;

    // Variables de control
    public paisValido = true;
    public estadoValido = true;
    public zonaValida = true;
    public modificando: boolean;
    public modificado: boolean;
    private id: number;
    public tableOffset = 0;
    
    //UnsubscribeAll
    private unsubscribeAll: Subject<any>;

    constructor(
        private spinner: NgxSpinnerService,
        private formBuilder: FormBuilder,
        private toastr: ToastrService,
        private ciudadService: CiudadesService,
        private router: Router
    ) {
        super();
        this.clearData();
    }

    ngOnInit() {
        this.getDatosFicha();
    }

    ngOnDestroy() {
        this.unsubscribeAll.next();
        this.unsubscribeAll.complete();
    }

    ngAfterViewInit(): void {
        jQuery('.parsleyjsCiudades').parsley().on('form:success', function() {
            this.agregar();
        }.bind(this));

        jQuery('.parsleyjsCiudades').parsley().on('form:error', function() {
            this.validarForm();
        }.bind(this));
    }

    limpiarParsley() {
        jQuery('.parsleyjsCiudades').parsley().reset();
    }

    //Limpiar los datos
    clearData() {
        this.paisValido = true;
        this.estadoValido = true;
        this.zonaValida = true;

        this.pais = new Pais();
        this.estado = new Estado();
        this.zonaEconomica = new Listado_CMM();
        this.listadoEstados = [];
        this.ciudades = [];
        this.ciudadesBorradas = [];
        this.dataTable = [];
        this.selected = [];
        
        this.modificando = false;
        this.modificado = false;
        this.id = 0;
        
        this.unsubscribeAll = new Subject();
        this.createCiudadForm(null);
    }

    // Datos ficha
    getDatosFicha() {
        this.spinner.show();
        this.ciudadService.getDatosFicha().then(
            response => {
                this.paises = response.data.comboPaises;
                this.estados = response.data.comboEstados;
                this.listadoEstados = [];
                this.zonasEconomicas = response.data.comboZonasEconomicas;

                let list: NgOption[] = [];

                this.paises.forEach(pais => {
                    list.push({id: pais.id, name: pais.nombre});                    
                });
                this.listadoPaises = [...list];

                list = [];

                this.zonasEconomicas.forEach(zonas => {
                    list.push({id: zonas.id, name: zonas.valor});                    
                });
                this.listadoZonasEconomicas = [...list];

                response.data.listadoCiudades.forEach(ciudad => {
                    this.ciudades.push(this.crearCiudad(ciudad));
                });

                this.dataTable = this.ciudades;
                this.spinner.hide();
            },
            error => {
                this.toastr.error(GenericService.getError(error).message);
                this.spinner.hide();
            }
        )
    }

    // Obtener listado
    getCiudades() {        
        this.limpiarParsley();

        this.spinner.show();
        this.ciudadService.getCiudades().then(
            response => {
                response.data.forEach(ciudad => {
                    this.ciudades.push(this.crearCiudad(ciudad));
                });
                this.dataTable = this.ciudades;
                this.spinner.hide();
            },
            error => {
                this.toastr.error(GenericService.getError(error).message);
                this.spinner.hide();
            }
        )
    }

    crearCiudad(item: any): Ciudad {
        this.id = item.id ? this.id : this.id - 1;
        
        let ciudad: Ciudad = new Ciudad();

        ciudad.id = item.id ? item.id : this.id;
        ciudad.estadoId = item.estadoId;
        ciudad.estado = ciudad.id ? item.estado : null;
        ciudad.paisId = item.paisId;
        ciudad.pais = ciudad.id ? item.pais : null;
        ciudad.nombre = item.nombre;
        ciudad.zonaEconomicaId = item.zonaEconomicaId;
        ciudad.zonaEconomica = ciudad.id ? item.zonaEconomica : null;
        ciudad.estatusId = item.estatusId;
        ciudad.timestamp = item.timestamp;
        ciudad.modificado = item.modificado ? item.modificado : false;

        return ciudad;
    }

    createCiudadForm(ciudad: Ciudad) {
        this.modificando = ciudad == null ? false : this.modificando;
        ciudad = ciudad ? ciudad : new Ciudad();

        this.ciudadForm = this.formBuilder.group({
            id: [ciudad.id],
            estadoId: [ciudad.estadoId, Validators.required],
            estado: [ciudad.id ? ciudad.estado : null],
            paisId: [ciudad.paisId, Validators.required],
            pais: [ciudad.id ? ciudad.pais : null],
            nombre: [ciudad.nombre],
            zonaEconomicaId: [ciudad.zonaEconomicaId, Validators.required],
            zonaEconomica: [ciudad.id ? ciudad.zonaEconomica : null],
            estatusId: [ListadoCMM.EstatusRegistro.ACTIVO],
            timestamp: [ciudad.timestamp],
            modificado: [ciudad.modificado]
        });
    }

    validarForm(): boolean {
        if (this.ciudadForm.invalid) {
            for (var i in this.ciudadForm.controls) {
                this.ciudadForm.controls[i].markAsTouched();
            }
        }

        this.paisValido = this.ciudadForm.controls.paisId.valid;
        this.estadoValido = this.ciudadForm.controls.estadoId.valid;
        this.zonaValida = this.ciudadForm.controls.zonaEconomicaId.valid;

        return this.ciudadForm.valid;
    }    

    agregar() {
        //Si existen datos invalidos en el Form, retornamos
        if (!this.validarForm()) {
            return;
        }

        let agregado: boolean = false;
        let agregar: boolean = true;

        let ciudad: Ciudad = this.crearCiudad(this.ciudadForm.value);

        this.ciudades.forEach((registro, i) => {
            if (registro.id == ciudad.id) {
                this.ciudades.forEach((registro, j) => {
                    if (registro.nombre == ciudad.nombre && registro.estadoId == ciudad.estadoId && i != j) {
                        this.toastr.warning("La ciudad ya existe");
                        agregar = false;
                        return;
                    }
                });

                if (agregar) {
                    if (this.ciudades[i].paisId != this.pais.id
                            || this.ciudades[i].estadoId != this.estado.id
                            || this.ciudades[i].zonaEconomicaId != this.zonaEconomica.id
                            || this.ciudades[i].nombre != ciudad.nombre) {
                        this.ciudades[i].paisId = this.pais.id;
                        this.ciudades[i].pais = this.pais;
                        this.ciudades[i].estadoId = this.estado.id;
                        this.ciudades[i].estado = this.estado;
                        this.ciudades[i].zonaEconomicaId = this.zonaEconomica.id;
                        this.ciudades[i].zonaEconomica = this.zonaEconomica;
                        this.ciudades[i].nombre = ciudad.nombre;
                        this.ciudades[i].modificado = true;
                        this.modificado = true;
                        agregado = true;
                    } else {
                        this.createCiudadForm(null);
                    }
                    agregar = false;
                }
            }
        });

        if (agregar) {
            this.ciudades.forEach(registro => {
                if (registro.nombre == ciudad.nombre && registro.estadoId == ciudad.estadoId) {
                    this.toastr.warning("La ciudad ya existe");
                    agregar = false;
                    return;
                }
            });

            if (agregar) {
                this.tableOffset = 0;
                ciudad.modificado = true;
                ciudad.pais = this.pais;
                ciudad.estado = this.estado;
                ciudad.zonaEconomica = this.zonaEconomica;

                let dataTableTemp: Ciudad[] = [];
                dataTableTemp.push(ciudad);
                dataTableTemp.push(...this.ciudades);
                this.ciudades = [...dataTableTemp];
                
                this.modificado = true;
                agregado = true;
            }
        }

        if (agregado) {
            this.limpiarParsley();
            this.dataTable = [...this.ciudades];
            this.createCiudadForm(null);
        }
    }

    eliminar(): boolean {
        let _this = this;
        this.selected.forEach(seleccionado => {
            this.ciudades = this.ciudades.filter(function(ciudad) {
                if (ciudad.id == seleccionado.id && ciudad.id >= 0) {
                    ciudad.estatusId = ListadoCMM.EstatusRegistro.BORRADO;
                    _this.ciudadesBorradas.push(ciudad);
                    _this.modificado = true;
                }
                return ciudad.id != seleccionado.id;
            });
        });
        this.dataTable = this.ciudades;
        this.selected = [];
        this.createCiudadForm(null);
        return true;
    }

    guardar(): boolean {
        if (this.modificado) {
            this.spinner.show();

            let ciudadesTemp: Ciudad[] = this.ciudades.filter(ciudad => {
                return ciudad.modificado;
            });

            this.ciudadesBorradas.forEach(ciudad => {
                ciudadesTemp.push(ciudad);
            });

            this.ciudadService.guardaCambios(ciudadesTemp).then(
                response => {
                    this.clearData();
                    this.getDatosFicha();
                    this.toastr.success(response.message);
                    this.spinner.hide();
                    return true;
                },
                error => {
                    this.toastr.error(GenericService.getError(error).message);
                    this.spinner.hide();
                    return false;
                }
            )
        } else {
            this.toastr.info("No existen cambios pendientes por guardar")
            return false;
        }
    }

    cancelar(): void {
        this.clearData();
        this.getCiudades();
    }

    // Seleccionar Pais
    comboPaisChange(event) {
        this.paisValido = event;        

        this.pais = new Pais();
        this.pais.id = event ? event.id : null;
        this.pais.nombre = event ? event.name : null;

        let list: NgOption[] = [];
        this.estados.forEach(estado => {
            if (estado.paisId == this.pais.id) {
                list.push({id: estado.id, name: estado.nombre});
            }
        });
        this.listadoEstados = [...list];

        this.estado = new Estado();

        this.ciudadForm.value.estadoId = null;
        this.ciudadForm.value.estado = this.estado;

        this.createCiudadForm(this.ciudadForm.value);
    }

    // Seleccionar Estado
    comboEstadoChange(event) {
        this.estadoValido = event;

        this.estado = new Estado();
        this.estado.id = event ? event.id : null;
        this.estado.nombre = event ? event.name : null;
    }

    // Seleccionar Pais
    comboZonaEconomicaChange(event) {
        this.zonaValida = event;
        
        this.zonaEconomica = new Listado_CMM();
        this.zonaEconomica.id = event ? event.id : null;
        this.zonaEconomica.valor = event ? event.name : null;
    }

    // Seleccionar todos los registros
    onSelectAll() {
        this.selected = this.dataTable.length == this.selected.length ? [] : [...this.dataTable];
        this.createCiudadForm(null);
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
        this.createCiudadForm(null);
    }

    // Verificar si está seleccionado
    getChecked(row: any): boolean {
        const item = this.selected.filter(e => e.id == row.id);
        return item.length > 0;
    }

    // Editar registro
    onActivate(event) {
        if (event.type == "dblclick") {
            this.modificando = true;
            let ciudad = this.crearCiudad(event.row);
            
            this.pais = ciudad.pais;
            this.estado = ciudad.estado;
            this.zonaEconomica = ciudad.zonaEconomica;

            let list: NgOption[] = [];
            this.estados.forEach(estado => {
                if (estado.paisId == this.pais.id) {
                    list.push({ id: estado.id, name: estado.nombre });
                }
            });
            this.listadoEstados = [...list];
            
            this.createCiudadForm(ciudad);
        }
    }

    // Buscar en la tabla
    updateFilter(event) {
        // Obtener el valor a filtrar
        const val = event.target.value.toLowerCase();

        // Buscamos el valor en los registros
        this.dataTable = FilterArray.filterArrayByString(this.ciudades, val);

        this.createCiudadForm(null);
    }

    onPageChange(event) {
        this.tableOffset = event.offset;
    }
}