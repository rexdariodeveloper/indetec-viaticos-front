import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { EstadosService } from './estados.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Estado } from '@models/estado';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { ListadoCMM } from '@models/mapeos/listadoCMM';
import { FilterArray } from 'app/utils/filterArray';
import { SelectionType } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { GenericService } from '@services/generic.service';
import { Pais } from '@models/pais';
import { NgOption, NgSelectComponent } from '@ng-select/ng-select';
import { GenericComponent } from 'app/modules/base/generic.component';

declare let jQuery: any;

@Component({
    selector: 'estados',
    templateUrl: './estados.component.html',
    styleUrls: ['./estados.component.scss']
})
export class EstadosComponent extends GenericComponent implements OnInit, AfterViewInit {        

    @ViewChild('cboPais',null) cboPais: NgSelectComponent;

    // Formulario
    public estadoForm: FormGroup;

    // Models
    public listadoPaises: NgOption[] = [];
    
    private pais: Pais;
    private paises: Pais[];
    private estados: Estado[];
    private estadosBorrados: Estado[];
    public dataTable: any[];
    public selected = [];
    public SelectionType = SelectionType;

    // Variables de control
    public paisValido = true;
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
        private estadoService: EstadosService,
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
        jQuery('.parsleyjsEstados').parsley().on('form:success', function() {
            this.agregar();
        }.bind(this));

