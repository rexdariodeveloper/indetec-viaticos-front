import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { RevisionesComponentService } from './revisiones.service';
import { Router } from '@angular/router';
import { ListadoRevisionSolicitudViatico } from '@models/solicitud_viatico';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GenericService } from '@services/generic.service';
import { FilterArray } from 'app/utils/filterArray';
import * as moment from 'moment';
moment.locale('es');

@Component({
  selector: 'app-revisiones',
  templateUrl: './revisiones.component.html',
  styleUrls: ['./revisiones.component.scss']
})
export class RevisionesComponent implements OnInit, OnDestroy {

  listadoRevisionSolicitudViatico: ListadoRevisionSolicitudViatico[];
  listadoRevisionSolicitudViaticoDataTable: ListadoRevisionSolicitudViatico[];

  //UnsubscribeAll
  private unsubscribeAll: Subject<any>;

  constructor(
    private _spinner: NgxSpinnerService,
    private _toastr: ToastrService,
    private _revisionesService: RevisionesComponentService,
    private router: Router
  ) {
    this.unsubscribeAll = new Subject();
  }

  ngOnInit() {
    this.loadRevisiones();
  }

  ngOnDestroy() {
    // Unsubscribe from all subscriptions
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }

  clean(){
    this.listadoRevisionSolicitudViatico = [];
    this.listadoRevisionSolicitudViaticoDataTable = [];
  }

  loadRevisiones(){
    this._spinner.show();

    this._revisionesService.onRevisionesChanged.pipe(takeUntil(this.unsubscribeAll)).subscribe(response =>{
      if(response.status == 200)
      {
        //Clean all
        this.clean();

        //Get listado de Revision Solicitud Viatico
        this.listadoRevisionSolicitudViatico = this._revisionesService.listadoRevisionSolicitudViatico;
        this.listadoRevisionSolicitudViaticoDataTable = this.listadoRevisionSolicitudViatico;

        this._spinner.hide();
      }
    }, error =>{
      //Ocultamos el spinner
      this._spinner.hide();

      //Mostramos error 
      this._toastr.error(GenericService.getError(error).message, 'Error.',);
    });
  }

  searchInformesComprobaciones(event) {

    //Obtener el valor a filtrar
    const val = event.target.value.toLowerCase();

    // Buscamos el valor en los registros
    this.listadoRevisionSolicitudViaticoDataTable = FilterArray.filterArrayByString(this.listadoRevisionSolicitudViatico, val);
  }

  // setDateSolicitud(fechaSolicitud): string{
  //   return moment(fechaSolicitud).format("MMMM D, YYYY");
  // }
  // setDateViaje(fechaViaje): string{
  //   return moment(fechaViaje).format("MMMM D, YYYY");
  // }

  setMoney(monto:number): string{
    return '$'+ monto.toFixed(2);
  }

  /**
   * Metodo para atrapar los eventos en la Tabla
   * @param event 
   */
  onActivate(event) {
    //Si el evento fue Click
    if (event.type === "click") {
      this.router.navigate(['app/viaticos/revisiones/revision/' + event.row.id]);
    }
  }

}
