import { GenericComponent } from 'app/modules/base/generic.component';
import { Component, OnInit, OnDestroy, AfterViewInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Rol } from '@models/rol';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { RolComponentService } from './rol.service';
import { takeUntil } from 'rxjs/operators';
import { ListadoCMM } from '@models/mapeos/listadoCMM';
import { GenericService } from '@services/generic.service';
import { MenuPrincipal } from '@models/menu_principal';
declare let jQuery: any;

@Component({
    selector: 'rol',
    templateUrl: './rol.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./rol.component.scss']
})
export class RolComponent extends GenericComponent implements AfterViewInit, OnInit, OnDestroy {

    @ViewChild('deshacerModal', null) deshacerModal;
    
    treeOptions = {
        checkboxes: true
    };

    // URL
    private URL_ROLES: string = 'app/catalogos/roles/';

    // Variables 
    public nodes: any[];
    private selectedItems = [];
    private rol: Rol;
    private rolTemp: Rol;
    public pageType: string;
    private unsubscribeAll: Subject<any>;

    //Forms
    datosRolForm: FormGroup;
    mySubscription: any;

    constructor(private spinner: NgxSpinnerService,
        private service: RolComponentService,
        private toastr: ToastrService,
        private formBuilder: FormBuilder,
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
        //Mostramos el spinner
        this.spinner.show();

        // Subscribe to update rol on changes
        this.service.onRolChanged.pipe(takeUntil(this.unsubscribeAll))
            .subscribe(response => {
                let jsonDatosFicha = this.service.jsonDatosFicha;
                if (jsonDatosFicha) {

                    let rolMenus = [];

                    //Si se recibe rol obtener los menús del rol
                    if (jsonDatosFicha.rolMenus) {
                        jsonDatosFicha.rolMenus.forEach(rolMenu => {
                            rolMenus.push(rolMenu.nodoMenuId);
                        });
                    }
                    
                    //Cargamos la informacion de la ficha
                    this.construyeArbolPermisos(jsonDatosFicha.menuprincipal, rolMenus);

                    //Si se recibe objeto Rol, quiere decir que vamos a editarlo
                    if (jsonDatosFicha.rol) {
                        //Asignamos el objeto Rol a editar
                        this.rol = jsonDatosFicha.rol;
                        this.pageType = 'edit';
                    }
                    //De lo contrario, es un registro nuevo
                    else {
                        this.rol = new Rol();
                        this.rol.estatusId = ListadoCMM.EstatusRegistro.ACTIVO;
                        this.pageType = 'new';
                    }

                    this.rolTemp = this.rol;
                    this.rolTemp.menus = rolMenus;
                }
                this.datosRolForm = this.createDatosRolForm();
            }, error => {
                this.toastr.error(GenericService.getError(error).message);
            });

        //Ocultamos  el spinner  
        this.spinner.hide();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this.unsubscribeAll.next();
        this.unsubscribeAll.complete();
    }

    ngAfterViewInit(): void {
        jQuery('.parsleyjsRoles').parsley();
    }

    createDatosRolForm(): FormGroup {
        return this.formBuilder.group(
            {
                id: [this.rol.id],
                nombre: [this.rol.nombre],
                descripcion: [this.rol.descripcion],
                estatusId: [this.rol.estatusId],
                activo: [this.rol.estatusId == ListadoCMM.EstatusRegistro.ACTIVO],
                timestamp: [this.rol.timestamp]
            }
        );
    }

    construyeArbolPermisos(nodosMenu: MenuPrincipal[], rolMenus: number[]) {

        this.nodes = [];

        //Construimos el Arbol por cada nodo en el Arreglo nodosMenu
        nodosMenu.forEach(nodo => {

            let nodoPermiso: NodoMenu = new NodoMenu();
            nodoPermiso.id = nodo.id;
            nodoPermiso.name = nodo.etiqueta;
            nodoPermiso.padreId = nodo.nodoPadreId;
            nodoPermiso.item = nodo.id;            
            nodoPermiso.selected = rolMenus.filter(n => n == nodo.id ).length > 0;

            //Si el nodo tiene como id padre null, es un nodo root
            if (nodo.nodoPadreId == null) {
                nodoPermiso.expanded = true;
                this.nodes.push(nodoPermiso);
            }
            //De lo contrario es un nodo hijo y lo agregamos en la posicion correcta
            else {
                for (let nodoPadre of this.nodes) {
                    if (this.agregaNodo(nodoPermiso, nodoPadre))
                        break;
                }
            }
        });
    }

