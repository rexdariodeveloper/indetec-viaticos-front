import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { PasajesNoUtilizadosComponentService } from './pasajes_no_utilizados.service';
import { FilterArray } from 'app/utils/filterArray';
import { Router, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GenericService } from '@services/generic.service';
import { GenericComponent } from 'app/modules/base/generic.component';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'pasajes_no_utilizados',
  templateUrl: './pasajes_no_utilizados.component.html',
  styleUrls: ['./pasajes_no_utilizados.component.scss']
})
export class PasajesNoUtilizadosComponent extends GenericComponent implements OnInit, OnDestroy {
  
  //Variables
  public listado: any[] = [];
  public dataTable: any[] = [];
  public selected = [];

  //Forms
  mySubscription: any;

  //UnsubscribeAll
  private unsubscribeAll: Subject<any>;

  constructor(
    private spinner: NgxSpinnerService,
    private service: PasajesNoUtilizadosComponentService,
    private toastr: ToastrService,
    private router: Router
  ) {
    super();
    
    // Set the private defaults
    this.unsubscribeAll = new Subject();

    // this.router.routeReuseStrategy.shouldReuseRoute = function () {
    //     return false;
    // };

    this.mySubscription = this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
            // Trick the Router into believing it's last link wasn't previously loaded
            this.router.navigated = false;
        }
    });
  }

  ngOnInit(): void {
    this.spinner.show();

    this.service.onChanged.pipe(takeUntil(this.unsubscribeAll))
      .subscribe(response => {
        this.listado = this.service.pasajes;
        this.dataTable = this.listado;
        this.spinner.hide();
      }, error => {
        this.toastr.error(GenericService.getError(error).message);
        this.spinner.hide();
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }

  validarForm(): boolean {
    return true;
  }

  guardar(): boolean {
    this.spinner.show();

    let pasajesId = [];
    this.selected.forEach(registro => {
      pasajesId.push(registro.id);
    });

    this.service.guarda(pasajesId).then(
      response => {
        this.spinner.hide();
        this.toastr.success(response.message);
        this.router.navigate([this.router.url]);
        return true;
      },
      error => {
        this.spinner.hide();
        this.toastr.error(GenericService.getError(error).message);
        return false;
      }
    )
    
    return true;
  }

  cancelar(): void {
    throw new Error("Method not implemented.");
  }

  eliminar(): boolean {
    throw new Error("Method not implemented.");
  }

  updateFilter(event): void {
    //Obtener el valor a filtrar
    const val = event.target.value.toLowerCase();

    // Buscamos el valor en los registros
    this.dataTable = FilterArray.filterArrayByString(this.listado, val);
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
}