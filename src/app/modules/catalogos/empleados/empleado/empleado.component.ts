import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner"
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';;
import { takeUntil } from 'rxjs/operators';
import { Empleado } from '@models/empleado';
import { Usuario } from '@models/usuario';
import { Organigrama } from '@models/organigrama';
import { ListadoPuesto } from '@models/listado_puesto';
import { ListadoCargo } from '@models/listado_cargo';
import { ListadoCMM } from '@models/mapeos/listadoCMM';
import { Rol } from '@models/rol';
import { ToastrService } from 'ngx-toastr';
import { GenericService } from '@services/generic.service';
import { ArchivoService } from '@services/archivo.service';
import { EmpleadoComponentService } from './empleado.service';
import { Listado_CMM } from '@models/listado_cmm';
import { Archivo } from '@models/archivo';
import { CatalogoCuenta } from '@models/catalogo_cuenta';
import { NgOption, NgSelectComponent } from '@ng-select/ng-select';
import { CryptoService } from '@services/crypto.service';
import { environment } from 'environments/environment';
import { GenericComponent } from 'app/modules/base/generic.component';

declare let jQuery: any;

@Component({
  selector: 'app-empleado',
  templateUrl: './empleado.component.html',
  styleUrls: ['./empleado.component.scss']
})
export class EmpleadoComponent extends GenericComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('cboAreaAdscripcion', null) cboAreaAdscripcion: NgSelectComponent;
  @ViewChild('cboPuesto', null) cboPuesto: NgSelectComponent;
  @ViewChild('cboCargo', null) cboCargo: NgSelectComponent;
  @ViewChild('cboTipoEmpleado', null) cboTipoEmpleado: NgSelectComponent;
  @ViewChild('cboRol', null) cboRol: NgSelectComponent;
  @ViewChild('cboCatalogoCuenta', null) cboCatalogoCuenta: NgSelectComponent;
  @ViewChild('deshacerModal', null) deshacerModal;

  treeOptions = {
    checkboxes: true
  };

  // URL
  private URL_EMPLEADOS: string = 'app/catalogos/empleados/';

  //PAGE
  pageType = true; // true es nuevo, false es editar

  //Modelos
  empleado: Empleado;
  usuario: Usuario;
  crearTerceros: boolean;
  visualizarTerceros: boolean;
  nodosOrgnigrama: any[];
  selectedItems = [];

  //Listados para combos
  areaAdscripcion: Organigrama[];
  listadoPuesto: ListadoPuesto[];
  listadoCargo: ListadoCargo[];
  tipoEmpleado: Listado_CMM[];
  roles: Rol[];
  catalogoCuenta: CatalogoCuenta[];

  listAreaAdscripcion: NgOption[] = [];
  listPuestos: NgOption[] = [];
  listCargos: NgOption[] = [];
  listTipoEmpleado: NgOption[] = [];
  listRoles: NgOption[] = [];
  listCatalogoCuenta: NgOption[] = [];

  //Variables de control
  cambios: boolean = false;
  areaAdscripcionValida = true;
  puestoValido = true;
  cargoValido = true;
  tipoEmpleadoValido = true;
  rolValido = true;
  catalogoCuentaValido = true;

  //FORMULARIOS
  empleadoForm: FormGroup;
  mySubscription: any;

  //UnsubscribeAll
  private unsubscribeAll: Subject<any>;

  //Ruta temporal para la fotografía
  private urlTmp: any;

  constructor (
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private empleadoService: EmpleadoComponentService,
    private router: Router,
    private toastr: ToastrService,
    private archivoService: ArchivoService,
    private cryptoService: CryptoService
  ) {
    super();

    this.unsubscribeAll = new Subject();

    // this.router.routeReuseStrategy.shouldReuseRoute = function () {
    //   return false;
    // };

    this.mySubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Trick the Router into believing it's last link wasn't previously loaded
        this.router.navigated = false;
      }
    });
  }

  ngOnInit() {
    //Mostramos el spinner
    this.spinner.show();

    this.empleadoService.onEmpleadoChanged.pipe(takeUntil(this.unsubscribeAll))
      .subscribe(response => {
        let jsonDatosFicha = this.empleadoService.jsonDatosFicha;

        if (jsonDatosFicha.usuario) {
          this.usuario = jsonDatosFicha.usuario;
          this.usuario.confirmContrasenia = this.usuario.contrasenia;
          this.empleado = this.usuario.empleado;
          this.crearTerceros = jsonDatosFicha.crearTerceros;
          this.visualizarTerceros = jsonDatosFicha.visualizarTerceros;
          this.nodosOrgnigrama = jsonDatosFicha.nodosOrganigrama;

          if (this.empleado.archivoFotografia) {
            this.descargarArchivoTmp(this.empleado.archivoFotografia);
          }

          this.pageType = false;
        } else {
          this.empleado = new Empleado();
          this.usuario = new Usuario();
        }

        //Cargamos los combos
        this.listadoPuesto = jsonDatosFicha.listadoPuesto;
        this.listadoCargo = jsonDatosFicha.listadoCargo;
        this.areaAdscripcion = jsonDatosFicha.area;
        this.tipoEmpleado = jsonDatosFicha.tipoEmpleado;
        this.roles = jsonDatosFicha.roles;
        this.catalogoCuenta = jsonDatosFicha.catalogoCuentas;
        if(this.catalogoCuenta == null){
          this.catalogoCuenta = [];
          this.catalogoCuenta.push({
            id:1,
            nombre: 'hola mundo'
          });
        }
        this.cargaCombos();

        this.nodosOrgnigrama = jsonDatosFicha.organigrama;

        this.selectedItems = [...this.nodosOrgnigrama.filter(nodo => nodo.tienePermiso)];

        //Creamos el Form del empleado
        this.createEmpleadoForm();
        
        //Deshabiliatar campos si es la cuenta de admin  
        if(Number(this.empleado.id==1)){
          this.camposUserAdmin()
        }

        this.spinner.hide();
      }, error => {
        this.spinner.hide();
        this.toastr.error(GenericService.getError(error).message);
      });
  
    this.spinner.hide();
  }
  
  camposUserAdmin(){    
    this.empleadoForm.disable(); 
    this.empleadoForm.controls.contrasenia.enable();
    this.empleadoForm.controls.contraseniaConfirmar.enable();
    this.empleadoForm.controls.visualizarSolicitudesTerceros.enable();
  }

  ngOnDestroy() {
    // Unsubscribe from all subscriptions
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
    if (this.mySubscription) {
      this.mySubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    jQuery('.parsleyjsEmpleado').parsley();
  }

  createEmpleadoForm() {
    this.empleadoForm = this.formBuilder.group({
      empleadoId: [this.empleado.id],
      numeroEmpleado: [this.empleado.numeroEmpleado],
      nombre: [this.empleado.nombre],
      primerApellido: [this.empleado.primerApellido],
      segundoApellido: [this.empleado.segundoApellido],
      tipoEmpleadoId: [this.empleado.tipoEmpleadoId, Validators.required],
      areaAdscripcionId: [this.empleado.areaAdscripcionId, Validators.required],
      puestoId: [this.empleado.puestoId, Validators.required],
      cargoId: [this.empleado.cargoId, Validators.required],
      emailInstitucional: [this.empleado.emailInstitucional],
      emailPersonal: [this.empleado.emailPersonal],
      fotografia: [this.empleado.fotografia],
      estatusEmpelado: [this.empleado.estatusId == ListadoCMM.EstatusRegistro.ACTIVO],
      rfc: [this.empleado.rfc],
      catalogoCuentaId: [this.empleado.catalogoCuentaId, Validators.required],
      cuenta: [this.empleado.cuenta],
      nombreCuenta: [this.empleado.nombreCuenta],
      usuarioId: [this.usuario.id],
      usuario: [this.usuario.usuario],
      contrasenia: this.usuario.contrasenia != null ? [this.cryptoService.decrypt(this.usuario.contrasenia)] : null,
      contraseniaConfirmar: this.usuario.confirmContrasenia != null ? [this.cryptoService.decrypt(this.usuario.confirmContrasenia)] : null,
      rolId: [this.usuario.rolId, Validators.required],
      estatusUsuario: [this.usuario.estatusId == ListadoCMM.EstatusRegistro.ACTIVO],
      nombreArchivoTemporal: null,
      fotografiaEliminada: false,
      crearSolicitudesTerceros: [this.crearTerceros],
      visualizarSolicitudesTerceros: [this.visualizarTerceros],
      timestamp: [this.empleado.timestamp]
    });
  }

  //Metodo para cargar la informacion necesaria en los combos
  cargaCombos() {
    //Area Adscripcion
    this.areaAdscripcion.map(adscripcion => {
      this.listAreaAdscripcion.push({ id: adscripcion.id, name: adscripcion.descripcion });
    });

    //Listado Puesto
    this.listadoPuesto.map(puesto => {
      this.listPuestos.push({ id: puesto.id, name: puesto.nombre });
    });

    //Listado Cargo
    this.listadoCargo.map(cargo => {
      this.listCargos.push({ id: cargo.id, name: cargo.nombre });
    });

    //Tipo Empleado
    this.tipoEmpleado.map(empleado => {
      this.listTipoEmpleado.push({ id: empleado.id, name: empleado.valor });
    });

    //Rol
    this.roles.map(rol => {
      this.listRoles.push({ id: rol.id, name: rol.nombre });
    });

    //Cuentas Contables
    this.catalogoCuenta.map(cuenta => {
      this.listCatalogoCuenta.push({ id: cuenta.id, name: cuenta.cuenta + ' - ' + cuenta.nombre });
    });
  }

  onAreaAdscripcionSelected(event) {
    this.areaAdscripcionValida = event;
  }

  onPuestoSelected(event) {
    this.puestoValido = event;
  }

  onCargoSelected(event) {
    this.cargoValido = event;
  }

  onTipoEmpleadoSelected(event) {
    this.tipoEmpleadoValido = event;
  }

  onRolSelected(event) {
    this.rolValido = event;
  }

  onCuentaCatalogoSelected(event) {
    this.catalogoCuentaValido = event;
    this.catalogoCuenta.map(cuenta => {
      if (event && cuenta.id == event.id) {
        this.empleadoForm.controls.cuenta.setValue(cuenta.cuenta);
        this.empleadoForm.controls.cuentaNombre.setValue(cuenta.nombre);
      }
    });
  }

  //Vertify Checkbox
  vertifyCheckbox(event) {
    if (this.pageType) {
      event.target.checked = true;
    }
  }

  organigramaSelect({ selected }): void {
    this.selectedItems.splice(0, this.selectedItems.length);
    this.selectedItems.push(...selected);
  }

  validaCambioPermisos() {
    let cambios: boolean = false;
    
    if (this.selectedItems.length != this.nodosOrgnigrama.filter(nodo => nodo.tienePermiso).length) {
      return true;
    }

    this.selectedItems.forEach(selected => {
      cambios = this.nodosOrgnigrama.filter(nodo => nodo.id == selected.id && selected.tienePermiso).length == 0 ? true : cambios;
    });

    return cambios;
  }

  validaDeshacer(eventoRegresar: boolean) {
    this.deshacerModal.eventoRegresar = eventoRegresar;
    
    if (this.empleadoForm.dirty || this.cambios || this.validaCambioPermisos()) {
      this.deshacerModal.show();
    } else {
      this.cancelar();
    }
  }

  cancelar(): void {

    //Inicializar Banderas
    this.cambios = false;
    this.areaAdscripcionValida = true;
    this.puestoValido = true;
    this.cargoValido = true;
    this.tipoEmpleadoValido = true;
    this.rolValido = true;
    this.catalogoCuentaValido = true;
    jQuery('.parsleyjsEmpleado').parsley().reset();  

    //Navegar hacia el listado o hacia la misma url para recargar la ficha
    this.router.navigate([this.deshacerModal.eventoRegresar ? this.URL_EMPLEADOS : this.router.url]);
  }

  validarForm(): boolean {

    let componentesInvalidos = [];

    if (this.empleadoForm.invalid) {
      for (var i in this.empleadoForm.controls)
        this.empleadoForm.controls[i].markAsTouched();
    }

    if (!this.empleadoForm.controls.areaAdscripcionId.valid) {
      this.areaAdscripcionValida = false;
      componentesInvalidos.push(this.cboAreaAdscripcion);
    }

    if (!this.empleadoForm.controls.puestoId.valid) {
      this.puestoValido = false;
      componentesInvalidos.push(this.cboPuesto);
    }
    
    if (!this.empleadoForm.controls.cargoId.valid) {
      this.cargoValido = false;
      componentesInvalidos.push(this.cboCargo);
    }
    
    if (!this.empleadoForm.controls.tipoEmpleadoId.valid) {
      this.tipoEmpleadoValido = false;
      componentesInvalidos.push(this.cboTipoEmpleado);
    }
    
    if (!this.empleadoForm.controls.rolId.valid) {
      this.rolValido = false;
      componentesInvalidos.push(this.cboRol);
    }
    
    if (!this.empleadoForm.controls.catalogoCuentaId.valid) {
      this.catalogoCuentaValido = false;
      componentesInvalidos.push(this.cboCatalogoCuenta);
    }

    if (this.empleadoForm.controls.visualizarSolicitudesTerceros.value && this.selectedItems.length == 0) {
      this.toastr.error('Debe seleccionar un nivel del Organigrama');
      return false;
    }

    if (this.empleadoForm.controls.contrasenia.value != this.empleadoForm.controls.contraseniaConfirmar.value) {
      return false;
    }

    //Mandamos el foco al primer componente invalido
    if (componentesInvalidos.length > 0) {
      componentesInvalidos[0].focus();
    }

    //Regresamos el estatus del Form
    return this.empleadoForm.valid;
  }

  guardar(): boolean {

    if (!this.validarForm()) {
      return false;
    }

    let data = this.empleadoForm.getRawValue();
    
    let empleado: Empleado = new Empleado(data);
    empleado.estatusId = data.estatusEmpelado ? ListadoCMM.EstatusRegistro.ACTIVO : ListadoCMM.EstatusRegistro.INACTIVO;

    let listadoOrganigrama = [];    
    this.selectedItems.forEach(selected => {
      listadoOrganigrama.push(selected.id);
    });
    empleado.listadoOrganigrama = listadoOrganigrama;
    
    let usuario: Usuario = new Usuario(data);
    usuario.contrasenia = this.cryptoService.encrypt(usuario.contrasenia);
    usuario.estatusId = data.estatusUsuario ? ListadoCMM.EstatusRegistro.ACTIVO : ListadoCMM.EstatusRegistro.INACTIVO;
    usuario.empleado = empleado;

    this.spinner.show();

    this.empleadoService.guarda(usuario).then(
      response => {
        if (response.status == 200) {
          this.toastr.success(response.message);
          this.router.navigate([this.URL_EMPLEADOS]);
        }
        this.spinner.hide();
      }, error => {
        this.spinner.hide();
        this.toastr.error(GenericService.getError(error).message);
      }
    );

    return true;
  }

  eliminar(): boolean {
    this.spinner.show();

    this.empleadoService.remove(this.empleadoForm.controls.empleadoId.value).then(
      response => {
        if (response.status == 200) {
          this.toastr.success(response.message);
          this.router.navigate([this.URL_EMPLEADOS]);
        }
        this.spinner.hide();
      }, error => {
        this.spinner.hide();
        this.toastr.error(GenericService.getError(error).message);
      }
    );
    
    return true;
  }

  //Método para guardar fotografía del empleado
  onArchivo(event) {
    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      this.cambios = true;
      let file: File = fileList[0];
      let extension = file.name.substr(file.name.indexOf('.'));

      if (environment.extensionImagen.indexOf(extension) == -1) {
        jQuery("#eliminar").click();
        this.eliminarImagen();
        this.toastr.error('Debe seleccionar una imagen');
        return;
      }

      this.archivoService.subirArchivo(file).then(
        response => {
          this.empleadoForm.controls.nombreArchivoTemporal.setValue(response.data);
          this.empleadoForm.controls.fotografiaEliminada.setValue(false);
        }, error => {
          this.toastr.error(GenericService.getError(error).message);
        });
    }
  }

  descargarArchivoTmp(archivo: Archivo) {
    this.archivoService.descargarArchivo(archivo.id).then((response: any) => {
      let extension = archivo.rutaFisica.substr(archivo.rutaFisica.indexOf('.'));
      this.urlTmp = this.archivoService.generarURLTmp(response, extension);
    }, error => {
      this.toastr.error(GenericService.getError(error).message);
    });
  }

  eliminarImagen() {
    this.cambios = true;
    this.urlTmp = null;
    this.empleadoForm.controls.nombreArchivoTemporal.setValue(null);
    this.empleadoForm.controls.fotografiaEliminada.setValue(true);
  }
}