    agregaNodo(nodo: NodoMenu, nodoPadre?: NodoMenu): boolean {
        //Si el Id del nodo es el mismo al del padre, lo agregamos como hijo
        if (nodo.padreId == nodoPadre.id) {
            nodoPadre.children.push(nodo);
            return true;
        }
        //De lo contrario buscamos el padre para insertar el nodo en la posicion correcta
        else {
            for (let nodoP of nodoPadre.children) {
                if (this.agregaNodo(nodo, nodoP)) {
                    return true;
                }
            }
        }
    }
  
    selecedItemsChanged(items: any[]) {
      this.selectedItems = items;
    }

    validarForm(): boolean {
        return this.datosRolForm.valid;
    }

    guardar(): boolean {
        //Validamos que se hayan llenado los datos requeridos
        if (!this.validarForm())
            return false;

        //Recuperamos los valores a guardar    
        let rol: Rol = this.datosRolForm.getRawValue();
        rol.estatusId = this.datosRolForm.controls.activo.value ? ListadoCMM.EstatusRegistro.ACTIVO : ListadoCMM.EstatusRegistro.INACTIVO;
        rol.menus = this.selectedItems;

        let cambios: boolean = rol.nombre != this.rolTemp.nombre
            || rol.descripcion != this.rolTemp.descripcion
            || rol.estatusId != this.rolTemp.estatusId
            || rol.menus.length != this.rolTemp.menus.length;        

        cambios = !cambios ? this.validaCambioPermisos() : cambios;

        if (cambios) {
            //Mostramos el spinner
            this.spinner.show();

            //Guardamos la informacion en BD 
            this.service.guarda(rol)
                .then(response => {
                    //Ocultamos el spinner
                    this.spinner.hide();

                    //Si nos regreso estatus 200, mostramos mensaje de exito y regresamos al listado
                    if (response.status == 200) {
                        this.toastr.success(response.message);
                        this.router.navigate([this.URL_ROLES]);
                    }
                }, error => {
                    //Ocultamos el spinner
                    this.spinner.hide();

                    //Mostramos error 
                    this.toastr.error(GenericService.getError(error).message);
                }
            );
        } else {
            this.toastr.success('Registro guardado.');
            this.router.navigate([this.URL_ROLES]);
        }
        return true;
    }

    validaCambioPermisos() {
        let cambios: boolean = false;

        let rol: Rol = this.datosRolForm.getRawValue();        
        rol.menus = this.selectedItems;

        if (rol.menus.length != this.rolTemp.menus.length) {
            return true;
        }

        rol.menus.forEach(menuId => {
            cambios = this.rolTemp.menus.filter(menuTempId => menuTempId == menuId).length == 0 ? true : cambios;
        });

        return cambios;
    }

    validaDeshacer(eventoRegresar: boolean) {
        this.deshacerModal.eventoRegresar = eventoRegresar;
        if (this.datosRolForm.dirty || this.validaCambioPermisos()) {
            this.deshacerModal.show();
        } else {
            this.cancelar();
        }
    }

    cancelar(): void {
        jQuery('.parsleyjsRoles').parsley().reset();
        this.router.navigate([this.deshacerModal.eventoRegresar ? this.URL_ROLES : this.router.url]);
    }

    eliminar(): boolean {

        this.spinner.show();

        this.service.elimina(this.rol.id).then(
            response => {
                this.toastr.success(response.message);
                this.router.navigate([this.URL_ROLES]);
                this.spinner.hide();
            },
            error => {
                this.toastr.error(GenericService.getError(error).message);
                this.spinner.hide();
            }
        )
        return true;
    }

    disableCheck(event) {
        if(this.pageType == 'new') {
            event.target.checked = this.pageType == 'new';
        }
    }
}

class NodoMenu {
    id: number;
    padreId?: number;
    name: string;
    children: NodoMenu[];
    item: any;
    expanded: boolean;
    selected: boolean;
    
    constructor() {
        this.children = [];
    }
}