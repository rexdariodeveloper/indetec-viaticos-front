import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReporteTransparenciaComponentService } from './reporte_transparencia.service';
import { FilterArray } from 'app/utils/filterArray';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { GenericService } from '@services/generic.service';
import { DateTimeAdapter } from 'ng-pick-datetime';
import { ModalDirective } from 'ngx-bootstrap';
import { ArchivoService } from '@services/archivo.service';
declare let jQuery: any;

@Component({
  selector: 'reporte_transparencia',
  templateUrl: './reporte_transparencia.component.html',
  styleUrls: ['./reporte_transparencia.component.scss']
})
export class ReporteTransparenciaComponent implements AfterViewInit, OnInit, OnDestroy {

  // Modal
  @ViewChild('exportarModal', { static: true }) exportarModal: ModalDirective;

  //Variables
  public maxFechaInicio: Date;
  public minFechaFin: Date;
  public maxModalFechaInicio: Date;
  public minModalFechaFin: Date;
  public listado: any[] = [];
  public dataTable: any[] = [];
  public selected = [];

  //Forms
  datosForm: FormGroup;
  modalForm: FormGroup;

  //UnsubscribeAll
  private unsubscribeAll: Subject<any>;

  constructor(
    private spinner: NgxSpinnerService,
    private service: ReporteTransparenciaComponentService,
    private archivoService: ArchivoService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private router: Router,
    private dateTimeAdapter: DateTimeAdapter<any>
  ) {
    // Date Time Adapter Locale In Mexico
    dateTimeAdapter.setLocale('es-MX');
    
    this.unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.datosForm = this.createDatosForm();
    this.createModalForm();
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }

  ngAfterViewInit(): void {
    jQuery('.parsleyjsReporteTransparencia').parsley();
  }

  limpiarModalParsley(): void {
    jQuery("input[id=modalFechaInicio]").parsley().reset();
    jQuery("input[id=modalFechaFin]").parsley().reset();
    jQuery("input[id=modalFechaValidacion]").parsley().reset();
    jQuery("input[id=modalFechaActualizacion]").parsley().reset();
    this.minModalFechaFin = this.maxModalFechaInicio = null;
  }

  limpiar(): void {
    this.minFechaFin = this.maxFechaInicio = null;
    this.listado = [];
    this.dataTable = [];
    this.selected = [];
  }

  createDatosForm(): FormGroup {
    return this.formBuilder.group({
      fechaInicio: [null, Validators.required],
      fechaFin: [null, Validators.required],
    });
  }

  createModalForm(): void {
    this.limpiarModalParsley();
    this.modalForm = this.formBuilder.group({
      fechaInicio: [null, Validators.required],
      fechaFin: [null, Validators.required],
      fechaValidacion: [new Date(), Validators.required],
      fechaActualizacion: [new Date(), Validators.required],
    });
  }

  validarForm(): boolean {
    if (this.datosForm.invalid) {
      for (var i in this.datosForm.controls) {
        this.datosForm.controls[i].markAsTouched();
      }
    }

    return this.datosForm.valid;
  }

  validarModalForm(): boolean {
    if (this.modalForm.invalid) {
      for (var i in this.modalForm.controls) {
        this.modalForm.controls[i].markAsTouched();
      }
    }

    return this.modalForm.valid;
  }

  buscarReporte(): void {
    if (!this.validarForm()) {
      return;
    } else {
      this.limpiar();

      this.spinner.show();

      this.service.getReporteTransparencia(
        this.datosForm.controls.fechaInicio.value, 
        this.datosForm.controls.fechaFin.value).then(
        response => {
          this.listado = response.data;
          this.dataTable = this.listado;
          this.spinner.hide();
        }, error => {
          this.toastr.error(GenericService.getError(error).message);
          this.spinner.hide();
        }
      );
    }
  }

  exportarReporteTransparencia(): void {
    if (!this.validarModalForm()) {
      return;
    } else {
      this.spinner.show();

      let reporte: any = [];      
      this.listado.forEach(registro => {
        this.selected.forEach(selected => {
          if (registro.id == selected.id) {
            reporte.push(registro);
          }
        });
      });

      this.exportarModal.hide();
      this.service.descargarReporteTransparencia(
        this.modalForm.controls.fechaInicio.value,
        this.modalForm.controls.fechaFin.value,
        this.modalForm.controls.fechaValidacion.value,
        this.modalForm.controls.fechaActualizacion.value,
        reporte).then(
        response => {
          this.limpiarModalParsley();
          
          this.archivoService.descargarBlob(response, 'Reporte Transparencia.xls', '.xls');
          this.spinner.hide();
        },
        error => {
          this.toastr.error('Error al generar el reporte.');
          this.spinner.hide();
        }
      );    
    }
  }

  exportarReporteConcentrado(): void {
    this.spinner.show();

    let solicitudIds: string = '';
    this.selected.forEach(selected => {
      solicitudIds += (',' + selected.id + ',');
    });

    this.service.descargarReporteTransparenciaConcentrado(solicitudIds).then(
      response => {
        this.archivoService.descargarBlob(response, 'Reporte Transparencia Concentrado.xls', '.xls');
        this.spinner.hide();
      },
      error => {
        this.toastr.error('Error al generar el reporte.');
        this.spinner.hide();
      }
    );
  }

  validarRegistrosSeleccionados(mostrarModal: boolean): void {
    if (this.selected.length == 0) {
      this.toastr.warning('No se ha seleccionado ningún registro para exportar.');
    } else {
      if (mostrarModal) {
        this.exportarModal.show();
        this.createModalForm();
      } else {
        this.exportarReporteConcentrado();
      }
    }
  }

  updateFilter(event): void {
    //Obtener el valor a filtrar
    const val = event.target.value.toLowerCase();

    // Buscamos el valor en los registros
    this.dataTable = FilterArray.filterArrayByString(this.listado, val);
  }

  fechaInicioChange(modal: boolean): void {
    if (!modal) {
      this.minFechaFin = this.datosForm.controls.fechaInicio.value;
    } else {
      this.minModalFechaFin = this.modalForm.controls.fechaInicio.value;
    }
  }

  fechaFinChange(modal: boolean): void {
    if (!modal) {
      this.maxFechaInicio = this.datosForm.controls.fechaFin.value;
    } else {
      this.maxModalFechaInicio = this.modalForm.controls.fechaFin.value;
    }
  }

  // Seleccionar todos los registros
  onSelectAll() {
    this.selected = this.dataTable.length == this.selected.length ? [] : [...this.dataTable];
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
  }

  // Verificar si está seleccionado
  getChecked(row: any): boolean {
    const item = this.selected.filter(e => e.id == row.id);
    return item.length > 0;
  }

  // Agregar campo Notas
  updateNotas(value, rowIndex): void {
    this.listado.filter(registro => registro.id == rowIndex)[0].notas = value;
  }

  verResumen(id: number): void {
    window.open('app/viaticos/solicitudes/editar/' + id);
  }

  // Validate Date
  validateDate(name: string): void {
    jQuery("input[id=" + name + "]").parsley().reset();
  }
}