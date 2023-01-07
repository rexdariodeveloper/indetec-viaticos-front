import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { GrupoJerarquico } from '@models/grupo_jerarquico';
import { Subject } from 'rxjs';
import { MatrizViaticosComponentService } from './matriz_viaticos.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { GenericService } from '@services/generic.service';
import { takeUntil } from 'rxjs/operators';
import { MatrizViatico } from '@models/matriz_viatico';
import { Listado_CMM } from '@models/listado_cmm';
import { ConceptoViatico } from '@models/concepto_viatico';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { GenericComponent } from 'app/modules/base/generic.component';
import { environment } from 'environments/environment';
import { MoneyPipe } from 'app/pipes/money.pipe';

@Component({
  selector: 'app-matriz-viaticos',
  templateUrl: './matriz_viaticos.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./matriz_viaticos.component.scss']
})
export class MatrizViaticosComponent extends GenericComponent implements OnInit, OnDestroy {

  //Input Mask Money
  maskMoney = {
    mask: createNumberMask({
      prefix: '$',
      includeThousandsSeparator: true,
      allowDecimal: true,
    }),
  }

  // Data Table Configre
  isLoading: boolean = true;
  dataTableColumns: any[];
  dataTableRows: any[] = [];

  //Matriz Viaticos
  matrizViatico: MatrizViatico[];

  //Grupo Jerarquicos
  grupoJerarquicoId: number = null;
  grupoJerarquico: GrupoJerarquico[];
  bloquearGrupos: boolean = false;

  //Zonas
  zonas: Listado_CMM[];

  //Concepto Viaticos
  viaticos: ConceptoViatico[];

  //UnsubscribeAll
  private unsubscribeAll: Subject<any>;

  constructor(
    private _matrizViaticoService: MatrizViaticosComponentService,
    private _spinner: NgxSpinnerService,
    private _toastr: ToastrService,
    private moneyPipe: MoneyPipe
  ) {
    super();

    this.unsubscribeAll = new Subject();
  }

  ngOnInit() {
    this.loadMatrizViaticos();
  }

  ngOnDestroy() {
    // Unsubscribe from all subscriptions
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }

  loadMatrizViaticos(): void {
    this._spinner.hide();
    this._matrizViaticoService.onMatrizViaticosChanged.pipe(takeUntil(this.unsubscribeAll)).subscribe(response => {
      if (response.status == 200) {
        this._spinner.hide();
        this.grupoJerarquico = this._matrizViaticoService.grupoJerarquico;
      }
    }, error => {
      this._spinner.hide();

      this._toastr.error(GenericService.getError(error).message);
    });
  }

  cancelar(): void {
    this.dataTableColumns = [];
    this.dataTableRows = [];
    this.matrizViatico = [];
    this.bloquearGrupos = false;
  }

  isSelectedGrupoJerarquico(grupoJerarquicoId): void {
    this._spinner.show();
    this.cancelar();
    this.grupoJerarquicoId = grupoJerarquicoId;
    this._matrizViaticoService.getDatosFicha(grupoJerarquicoId).then(response => {
      this._spinner.hide();
      this.matrizViatico = this._matrizViaticoService.matrizViatico;
      this.zonas = this._matrizViaticoService.zonas;
      this.viaticos = this._matrizViaticoService.viaticos;
      this.jsonTodataTable();
    }, error => {
      this._spinner.hide();
      this._toastr.error(GenericService.getError(error).message);
    })

  }

  jsonTodataTable(): void {
    this.isLoading = true
    let getZonas: any[] = [];
    this.zonas.map(zona => {
      getZonas.push(zona.id);
      this.dataTableColumns.push({ prop: zona.id, name: zona.valor });
    });
    this.viaticos.map(viatico => {
      var setRow = {};
      setRow = { grupoJerarquicoId: this.grupoJerarquicoId, conceptoViaticoId: viatico.id, concepto: viatico.concepto };
      getZonas.map(zona => {
        let monto: string = '0';
        const matrizViatico = this.matrizViatico.find(mv => mv.listadoZonaId === zona && mv.conceptoViaticoId === viatico.id && mv.grupoJerarquicoId === this.grupoJerarquicoId);
        if (matrizViatico !== undefined) {
          monto = this.createCurrencyMask(matrizViatico.monto.toString());
        } else {
          monto = this.createCurrencyMask(monto);
        }

        setRow = Object.assign(setRow, { [zona]: monto });
      });

      this.dataTableRows.push(setRow);
    });

    this.dataTableRows = [...this.dataTableRows];
    this.isLoading = false;
  }

