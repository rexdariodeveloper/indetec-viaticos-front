import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { GenericService } from '@services/generic.service';
import { AsignacionesComponentService } from './asignaciones.service';
import { takeUntil } from 'rxjs/operators';
import { FilterArray } from 'app/utils/filterArray';
import { Router } from '@angular/router';
import { AsignacionListado } from '@models/asignacion';
import * as moment from 'moment';
moment.locale('es');

@Component({
  selector: 'app-asignaciones',
  templateUrl: './asignaciones.component.html',
  styleUrls: ['./asignaciones.component.scss']
})
export class AsignacionesComponent implements OnInit, OnDestroy {

  asignacionListado: AsignacionListado[];
  asignacionListadoDataTable: AsignacionListado[];

  //UnsubscribeAll
  private unsubscribeAll: Subject<any>;

  constructor(
    private _asignacionesService: AsignacionesComponentService,
    private _spinner: NgxSpinnerService,
    private _toastr: ToastrService,
    private router: Router
  ) {
    this.unsubscribeAll = new Subject();
  }

  ngOnInit() {
    this.loadAsignaciones();
  }

  ngOnDestroy() {
    // Unsubscribe from all subscriptions
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }

  //Sacan todos empleados (listado)
  loadAsignaciones() {
    this._spinner.show();
    this._asignacionesService.onAsignacionesChanged.pipe(takeUntil(this.unsubscribeAll)).subscribe(response => {
      if (response.status == 200) {
        this.asignacionListado = this._asignacionesService.asignacionListado;
        this.asignacionListadoDataTable = this.asignacionListado;

        this._spinner.hide();
      }
    }, error => {
      //Ocultamos el spinner
      this._spinner.hide();

      //Mostramos error 
      this._toastr.error(GenericService.getError(error).message);
    });
  }

  searchAsignaciones(event) {

    //Obtener el valor a filtrar
    const val = event.target.value.toLowerCase();

    // Buscamos el valor en los registros
    this.asignacionListadoDataTable = FilterArray.filterArrayByString(this.asignacionListado, val);
  }

  /**
   * Metodo para atrapar los eventos en la Tabla
   * @param event 
   */
  onActivate(event) {
    //Si el evento fue Click
    if (event.type === "click") {
      this.router.navigate(['app/viaticos/asignaciones/asignacion-viatico/' + event.row.id]);
    }
  }
}
