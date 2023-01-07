import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { Empleado } from '@models/empleado';
import { NotificacionesComponentService } from './notificaciones.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { FilterArray } from 'app/utils/filterArray';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AlertaListadoProjection } from '@models/alerta';
import { ToastrService } from 'ngx-toastr';
import { GenericService } from '@services/generic.service';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { AlertaService } from '@services/alerta.service';

@Component({
  selector: 'notificaciones',
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.scss']
})
export class NotificacionesComponent implements OnInit, OnDestroy {

  listAlertas: AlertaListadoProjection[];
  autorizacionesDataTable: any[];
  notificacionesDataTable: any[];

  tipoAlertaAutorizacion : string = '0';
  tipoAlertaNotificacion : string = '1';
  accionAutorizar = 1;
  accionRevision  = 2;
  accionRechazar  = 3;

  motivo: string;
  alertasForm : FormGroup;
  private selected = [];
  private SelectionType = SelectionType;

  //UnsubscribeAll
  private unsubscribeAll: Subject<any>;

  checkboxModel: any = { left: false, middle: true, right: false };
  checkbox2Model: any = { left: false, middle: false, right: false };
  radioModel: string = 'Middle';
  radio2Model: string = 'Left';

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private notificacionesService: NotificacionesComponentService,
    private alertasService : AlertaService,
    private toastr: ToastrService,
    private _router : Router,
    ) {
      this.unsubscribeAll = new Subject();
    }

  ngOnInit() {

    this.alertasForm = this.createAlertasForm();

    //Mostramos el spinner
    this.spinner.show();

    this.notificacionesService.onAlertasChanged.pipe(takeUntil(this.unsubscribeAll))
    .subscribe(response =>{
      this.listAlertas = this.notificacionesService.alertasListadoProjection;
      this.autorizacionesDataTable = this.listAlertas.filter(alerta => alerta.tipoAlertaId == 1000041);
      this.notificacionesDataTable = this.listAlertas.filter(alerta => alerta.tipoAlertaId == 1000042);
      this.spinner.hide();
    }, error =>{
       this.toastr.error(GenericService.getError(error).message);
       this.spinner.hide();
   });    
  }

  ngOnDestroy() {
    // Unsubscribe from all subscriptions
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }

  createAlertasForm() : FormGroup {
    return this.formBuilder.group(
        {
          tipoAlerta : [this.tipoAlertaAutorizacion]
        }
      );
  }

  onRadioTipoAlertaSelected(value){
    this.alertasForm.controls.tipoAlerta.setValue(value);
  }
  
  //Search Alerta
  buscaAlerta(event){
    //Obtener el valor a filtrar
    const val = event.target.value.toLowerCase();

    // Buscamos el valor en los registros
    let listadoAlertasTemp: AlertaListadoProjection[] = FilterArray.filterArrayByString(this.listAlertas,val);
    this.autorizacionesDataTable = listadoAlertasTemp.filter(alerta => alerta.tipoAlertaId == 1000041);
    this.notificacionesDataTable = listadoAlertasTemp.filter(alerta => alerta.tipoAlertaId == 1000042);

  }

  // Seleccionar todos los registros
  onCheckAll(evt) {
    this.selected = evt.target.checked ? this.notificacionesDataTable.map(item => item.alertaId) : [];
  }

  // Seleccionar registro
  onCheck(alertaId, evt): void {
    //Si se selecciono el check 
    if(evt.target.checked){
      this.selected.push(alertaId);
    }
    else{
      const index: number = this.selected.indexOf(alertaId);
      if (index !== -1) {
          this.selected.splice(index, 1);
      } 
    }
  }

  /**
   * Metodo para atrapar los eventos en la Tabla
   * @param event 
   */
  onActivate(event){    
    //Si el evento fue Click
    if(event.type === "click"){ 
      //Obtenemos el valor de Accion de la alerta selecionada
      if (event.row.rutaAccion) {
        this._router.navigateByUrl(event.row.rutaAccion);
      }
      // else {
      //   this.toastr.info('La alerta no tiene ruta de acción');
      // }
    }
  }

  onRefresh(){
    //Mostramos el spinner
    this.spinner.show();
    this.notificacionesService.getAlertas().then(
      response => {
        this.listAlertas = this.notificacionesService.alertasListadoProjection;
        this.autorizacionesDataTable = this.listAlertas.filter(alerta => alerta.tipoAlertaId == 1000041);
        this.notificacionesDataTable = this.listAlertas.filter(alerta => alerta.tipoAlertaId == 1000042);
        this.spinner.hide();
      },
      error => {
        this.toastr.error(GenericService.getError(error).message);
        this.spinner.hide();
      }
    );   
  }

  onClickStopper(){ 
    event.stopPropagation();
  }

  onAutorizar(row){
    this.spinner.show();
    this.notificacionesService.autorizar(row.alertaId).then(
      response => {
          this.toastr.success(response.message);
          this.alertasService.getListadoNuevasAlertas();
          this.notificacionesService.getAlertas();
          this.spinner.hide();
      },
      error => {
          this.toastr.error(GenericService.getError(error).message);
          this.spinner.hide();
      }
    );
  }

  onRevisionRechazar(row, accion){
    this.spinner.show();

    //Si la accion es REVISION
    if(accion === this.accionRevision){
      this.notificacionesService.revision(row.alertaId, this.motivo).then(
        response => {
            this.toastr.success(response.message);
            this.motivo = null;
            this.alertasService.getListadoNuevasAlertas();
            this.notificacionesService.getAlertas();
            this.spinner.hide();
        },
        error => {
            this.toastr.error(GenericService.getError(error).message);
            this.spinner.hide();
        }
      );
    }

    //SI la accion es RECHAZAR
    else if(accion === this.accionRechazar){
      this.notificacionesService.rechazar(row.alertaId, this.motivo).then(
        response => {
            this.toastr.success(response.message);
            this.motivo = null;
            this.alertasService.getListadoNuevasAlertas();
            this.notificacionesService.getAlertas();
            this.spinner.hide();
        },
        error => {
            this.toastr.error(GenericService.getError(error).message);
            this.spinner.hide();
        }
      );
    }
  }

  onOcultar(){
    this.spinner.show();
    this.notificacionesService.ocultarNotificaciones(this.selected).then(
      response => {
          this.toastr.success(response.message);
          this.alertasService.getListadoNuevasAlertas();
          this.notificacionesService.getAlertas();
          this.selected = [];
          this.spinner.hide();
      },
      error => {
          this.toastr.error(GenericService.getError(error).message);
          this.spinner.hide();
      }
    );    
  }
}