import { Component, OnInit, OnDestroy, ViewEncapsulation, AfterViewInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { ConceptoViaticosComponentService } from './concepto_viaticos.service';
import { takeUntil } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { GenericService } from '@services/generic.service';
import { ConceptoViatico } from '@models/concepto_viatico';
import { ListadoCMM } from '@models/mapeos/listadoCMM';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FilterArray } from 'app/utils/filterArray';
import { GenericComponent } from 'app/modules/base/generic.component';
import { NgOption, NgSelectComponent } from '@ng-select/ng-select';

declare let jQuery: any;

@Component({
  selector: 'app-concepto-viaticos',
  templateUrl: './concepto_viaticos.component.html',
  styleUrls: ['./concepto_viaticos.component.scss']
})
export class ConceptoViaticosComponent extends GenericComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('cboPresupuesto', null) cboPais: NgSelectComponent;

  //Select2
  select2Options: any = {
    theme: 'bootstrap'
  };

  conceptoViaticos: ConceptoViatico[];
  conceptoViaticosDataTable: ConceptoViatico[];
  conceptoViaticosSelected = [];
  conceptoViaticosForm: FormGroup;

  // Models
  public objetoGasto: any[];
  public listadoPresupuestos: NgOption[] = [];

  // Variables de control
  public presupuestoValido: boolean;
  public modificado: boolean;
  public tableOffset = 0;

  //UnsubscribeAll
  private unsubscribeAll: Subject<any>;

  constructor(
    private _conceptoViaticosService: ConceptoViaticosComponentService,
    private _spinner: NgxSpinnerService,
    private _toastr: ToastrService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    super();

    this.unsubscribeAll = new Subject();
  }

  ngOnInit() {
    this.loadConceptoViaticos();
  }

  ngOnDestroy() {
    // Unsubscribe from all subscriptions
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }

  ngAfterViewInit(): void {
    jQuery('.parsleyjsConceptoViaticos').parsley();
  }

  limpiarParsley() {
    jQuery('.parsleyjsConceptoViaticos').parsley().destroy();
    jQuery('.parsleyjsConceptoViaticos').parsley();
  }

  //Clean Data
  clearData() {
    this.presupuestoValido = true;
    this.modificado = false;

    this.unsubscribeAll = new Subject();
    this.createViaticoForm(null);
  }

  loadConceptoViaticos(): void {
    this._spinner.show();
    this._conceptoViaticosService.onViaticosChanged.pipe(takeUntil(this.unsubscribeAll)).subscribe(response => {
      this.clearData();
      let viaticoOrden: number = 1;
      this.objetoGasto = this._conceptoViaticosService.objetoGasto;
      if(this.objetoGasto == null){
        this.objetoGasto = [];
        this.objetoGasto.push({
          id:1,
          nombre: 'hola mundo'
        });
      }
      this.conceptoViaticos = this._conceptoViaticosService.conceptoViaticos;
      this.conceptoViaticos.map(cv => {
        cv.objetoGasto = this.objetoGasto.find(objeto => parseInt(objeto.id) == cv.objetoGastoId);
        cv.orden = viaticoOrden;
        viaticoOrden++;
      });

      let list: NgOption[] = [];
      this.objetoGasto.forEach(objeto => {
        list.push({ id: parseInt(objeto.id), name: objeto.id + ' - ' + objeto.nombre });
      });
      this.listadoPresupuestos = [...list];

      this.conceptoViaticos.map(cv => {
        cv.objetoGasto = this.objetoGasto.find(objeto => parseInt(objeto.id) == cv.objetoGastoId);
        cv.orden = viaticoOrden;
        viaticoOrden++;
      });

      this.conceptoViaticosDataTable = this.conceptoViaticos;
      this._spinner.hide();
    }, error => {
      this._spinner.hide();
      this._toastr.error(GenericService.getError(error).message);
    });
  }

  createViaticoForm(concentoViatico: ConceptoViatico) {
    concentoViatico = concentoViatico ? concentoViatico : new ConceptoViatico();
    this.conceptoViaticosForm = this.formBuilder.group({
      id: [concentoViatico.id],
      codigo: [concentoViatico.codigo],
      concepto: [concentoViatico.concepto],
      objetoGastoId: [concentoViatico.objetoGastoId, Validators.required],
      estatus: [concentoViatico.estatusId == ListadoCMM.EstatusRegistro.ACTIVO ? true : false],
      noPermitirSinPernocta: [concentoViatico.noPermitirSinPernocta],
      orden: [concentoViatico.orden]
    });
  }

  isSelectedObjetoGasto(event): void {
    this.presupuestoValido = event;

    if (event) {
      this.conceptoViaticosForm.controls.objetoGastoId.setValue(parseInt(event.id));
    } else {
      this.conceptoViaticosForm.controls.objetoGastoId.setValue(null);
    }
  }

  // Search puestos
  searchViatico(event): void {

    //Obtener el valor a filtrar
    const val = event.target.value.toLowerCase();

    // Buscamos el valor en los registros
    this.conceptoViaticosDataTable = FilterArray.filterArrayByString(this.conceptoViaticos.filter(cv => cv.estatusId !== ListadoCMM.EstatusRegistro.BORRADO), val);
  }

  onPageChange(event) {
    this.tableOffset = event.offset;
  }

  //Change value puesto
  validarCodigo(): boolean {
    let codigo = this.conceptoViaticosForm.controls.codigo.value;
    if (this.conceptoViaticosDataTable.filter(cv => cv.orden != this.conceptoViaticosForm.controls.orden.value && cv.codigo == codigo).length > 0) {
      this._toastr.warning("El código ya existe");
      return false;
    }
    return true;
  }

  //Validate Form
  validarForm(): boolean {
    if (this.conceptoViaticosForm.invalid) {
      for (var i in this.conceptoViaticosForm.controls) {
        this.conceptoViaticosForm.controls[i].markAsTouched();
      }
    }

    this.presupuestoValido = this.conceptoViaticosForm.controls.objetoGastoId.valid;

    if (!this.validarCodigo()) {
      return false;
    }

    return this.conceptoViaticosForm.valid;
  }

  // Add one concepto viatico
  agregar(): boolean {

    //Validamos que se hayan llenado los datos requeridos
    if (!this.validarForm()) {
      return false;
    }

    this.tableOffset = 0;
    let newConceptoViatico: ConceptoViatico = new ConceptoViatico(this.conceptoViaticosForm.getRawValue());
    newConceptoViatico.categoriaId = ListadoCMM.CategoriaViatico.VIATICO;
    newConceptoViatico.objetoGasto = this.objetoGasto.find(objeto => objeto.id == this.conceptoViaticosForm.controls.objetoGastoId.value);
    newConceptoViatico.estatusId = this.conceptoViaticosForm.controls.estatus.value ? ListadoCMM.EstatusRegistro.ACTIVO : ListadoCMM.EstatusRegistro.INACTIVO;
    newConceptoViatico.orden = this.conceptoViaticos.length + 1;
    this.conceptoViaticos.unshift(newConceptoViatico);
    this.conceptoViaticosDataTable = [...this.conceptoViaticos.filter(cv => cv.estatusId !== ListadoCMM.EstatusRegistro.BORRADO)];

    this.createViaticoForm(null);
    this.modificado = true;
    this.limpiarParsley();
  }

  //Update Data Of Concepto Viatico
  updateViatico(): boolean {

    //Validamos que se hayan llenado los datos requeridos
    if (!this.validarForm()) {
      return false;
    }

    let updateConceptoViatico: ConceptoViatico = this.conceptoViaticosForm.getRawValue();
    updateConceptoViatico.estatusId = this.conceptoViaticosForm.controls.estatus.value ? ListadoCMM.EstatusRegistro.ACTIVO : ListadoCMM.EstatusRegistro.INACTIVO;
    this.conceptoViaticos.filter(cv => cv.orden == updateConceptoViatico.orden && cv.estatusId !== ListadoCMM.EstatusRegistro.BORRADO).map(cv => {
      this.modificado = (cv.codigo != updateConceptoViatico.codigo
        || cv.concepto != updateConceptoViatico.concepto
        || cv.objetoGastoId != updateConceptoViatico.objetoGastoId
        || cv.estatusId != updateConceptoViatico.estatusId
        || cv.noPermitirSinPernocta != updateConceptoViatico.noPermitirSinPernocta) ? true : this.modificado;

      cv.codigo = updateConceptoViatico.codigo;
      cv.concepto = updateConceptoViatico.concepto;
      cv.objetoGastoId = updateConceptoViatico.objetoGastoId;
      cv.estatusId = updateConceptoViatico.estatusId;
      cv.noPermitirSinPernocta = updateConceptoViatico.noPermitirSinPernocta;
    });

    this.conceptoViaticosDataTable = [...this.conceptoViaticos.filter(cv => cv.estatusId !== ListadoCMM.EstatusRegistro.BORRADO)];

    this.createViaticoForm(null);
    this.limpiarParsley();
  }

  //Select cargo or cargos
  selectViatico({ selected }): void {
    this.conceptoViaticosSelected.splice(0, this.conceptoViaticosSelected.length);
    this.conceptoViaticosSelected.push(...selected);
  }

  //Remove concepto viatico or concepto viaticos
  eliminar(): boolean {
    this.conceptoViaticos.map(cv => {
      if (this.conceptoViaticosSelected.filter(selected => selected.orden == cv.orden).length > 0) {
        cv.estatusId = ListadoCMM.EstatusRegistro.BORRADO;
        this.modificado = true;
      }
    });
    this.conceptoViaticosDataTable = [...this.conceptoViaticos.filter(cv => cv.estatusId !== ListadoCMM.EstatusRegistro.BORRADO)];
    this.conceptoViaticosSelected = [];

    this.createViaticoForm(null);
    return true;
  }

  //Load set estatus
  setObjetoGasto(id: number): string {
    let objetoGasto: any = this.objetoGasto.find(objeto => parseInt(objeto.id) == id);
    return objetoGasto ? objetoGasto.id + ' - ' + objetoGasto.nombre : '';
  }

  //Load set estatus
  setEstatus(estatusId: number): string {
    return estatusId == ListadoCMM.EstatusRegistro.ACTIVO ? 'Activo' : 'Inactivo';
  }

  /**
   * Metodo para atrapar los eventos en la Tabla
   * @param event 
   */
  onActivate(event): void {
    //Si el evento fue Click
    if (event.type == "dblclick") {
      this.isSelectViatico(event.row);
    }
  }

  isSelectViatico(concentoViatico: any): void {
    this.createViaticoForm(concentoViatico);
  }

  //Vertify Checkbox
  vertifyCheckbox(event) {
    if (this.conceptoViaticosForm.controls.id.value == null) {
      event.target.checked = true;
    }
  }

  //Save puesto or puestos
  guardar(): boolean {
    this._spinner.show();

    if (this.modificado) {
      const send: Array<ConceptoViatico> = this.conceptoViaticos;

      this._conceptoViaticosService.save(send).then((response) => {
        if (response.status == 200) {

          //Ocultamos el spinner
          this._spinner.hide();

          this._toastr.success('Cambios guardados.');

          this.clearData();

          //Get listado Puesto Refresh
          let viaticoOrden: number = 1;
          this.conceptoViaticos = response.data;
          this.conceptoViaticos = this.conceptoViaticos.filter(cv => cv.estatusId !== ListadoCMM.EstatusRegistro.BORRADO);
          if (this.conceptoViaticos.length > 0) {
            this.conceptoViaticos.map(cv => {
              cv.orden = viaticoOrden;
              viaticoOrden++;
            })
          }
          this.conceptoViaticos = [...this.conceptoViaticos];
          this.conceptoViaticosSelected = [];

          return true;
        }
        return false;
      }, error => {
        //Ocultamos el spinner
        this._spinner.hide();

        //Mostramos error 
        this._toastr.error(GenericService.getError(error).message);

        return false;
      });
    } else {
      //Ocultamos el spinner
      this._spinner.hide();
      this._toastr.info("No existen cambios pendientes por guardar")
      return false;
    }
    return true;
  }

  // Cancel Concepto Viaticos Refresh
  cancelar(): void {
    this.limpiarParsley();
    this._spinner.show();

    this.presupuestoValido = true;
    this.modificado = false;
    this.tableOffset = 0;
    
    //this.router.navigated = false;
    this.router.navigate([this.router.url]);
  }
}