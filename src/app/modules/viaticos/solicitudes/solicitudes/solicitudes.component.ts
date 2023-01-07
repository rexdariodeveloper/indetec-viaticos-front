import { Component, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { SolicitudesComponentService } from './solicitudes.service';
import { takeUntil } from 'rxjs/operators';
import { SolicitudViatico } from '@models/solicitud_viatico';
import { FilterArray } from 'app/utils/filterArray';
import { Router } from '@angular/router';

@Component({
  selector: 'solicitudes',
  templateUrl: './solicitudes.component.html',
  styleUrls: ['./solicitudes.component.scss']
})
export class SolicitudesComponent implements OnInit, OnDestroy {

  /**
   * Nombre de las Columnas a Mostrar en el listado
   */
  public columnas = [
    { prop: 'numeroSolicitud' , name: 'Número de Solicitud' },
    { prop: 'solicitante', name: 'Solicitante' },
    { prop: 'descripcionComision', name: 'Descripcion' },
    { prop: 'tipoViaje' , name: 'Tipo de Viaje' },
    { prop: 'duracionComision' , name: 'Estancia' },
    { prop: 'fechaSalida' , name: 'Fecha de Salida' },
    { prop: 'origen' , name: 'Origen' },
    { prop: 'fechaRegreso' , name: 'Fecha de Regreso' },
    { prop: 'destino', name: 'Destino'},
    { prop: 'estatus', name: 'Estatus'}
  ];

  public listadoSolicitudes: SolicitudViatico[];
  public dataTable: any[];
  public user: any = JSON.parse(localStorage.getItem('usuario'));

  //UnsubscribeAll
  private unsubscribeAll: Subject<any>;

  constructor(private _spinner: NgxSpinnerService,
    private _solicitudesService: SolicitudesComponentService,
    private router: Router,

  ) {
    this.unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.cargaDatosIniciales();
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }

  cargaDatosIniciales() {

    this._spinner.show();

    this._solicitudesService.onChanged.pipe(takeUntil(this.unsubscribeAll))
      .subscribe(response => {
        this.listadoSolicitudes = this._solicitudesService.solicitudes;
        this.dataTable = this.listadoSolicitudes;
        this._spinner.hide();
      }, error => {
        console.log(error);
        this._spinner.hide();
      });
  }

  updateFilter(event) {

    //Obtener el valor a filtrar
    const val = event.target.value.toLowerCase();

    // Buscamos el valor en los registros
    this.dataTable = FilterArray.filterArrayByString(this.listadoSolicitudes, val);
  }

  /**
   * Metodo para atrapar los eventos en la Tabla
   * @param event 
   */
  onActivate(event) {
    //Si el evento fue Click
    if (event.type === "click") {
      this.router.navigate(['app/viaticos/solicitudes/editar/' + event.row.id]);
    }
  }
}