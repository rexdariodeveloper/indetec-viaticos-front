import { Component, OnInit, ViewEncapsulation, AfterViewInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ListadosComponentService } from './listados.service';
import { takeUntil } from 'rxjs/operators';
import { ListadoEsquema } from '@models/listado_esquema';
import { ListadoEsquemaFormato } from '@models/listado_esquema_formato';
import { FilterArray } from 'app/utils/filterArray';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { GenericService } from '@services/generic.service';
import { GenericComponent } from 'app/modules/base/generic.component';
import { ListadoCMM } from '@models/mapeos/listadoCMM';
declare let jQuery: any;

@Component({
  selector: 'app-listados',
  templateUrl: './listados.component.html',
  styleUrls: ['./listados.component.scss']
})
export class ListadosComponent extends GenericComponent implements OnInit, OnDestroy {

  //Listado Esquema And Listado Esquema Formato
  listadoEsquema: ListadoEsquema[] = [];
  listadoEsquemaFormato: ListadoEsquemaFormato[];
  listadoEsquemaSelected: ListadoEsquema = new ListadoEsquema();
  bloquearListados: boolean = false;

  //Data and Data Table
  listadoData: any[] = [];
  listadoDataOriginal: any[] = [];
  listadoDataDataTable: any[] = [];
  listadoDataSelected: any[] = [];
  tableOffset = 0;

  //UnsubscribeAll
  private unsubscribeAll: Subject<any>;

  constructor(
    private _listadosService: ListadosComponentService,
    private _spinner: NgxSpinnerService,
    private _toastr: ToastrService,
  ) {
    super();

    this.unsubscribeAll = new Subject();
  }

  ngOnInit() {
    this.loadListados();
  }

  ngOnDestroy() {
    // Unsubscribe from all subscriptions
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }

  loadListados(): void {
    this._spinner.show();
    this._listadosService.onListadosChanged.pipe(takeUntil(this.unsubscribeAll)).subscribe(response => {
      if (response.status == 200) {
        this.listadoEsquema = this._listadosService.esquemas;
        this._spinner.hide();
      }
    }, error => {
      this._toastr.error(GenericService.getError(error).message);
      this._spinner.hide();
    });
  }

  //Search Listado
  searchListado(event) {
    //Obtener el valor a filtrar
    const val = event.target.value.toLowerCase();
    // Buscamos el valor en los registros
    this.listadoDataDataTable = FilterArray.filterArrayByString(this.listadoData.filter(data => data.Activo == true), val);
  }

  onPageChange(event) {
    this.tableOffset = event.offset;   
  }

  //Update Data Table
  updateDataTable(): void {
    this.listadoDataDataTable = [...this.listadoData.filter(data => data.Activo == true)];
    this.bloquearListados = true;
  }

  //Tabs selected listado
  isSelectedListado(esquema): void {
    this._spinner.show();

    //Clean all
    this.cancelar();

    this._listadosService.getDatosFicha(esquema.id).then((response: any) => {
      if (response.status == 200) {
        
        //Get Listado Esquema Formato
        if (this._listadosService.esquemasFormato.length > 0) {
          this.listadoEsquemaSelected = esquema;
          this.listadoEsquemaFormato = this._listadosService.esquemasFormato.filter(formato => formato.nombreCampoTabla != "Simbolo");
          this.listadoData = this._listadosService.listadoData;
          this.listadoData.map(data => {
            this.listadoDataOriginal.push(Object.assign({}, data));
          });
          this.listadoDataDataTable = this.listadoData;
        } else {
          this.listadoEsquemaSelected = new ListadoEsquema();
          jQuery('.' + esquema.nombreTabla).removeClass('active');
          this._toastr.warning('No hay campos.');
        }

        //Ocultamos el spinner
        this._spinner.hide();
      }
    }, error => {
      //Ocultamos el spinner
      this._spinner.hide();

      //Mostramos error 
      this._toastr.error(GenericService.getError(error).message);
    });
  }