        jQuery('.parsleyjsEstados').parsley().on('form:error', function() {
            this.validarForm();
        }.bind(this));
    }

    limpiarParsley() {
        jQuery('.parsleyjsEstados').parsley().reset();
    }

    //Limpiar los datos
    clearData() {
        this.paisValido = true;

        this.pais = new Pais();
        this.estados = [];
        this.estadosBorrados = [];
        this.dataTable = [];
        this.selected = [];
        
        this.modificando = false;
        this.modificado = false;
        this.id = 0;
        
        this.unsubscribeAll = new Subject();
        this.createEstadoForm(null);
    }

    // Datos ficha
    getDatosFicha() {
        this.spinner.show();
        this.estadoService.getDatosFicha().then(
            response => {
                this.paises = response.data.comboPaises;

                let list: NgOption[] = [];
                
                this.paises.forEach(pais => {
                    list.push({id: pais.id, name: pais.nombre});                    
                });
                this.listadoPaises = [...list];

                response.data.listadoEstados.forEach(estado => {
                    this.estados.push(this.crearEstado(estado));
                });

                this.dataTable = this.estados;
                this.spinner.hide();
            },
            error => {
                this.toastr.error(GenericService.getError(error).message);
                this.spinner.hide();
            }
        )
    }

    // Obtener listado
    getEstados() {
        this.limpiarParsley();

        this.spinner.show();
        this.estadoService.getEstados().then(
            response => {
                response.data.forEach(estado => {
                    this.estados.push(this.crearEstado(estado));
                });
                this.dataTable = this.estados;
                this.spinner.hide();
            },
            error => {
                this.toastr.error(GenericService.getError(error).message);
                this.spinner.hide();
            }
        )
    }

    crearEstado(item: any): Estado {
        this.id = item.id ? this.id : this.id - 1;
        
        let estado: Estado = new Estado();

        estado.id = item.id ? item.id : this.id;
        estado.paisId = item.paisId;
        estado.pais = estado.id ? item.pais : null;
        estado.codigo = item.codigo;
        estado.nombre = item.nombre;
        estado.estatusId = item.estatusId;
        estado.timestamp = item.timestamp;
        estado.modificado = item.modificado ? item.modificado : false;

        return estado;
    }

    createEstadoForm(estado: Estado) {
        this.modificando = estado == null ? false : this.modificando;
        estado = estado ? estado : new Estado();

        this.estadoForm = this.formBuilder.group({
            id: [estado.id],
            paisId: [estado.paisId ? estado.paisId : null, Validators.required],
            pais: [estado.id ? estado.pais : null],
            codigo: [estado.codigo],
            nombre: [estado.nombre],
            estatusId: [ListadoCMM.EstatusRegistro.ACTIVO],
            timestamp: [estado.timestamp],
            modificado: [estado.modificado]
        });
    }

    validarForm(): boolean {
        if (this.estadoForm.invalid) {
            for (var i in this.estadoForm.controls) {
                this.estadoForm.controls[i].markAsTouched();
            }
        }

        this.paisValido = this.estadoForm.controls.paisId.valid;

        return this.estadoForm.valid;
    }

    agregar() {
        //Si existen datos invalidos en el Form, retornamos
        if (!this.validarForm()) {
            return;
        }

        let agregado: boolean = false;
        let agregar: boolean = true;

        let estado: Estado = this.crearEstado(this.estadoForm.value);

        this.estados.forEach((registro, i) => {
            if (registro.id == estado.id) {
                this.estados.forEach((registro, j) => {
                    if (registro.codigo == estado.codigo && registro.paisId == estado.paisId && i != j) {
                        this.toastr.warning("El Estado ya existe");
                        agregar = false;
                        return;
                    }
                });

                if (agregar) {
                    if (this.estados[i].paisId != this.pais.id
                            || this.estados[i].codigo != estado.codigo 
                            || this.estados[i].nombre != estado.nombre) {
                        this.estados[i].paisId = this.pais.id;
                        this.estados[i].pais = this.pais;
                        this.estados[i].codigo = estado.codigo;
                        this.estados[i].nombre = estado.nombre;
                        this.estados[i].modificado = true;
                        this.modificado = true;
                        agregado = true;
                    } else {
                        this.createEstadoForm(null);
                    }
                    agregar = false;
                }
            }
        });

        if (agregar) {
            this.estados.forEach(registro => {
                if (registro.codigo == estado.codigo && registro.paisId == estado.paisId) {
                    this.toastr.warning("El Estado ya existe");
                    agregar = false;
                    return;
                }
            });

            if (agregar) {
                this.tableOffset = 0;
                estado.modificado = true;
                estado.pais = this.pais;
                
                let dataTableTemp: Estado[] = [];
                dataTableTemp.push(estado);
                dataTableTemp.push(...this.estados);
                this.estados = [...dataTableTemp];

                this.modificado = true;
                agregado = true;
            }
        }

        if (agregado) {
            this.limpiarParsley();
            this.dataTable = [...this.estados];
            this.createEstadoForm(null);
        }
    }

    eliminar(): boolean {
        let _this = this;
        this.selected.forEach(seleccionado => {
            this.estados = this.estados.filter(function(estado) {
                if (estado.id == seleccionado.id && estado.id >= 0) {
                    estado.estatusId = ListadoCMM.EstatusRegistro.BORRADO;
                    _this.estadosBorrados.push(estado);
                    _this.modificado = true;
                }
                return estado.id != seleccionado.id;
            });
        });
        this.dataTable = this.estados;
        this.selected = [];
        this.createEstadoForm(null);
        return true;
    }

    guardar(): boolean {
        if (this.modificado) {
            this.spinner.show();

            let estadosTemp: Estado[] = this.estados.filter(estado => {
                return estado.modificado;
            });

            this.estadosBorrados.forEach(estado => {
                estadosTemp.push(estado);
            });

            this.estadoService.guardaCambios(estadosTemp).then(
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
        this.getEstados();
    }

    // Seleccionar Pais
    onComboChange(event) {
        this.paisValido = event;

        this.pais = new Pais();
        this.pais.id = event ? event.id : null;
        this.pais.nombre = event ? event.name : null;
    }

    // Seleccionar todos los registros
    onSelectAll() {
        this.selected = this.dataTable.length == this.selected.length ? [] : [...this.dataTable];
        this.createEstadoForm(null);
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
        this.createEstadoForm(null);
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
            let estado = this.crearEstado(event.row);
            this.pais = estado.pais;
            this.createEstadoForm(estado);
        }
    }

    // Buscar en la tabla
    updateFilter(event) {
        // Obtener el valor a filtrar
        const val = event.target.value.toLowerCase();

        // Buscamos el valor en los registros
        this.dataTable = FilterArray.filterArrayByString(this.estados, val);

        this.createEstadoForm(null);
    }

    onPageChange(event) {
        this.tableOffset = event.offset;
    }
}