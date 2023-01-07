import { Component, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { GruposJerarquicosComponentService } from './grupos_jerarquicos.service';
import { takeUntil } from 'rxjs/operators';
import { GrupoJerarquico } from '@models/grupo_jerarquico';
import { FilterArray } from 'app/utils/filterArray';
import { Router } from '@angular/router';

@Component({
  selector: 'grupos_jerarquicos',
  templateUrl: './grupos_jerarquicos.component.html',
  styleUrls: ['./grupos_jerarquicos.component.scss']
})
export class GruposJerarquicosComponent implements OnInit, OnDestroy {

  /**
   * Nombre de las Columnas a Mostrar en el listado
   */
  public columnas = [
    { prop: 'nombre', name: 'Nombre' },
    { prop: 'descripcion', name: 'Descripción' },
    { prop: 'noPuestos', name: 'Puestos en Grupo' },
    { prop: 'estatus', name: 'Estatus' },
  ];

  public listado: GrupoJerarquico[];
  public dataTable: any[];

  //UnsubscribeAll
  private unsubscribeAll: Subject<any>;

  constructor(private spinner: NgxSpinnerService,
    private router: Router,
    private grupoService: GruposJerarquicosComponentService,

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

    this.grupoService.onChanged.pipe(takeUntil(this.unsubscribeAll))
      .subscribe(response => {
        this.listado = this.grupoService.gruposJerarquicos;
        this.dataTable = this.listado;
        this.spinner.hide();
      }, error => {
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
    if (event.type == "click") {
      this.router.navigate(['app/catalogos/grupos_jerarquicos/editar/' + event.row.id]);
    }
  }
}