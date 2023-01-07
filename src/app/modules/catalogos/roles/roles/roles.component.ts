import { Component, OnInit, OnDestroy} from '@angular/core';
import { Subject } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { RolesComponentService } from './roles.service';
import { takeUntil } from 'rxjs/operators';
import { Rol } from '@models/rol';
import { FilterArray } from 'app/utils/filterArray';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GenericService } from '@services/generic.service';

@Component({
    selector: 'roles',
    templateUrl: './roles.component.html',
    styleUrls: ['./roles.component.scss']
  })
export class RolesComponent implements OnInit, OnDestroy{

    /**
     * Nombre de las Columnas a Mostrar en el listado
     */
    public columnas = [
        { prop: 'nombre', name: 'Nombre' },
        { prop: 'descripcion', name: 'Descripción' },
        { prop: 'estatus.valor', name: 'Estatus' },
      ];

    public listadoRoles : Rol[];
    public dataTable : any[];   

    //UnsubscribeAll
    private unsubscribeAll: Subject<any>;

    constructor( private spinner: NgxSpinnerService,
                 private router : Router,
                 private toastr: ToastrService,
                 private _rolesService: RolesComponentService,
                 
               ) 
    {
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

    cargaDatosIniciales(){

        this.spinner.show(); 

        this._rolesService.onRolesChanged.pipe(takeUntil(this.unsubscribeAll))
                                         .subscribe(response =>{
                                            this.listadoRoles = this._rolesService.roles;
                                            this.dataTable = this.listadoRoles;
                                            this.spinner.hide();
                                         }, error =>{
                                            this.toastr.error(GenericService.getError(error).message);
                                            this.spinner.hide();
                                        });
                                        
    }

    updateFilter(event) {

        //Obtener el valor a filtrar
        const val = event.target.value.toLowerCase();

        // Buscamos el valor en los registros
        this.dataTable = FilterArray.filterArrayByString(this.listadoRoles,val);

      }

      /**
       * Metodo para atrapar los eventos en la Tabla
       * @param event 
       */
      onActivate(event){
          //Si el evento fue Click
          if(event.type === "click"){
            this.router.navigate([this.router.url + '/editar/' + event.row.id]);
          }
      }

}