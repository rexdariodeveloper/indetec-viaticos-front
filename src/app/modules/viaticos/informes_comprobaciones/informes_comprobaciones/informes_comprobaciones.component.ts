import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { InformesComprobacionesComponentService } from './informes_comprobaciones.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { GenericService } from '@services/generic.service';
import { ListadoSolicitudViaticoInformeComprobacion } from '@models/solicitud_viatico_informe_comprobacion';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { FilterArray } from 'app/utils/filterArray';
moment.locale('es');

@Component({
  selector: 'app-informes-comprobaciones',
  templateUrl: './informes_comprobaciones.component.html',
  styleUrls: ['./informes_comprobaciones.component.scss']
})
export class InformesComprobacionesComponent implements OnInit, OnDestroy {

  listadoSolicitudViaticoInformeComprobacion: ListadoSolicitudViaticoInformeComprobacion[];
  listadoSolicitudViaticoInformeComprobacionDataTable: ListadoSolicitudViaticoInformeComprobacion[];

  //UnsubscribeAll
  private unsubscribeAll: Subject<any>;

  constructor(
    private _spinner: NgxSpinnerService,
    private _toastr: ToastrService,
    private _informesComprobacionesService: InformesComprobacionesComponentService,
    private router: Router
  ){ 
    this.unsubscribeAll = new Subject();
  }

  ngOnInit() {
    this.loadInformesComprobaciones();
  }

  ngOnDestroy() {
    // Unsubscribe from all subscriptions
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }

  clean(){
    this.listadoSolicitudViaticoInformeComprobacion = [];
    this.listadoSolicitudViaticoInformeComprobacionDataTable = [];
  }

  loadInformesComprobaciones(){
    this._spinner.show();
    this._informesComprobacionesService.onInformesComprobacionesChanged.pipe(takeUntil(this.unsubscribeAll)).subscribe(response =>{
      if(response.status == 200)
      {
        //Clean all
        this.clean();

        //Get listado solicitud viatico informe y comprobacion
        this.listadoSolicitudViaticoInformeComprobacion = this._informesComprobacionesService.listadoSolicitudViaticoInformeComprobacion;
        this.listadoSolicitudViaticoInformeComprobacionDataTable = this.listadoSolicitudViaticoInformeComprobacion;

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
    this.listadoSolicitudViaticoInformeComprobacionDataTable = FilterArray.filterArrayByString(this.listadoSolicitudViaticoInformeComprobacion, val);
  }

  /**
   * Metodo para atrapar los eventos en la Tabla
   * @param event 
   */
  onActivate(event) {
    //Si el evento fue Click
    if (event.type === "click") {
      this.router.navigate(['app/viaticos/informes_comprobaciones/informe_comprobacion/' + event.row.id]);
    }
  }

  //Refresh
  refresh(){
    this._spinner.show();
    this.router.navigated = false;
    this.router.navigate([this.router.url]);
  }
}
