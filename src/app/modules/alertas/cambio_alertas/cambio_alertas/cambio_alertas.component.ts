import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { CambioAlertasComponentService } from './cambio_alertas.service';
import { takeUntil } from 'rxjs/operators';
import { CambioAlerta } from '@models/cambio_alerta';
import { FilterArray } from 'app/utils/filterArray';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GenericService } from '@services/generic.service';

@Component({
  selector: 'cambio_alertas',
  templateUrl: './cambio_alertas.component.html',
  styleUrls: ['./cambio_alertas.component.scss']
})
export class CambioAlertasComponent implements OnInit, OnDestroy {

  /**
   * Nombre de las Columnas a Mostrar en el listado
   */
  public columnas = [
    { prop: 'folio', name: 'Folio' },
    { prop: 'empleadoOrigen', name: 'Empleado Origen' },
    { prop: 'empleadoDestino', name: 'Empleado Destino' },
    { prop: 'periodo', name: 'Periodo' },
    { prop: 'estatus', name: 'Estatus' }
  ];

  public listado: CambioAlerta[];
  public dataTable: any[];

  //UnsubscribeAll
  private unsubscribeAll: Subject<any>;

  constructor(private spinner: NgxSpinnerService,
    private router: Router,
    private toastr: ToastrService,
    private cambioAlertaService: CambioAlertasComponentService,

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

    this.spinner.show();

    this.cambioAlertaService.onChanged.pipe(takeUntil(this.unsubscribeAll))
      .subscribe(response => {
        this.listado = this.cambioAlertaService.cambioAlertas;
        this.dataTable = this.listado;
        this.spinner.hide();
      }, error => {
        this.toastr.error(GenericService.getError(error).message);
        this.spinner.hide();
      });
  }

  updateFilter(event) {
    //Obtener el valor a filtrar
    const val = event.target.value.toLowerCase();

    // Buscamos el valor en los registros
    this.dataTable = FilterArray.filterArrayByString(this.listado, val);
  }

  /**
   * Metodo para atrapar los eventos en la Tabla
   * @param event 
   */
  onActivate(event) {
    //Si el evento fue Click
    if (event.type === "click") {
      this.router.navigate([this.router.url + '/editar/' + event.row.id]);
    }
  }
}