  // Money convert to Mask '$0.00' or '$12.45' 
  createCurrencyMask(monto: string): string {
    return this.moneyPipe.transform(monto);
  };

  updateViaticos(event, cell, rowIndex, row) {
    //Get index of rows
    let index: number = this.dataTableRows.indexOf(row);
    let monto: string = '0';
    if (event.target.value === '') {
      monto = this.createCurrencyMask(monto);
    } else {
      monto = this.createCurrencyMask(event.target.value);
    }

    let money: number = this.moneyPipe.convertToNumber(event.target.value);
    let moneyLimit = environment.moneyLimit;
    if (money > moneyLimit) {
      this._toastr.error('El Monto no puede ser mayor a $' + moneyLimit);
      money = moneyLimit;
      monto = this.createCurrencyMask(moneyLimit.toString());
    }

    //this.dataTableRows[rowIndex][cell] = monto;
    this.dataTableRows[index][cell] = monto;
    this.dataTableRows = [...this.dataTableRows];
    this.bloquearGrupos = true;
  }

  validarForm(): boolean {
    throw new Error("Method not implemented.");
  }
  
  guardar(): boolean {
    const newMatrizViatico: MatrizViatico[] = [];
    this.dataTableRows.map(row => {
      this.zonas.map(zona => {
        const updateMatrizViatico = this.matrizViatico.find(mv => mv.grupoJerarquicoId === this.grupoJerarquicoId && mv.conceptoViaticoId === row.conceptoViaticoId && mv.listadoZonaId === zona.id);
        if (updateMatrizViatico !== undefined) {
          let montoUpdateMatrizViatico: number = this.moneyPipe.convertToNumber(updateMatrizViatico.monto.toString());
          let montoRow: number = this.moneyPipe.convertToNumber(row[zona.id]);
          if (montoUpdateMatrizViatico !== montoRow) {
            updateMatrizViatico.monto = montoRow;
            newMatrizViatico.push(updateMatrizViatico);
          }
        } else {
          let montoRow: number = this.moneyPipe.convertToNumber(row[zona.id]);
          if (montoRow > 0) {
            const _newMatrizViatico: MatrizViatico = new MatrizViatico();
            _newMatrizViatico.grupoJerarquicoId = this.grupoJerarquicoId;
            _newMatrizViatico.conceptoViaticoId = row.conceptoViaticoId
            _newMatrizViatico.listadoZonaId = zona.id;
            _newMatrizViatico.monto = montoRow;

            newMatrizViatico.push(_newMatrizViatico);
          }
        }
      })
    });

    if (this.isBloquearGrupos() && newMatrizViatico.length > 0) {
      let moneyLimit = environment.moneyLimit;
      let montoValido = true;
      newMatrizViatico.forEach(registro => {
        if (registro.monto > moneyLimit) {
          montoValido = false;
          return;
        }
      });
      if (!montoValido) {
        this._toastr.error('El Monto no puede ser mayor a $' + moneyLimit);
        return;
      }

      this._spinner.show();
      this._matrizViaticoService.saveViaticos(newMatrizViatico).then((response: any) => {
        if (response.status === 200) {

          //Ocultamos el spinner
          this._spinner.hide();
          //Mostramos error 
          this._toastr.success('Cambios guardados.');

          //Get Matriz Viaticos Refresh
          this.cancelar();
          this.matrizViatico = this._matrizViaticoService.matrizViatico;
          this.jsonTodataTable();
          return true;
        }
      }, error => {
        //Ocultamos el spinner
        this._spinner.hide();

        //Mostramos error 
        this._toastr.error(GenericService.getError(error).message);

        return false;
      });
    } else {
      this._toastr.info("No existen cambios pendientes por guardar");
      return false;
    }
  }

  eliminar(): boolean {
    throw new Error("Method not implemented.");
  }

  isBloquearGrupos(): boolean {
    return this.bloquearGrupos;
  }
}