  agregar(): void {
    this.tableOffset = 0;
    //Si no hay nuevas celdas se crea una
    if (this.validarForm()) {
      let newData: any = {
        Activo: true,
      };
      this.listadoEsquemaFormato.map(column => {
        newData = { ...newData, ...{ [column.nombreCampoTabla]: '' } };
      });
      this.listadoData.push(newData);
      //Ordenamos el arreglo para que la celda nueva quede en primera pocisión.
      this.listadoData.splice(0, 0, this.listadoData.splice(this.listadoData.length - 1, 1)[0]);
      this.updateDataTable();
    }
  }

  //Select Data
  selectListado({ selected }) {
    this.listadoDataSelected.splice(0, this.listadoDataSelected.length);
    this.listadoDataSelected.push(...selected);
  }

  updateListado(event, cell, rowIndex): void {
    let index = this.listadoData.indexOf(this.listadoDataDataTable[rowIndex]);

    this.listadoData[index][cell] = event.target.value;
    this.updateDataTable();
  }

  validarForm(): boolean {
    let camposCompletos: boolean = true;
    let nombreCampo: string = '';
    let valorCampo: string = '';

    //Revisamos campos vacíos
    this.listadoData.forEach(data => {
      this.listadoEsquemaFormato.forEach(esquema => {
        if (esquema.visible && data[esquema.etiqueta] == "" && data.Activo == true) {
          camposCompletos = false;
          return;
        }
      });
    });

    if (!camposCompletos) {
      this._toastr.error('Termine de editar las filas.');
      return false;
    }

    //Revisamos duplicados
    this.listadoData.forEach((registro, i) => {
      this.listadoData.forEach((data, j) => {
        if (i != j) {
          this.listadoEsquemaFormato.forEach(esquema => {
            if (esquema.visible && registro[esquema.nombreCampoTabla].toUpperCase() == data[esquema.nombreCampoTabla].toUpperCase() && (registro.Activo == true && data.Activo == true)) {
              nombreCampo = esquema.nombreCampoTabla;
              valorCampo = registro[esquema.nombreCampoTabla];
              return;
            }
          });
        }
      });
    });

    if (nombreCampo != '') {
      this._toastr.error(nombreCampo + ': ' + valorCampo + ' repetido.');
      return false;
    }

    return true;
  }

  guardar(): boolean {
    if (!this.validarForm()) {
      return false;
    }

    const sendData: any[] = [];
    this.listadoData.map(data => {
      if (data.Activo == true) {
        if (data[this.listadoEsquemaFormato[0].nombreCampoTabla] != '') {
          if (this.listadoDataOriginal.filter(_data => _data[this.listadoEsquemaFormato[1].nombreCampoTabla] == data[this.listadoEsquemaFormato[1].nombreCampoTabla] && _data[this.listadoEsquemaFormato[2].nombreCampoTabla] == data[this.listadoEsquemaFormato[2].nombreCampoTabla]).length == 0) {
            sendData.push(data);
          }
        } else {
          sendData.push(data);
        }

      } else {
        if (data[this.listadoEsquemaFormato[0].nombreCampoTabla] != '') {
          sendData.push(data);
        }
      }
    });

    if (sendData.length > 0) {
      this._spinner.show();
      let data: any = {
        'listadoEsquema': this.listadoEsquemaSelected,
        'listadoEsquemaFormato': this.listadoEsquemaFormato,
        'listadoData': sendData,
      };

      this._listadosService.saveListadoData(data).then((response: any) => {
        if (response.status === 200) {
          //Ocultamos el spinner
          this._spinner.hide();
          //Mostramos error 
          this._toastr.success('Cambios guardados con éxito!');

          //Listado Refresh
          //this.cancelar();
          this.isSelectedListado(this.listadoEsquemaSelected);          
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

  cancelar(): void {
    //Data and Data Table
    this.listadoData = [];
    this.listadoDataOriginal = [];
    this.listadoDataDataTable = [];
    this.listadoDataSelected = [];

    //Listado Esquema Formato
    this.listadoEsquemaFormato = [];
    
    this.listadoEsquemaSelected = new ListadoEsquema();
    this.bloquearListados = false;
  }

  eliminar(): boolean {
    this.listadoDataSelected.map(selected => {
      let index = this.listadoData.indexOf(selected);
      this.listadoData[index].Activo = false;
    });
    this.listadoDataSelected = [];
    this.updateDataTable();
    return true;
  }

  isBloquearListados(): boolean {
    return this.bloquearListados;
  }
}
