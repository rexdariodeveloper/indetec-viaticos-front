import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { Empleado } from '@models/empleado';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { FilterArray } from 'app/utils/filterArray';

import { ArchivoService } from '@services/archivo.service';
import { EmpleadosComponentService } from './empleados.service';

import { Archivo } from '@models/archivo';

@Component({
  selector: 'app-empleados',
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.scss']
})
export class EmpleadosComponent implements OnInit, OnDestroy {

  //Table columns
  // private columns = [
  //   {prop: 'id', name: '#'},
  //   {prop: 'fotografia', name: 'Foto'},
  //   {prop: 'nombre', name: 'Nombre'}
  // ];
  empleadosDataTable: Empleado[];
  empleados: Empleado[];
  
  //UnsubscribeAll
  private unsubscribeAll: Subject<any>;

  //Arreglo para los archivos de fotografias
  fotografias: {[key:number]: string} = {};

  constructor(
    private spinner: NgxSpinnerService,
    private empleadosService: EmpleadosComponentService,
    private _router : Router,
    private archivoService: ArchivoService
    ) {
      this.unsubscribeAll = new Subject();

    }

  ngOnInit() {
    this.spinner.show();
    this.getEmpleados();
  }
  ngOnDestroy() {
    // Unsubscribe from all subscriptions
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }

  //Search Empleado
  searchEmpleado(event){
    //Obtener el valor a filtrar
    const val = event.target.value.toLowerCase();
    // Buscamos el valor en los registros
    this.empleadosDataTable = FilterArray.filterArrayByString(this.empleados,val);
  }
  
  //Sacan todos empleados (listado)
  getEmpleados(){
    this.empleadosService.onEmpleadosChanged.pipe(takeUntil(this.unsubscribeAll)).subscribe(response =>{
      if(response.status == 200)
      {
        this.empleados = this.empleadosService.empleados;
        this.empleadosDataTable = this.empleados;
        this.empleados.forEach((empleado) =>{
          if(empleado.archivoFotografia){
            this.descargarArchivoTmp(empleado.archivoFotografia,empleado.id);
          }
        });
        //this.tableDataToArray();

        this.spinner.hide();
      }
    }, error =>{
      console.log(error);
    });
  }
  
  /**
   * Metodo para atrapar los eventos en la Tabla
   * @param event 
   */
  onActivate(event){
    //Si el evento fue Click
    if(event.type === "click"){
      this._router.navigate([this._router.url + '/editar-empleado/' + event.row.id]);
    }
  }

  descargarArchivoTmp(archivo: Archivo,empleadoId: number){
    this.archivoService.descargarArchivo(archivo.id).then((response: any) => {
      let extension = archivo.rutaFisica.substr(archivo.rutaFisica.indexOf('.'));
      this.fotografias[empleadoId] = this.archivoService.generarURLTmp(response, extension);
    }, (reject) => {
      // cachar el error de forma normal
    });
  }
}