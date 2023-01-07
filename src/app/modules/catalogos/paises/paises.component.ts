import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { PaisesService } from './paises.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Pais } from '@models/pais';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { ListadoCMM } from '@models/mapeos/listadoCMM';
import { FilterArray } from 'app/utils/filterArray';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { GenericService } from '@services/generic.service';
import { GenericComponent } from 'app/modules/base/generic.component';
import * as XLSX from 'xlsx';
import { localStorageHayCambios} from 'app/components/local-storage/hay-cambios/hay-cambios';

declare let jQuery: any;

@Component({
    selector: 'paises',
    templateUrl: './paises.component.html',
    styleUrls: ['./paises.component.scss']
})
export class PaisesComponent extends GenericComponent implements OnInit, AfterViewInit {
    
    // View Table
    @ViewChild('table', null) table: DatatableComponent;

    // Formulario
    public paisForm: FormGroup;

    // Models
    private paises: Pais[];
    private paisesBorrados: Pais[];
    public dataTable: any[];
    public selected = [];
    public SelectionType = SelectionType;

    // Variables de control
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
        private paisService: PaisesService,
        private router: Router
    ) {
        super();

        this.clearData();
    }

    ngOnInit() {
        this.getPaises();
    }

    ngOnDestroy() {
        this.unsubscribeAll.next();
        this.unsubscribeAll.complete();
    }

    ngAfterViewInit(): void {
        jQuery('.parsleyjsPaises').parsley().on('form:success', function() {
            this.agregar();
        }.bind(this));
    }

    limpiarParsley() {
        jQuery('.parsleyjsPaises').parsley().reset();
    }

    //Limpiar los datos
    clearData() {
        this.paises = [];
        this.paisesBorrados = [];
        this.dataTable = [];
        this.selected = [];
        
        this.modificando = false;
        this.modificado = false;
        this.id = 0;
        
        this.unsubscribeAll = new Subject();
        this.createPaisForm(null);        
		localStorageHayCambios(false);
    }

    // Obtener listado
    getPaises() {
        this.limpiarParsley();

        this.spinner.show();
        this.paisService.getPaises().then(
            response => {
                response.data.forEach(pais => {
                    this.paises.push(this.crearPais(pais));
                });
                this.dataTable = this.paises;
                this.spinner.hide();
            },
            error => {
                this.toastr.error(GenericService.getError(error).message);
                this.spinner.hide();
            }
        )
    }

    crearPais(item: any): Pais {
        this.id = item.id ? this.id : this.id - 1;
        
        let pais: Pais = new Pais();

        pais.id = item.id ? item.id : this.id;
        pais.codigo = item.codigo;
        pais.nombre = item.nombre;
        pais.estatusId = item.estatusId;
        pais.timestamp = item.timestamp;
        pais.modificado = item.modificado ? item.modificado : false;

        return pais;
    }

    createPaisForm(pais: Pais) {
        this.modificando = pais == null ? false : this.modificando;
        pais = pais ? pais : new Pais();
        
        this.paisForm = this.formBuilder.group({
            id: [pais.id],
            codigo: [pais.codigo],
            nombre: [pais.nombre],
            estatusId: [ListadoCMM.EstatusRegistro.ACTIVO],
            timestamp: [pais.timestamp],
            modificado: [pais.modificado]
        });        
    }

    agregar() {
        //Si existen datos invalidos en el Form, retornamos
        if (!this.validarForm()) {
            return;
        }

        let agregado: boolean = false;
        let agregar: boolean = true;
        
        let pais: Pais = this.crearPais(this.paisForm.value);

        this.paises.forEach((registro, i) => {
            if (registro.id == pais.id) {
                this.paises.forEach((registro, j) => {
                    if (registro.codigo == pais.codigo && i != j) {
                        this.toastr.warning("El código ya existe");
                        agregar = false;
                        return;
                    }
                });

                if (agregar) {
                    if (this.paises[i].codigo != pais.codigo || this.paises[i].nombre != pais.nombre) {
                        this.paises[i].codigo = pais.codigo;
                        this.paises[i].nombre = pais.nombre;
                        this.paises[i].modificado = true;
                        this.modificado = true;
                        agregado = true;
                    } else {
                        this.createPaisForm(null);
                    }
                    agregar = false;
                }
            }
        });

        if (agregar) {
            this.paises.forEach(registro => {
                if (registro.codigo == pais.codigo) {
                    this.toastr.warning("El código ya existe");
                    agregar = false;
                    return;
                }
            });

            if (agregar) {
                this.tableOffset = 0;
                pais.modificado = true;
                
                let dataTableTemp: Pais[] = [];
                dataTableTemp.push(pais);
                dataTableTemp.push(...this.paises);
                this.paises = [...dataTableTemp];
                
                this.modificado = true;
                agregado = true;
            }
        }

        if (agregado) {
            this.limpiarParsley();
            this.dataTable = [...this.paises];
            this.createPaisForm(null);
			localStorageHayCambios(true);
        }
    }

    validarForm(): boolean {
        return this.paisForm.valid;
    }

    guardar(): boolean {
        if (this.modificado) {
            this.spinner.show();
            let paisesTemp: Pais[] = this.paises.filter(pais => {
                return pais.modificado;
            });

            this.paisesBorrados.forEach(pais => {
                paisesTemp.push(pais);
            });

            this.paisService.guardaCambios(paisesTemp).then(
                response => {
                    this.clearData();
                    this.getPaises();
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
            this.toastr.info("No existen cambios pendientes por guardar");
            return false;
        }
    }

    cancelar(): void {
        this.clearData(); 
        this.getPaises();
    }

    eliminar(): boolean {
        let _this = this;
        this.selected.forEach(seleccionado => {
            this.paises = this.paises.filter(function(pais) {
                if (pais.id == seleccionado.id && pais.id >= 0) {
                    pais.estatusId = ListadoCMM.EstatusRegistro.BORRADO;
                    _this.paisesBorrados.push(pais);
                    _this.modificado = true;
                }
                return pais.id != seleccionado.id;
            });
        });
        this.dataTable = this.paises;
        this.selected = [];
        this.createPaisForm(null);
		localStorageHayCambios(true);
        return true;
    }

    // Seleccionar todos los registros
    onSelectAll() {
        this.selected = this.dataTable.length == this.selected.length ? [] : [...this.dataTable];
        this.createPaisForm(null);
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
        this.createPaisForm(null);
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
            this.createPaisForm(this.crearPais(event.row));
        }
    }

    // Buscar en la tabla
    updateFilter(event) {
        // Obtener el valor a filtrar
        const val = event.target.value.toLowerCase();

        // Buscamos el valor en los registros
        this.dataTable = FilterArray.filterArrayByString(this.paises, val);

        this.createPaisForm(null);
    }

    onPageChange(event) {
        this.tableOffset = event.offset;
    }

    exportAsExcel() {
        //console.log(this.table); return;

        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataTable);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(wb, ws, 'Hoja1');
        XLSX.writeFile(wb, 'Paises.xlsx');
    }
}