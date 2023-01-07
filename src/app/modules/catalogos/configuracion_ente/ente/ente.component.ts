import { Component, OnInit, AfterViewInit, ViewEncapsulation, OnDestroy, ViewChild, ElementRef, AfterContentInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NgxSpinnerService } from "ngx-spinner"
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';;
import { takeUntil } from 'rxjs/operators';
import { ConfiguracionEnte } from '@models/configuracion_ente';
import { ToastrService } from 'ngx-toastr';
import { GenericService } from '@services/generic.service';
import { ArchivoService } from '@services/archivo.service';
import { ConfiguracionEnteComponentService } from './ente.service';
import { Archivo } from '@models/archivo';
import { Pais } from '@models/pais';
import { Estado } from '@models/estado';
import { Ciudad } from '@models/ciudad';
import { Moneda } from '@models/moneda';
import { NgOption, NgSelectComponent } from '@ng-select/ng-select';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { CryptoService } from '@services/crypto.service';
import { GenericComponent } from 'app/modules/base/generic.component';
import { Listado_CMM } from '@models/listado_cmm';
import { environment } from 'environments/environment';
import { MoneyPipe } from 'app/pipes/money.pipe';

declare let jQuery: any;

@Component({
  selector: 'app-configuracion-ente',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './ente.component.html',
  styleUrls: ['./ente.component.scss']
})
export class EnteComponent extends GenericComponent implements OnInit, AfterViewInit, OnDestroy {
  
  @ViewChild('deshacerModal', null) deshacerModal;
  @ViewChild('cboPais', null) cboPais: NgSelectComponent;
  @ViewChild('cboEstado', null) cboEstado: NgSelectComponent;
  @ViewChild('cboCiudad', null) cboCiudad: NgSelectComponent;
  @ViewChild('cboProtocolo', null) cboProtocolo: NgSelectComponent;
  @ViewChild('cboProtocoloFTP', null) cboProtocoloFTP: NgSelectComponent;

  //PAGE
  pageType = true; // true es nuevo, false es editar

  //MODELS
  //Ente
  ente: ConfiguracionEnte;

  //FORMULARIOS
  enteForm: FormGroup;
  mySubscription: any;

  //UnsubscribeAll
  unsubscribeAll: Subject<any>;

  //Ruta temporal para la fotografía
  urlTmp: any;

  //Listados para combos
  paises: Pais[];
  estados: Estado[];
  ciudades: Ciudad[];
  monedas: Moneda[];
  protocolos: Listado_CMM[];
  protocolosFTP: Listado_CMM[];
  listadoPaises: NgOption[] = [];
  listadoEstados: NgOption[] = [];
  listadoCiudades: NgOption[] = [];
  listadoMonedas: NgOption[] = [];
  listadoProtocolos: NgOption[] = [];
  listadoProtocolosFTP: NgOption[] = [];
  paisValido = true;
  estadoValido = true;
  ciudadValida = true;
  monedaValida = true;
  normativaValida = true;
  protocoloValido = true;
  protocoloFTPValido = true;
  cambiosArchivo: boolean = false;

  maskMoney = {
    mask: createNumberMask({
      prefix: '',
      includeThousandsSeparator: true,
      allowDecimal: false,
    }),
  }

  maskPorcentaje = {
    mask: createNumberMask({
      prefix: '',
      includeThousandsSeparator: false,
      allowDecimal: false,
    }),
  }

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private configuracionEnteComponentService: ConfiguracionEnteComponentService,
    private router: Router,
    private _toastr: ToastrService,
    private el: ElementRef,
    private archivoService: ArchivoService,
    private sanitizer: DomSanitizer,
    private cryptoService: CryptoService,
    private moneyPipe: MoneyPipe
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
    //this.createEmpleadoForm();
    this.loadEnte();
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
    jQuery('.parsleyjsEnte').parsley();
  }

  loadEnte() {
    this.spinner.show();
    try {
      this.configuracionEnteComponentService.onEnteChanged.pipe(takeUntil(this.unsubscribeAll)).subscribe(response => {
        this.ente = this.configuracionEnteComponentService.configuracionEnte;

        if (this.ente.id && this.ente.archivoFotografia) {
          this.descargarArchivoTmp(this.ente.archivoFotografia);
        }

        this.paises = this.configuracionEnteComponentService.paises;
        this.estados = this.configuracionEnteComponentService.estados;
        this.ciudades = this.configuracionEnteComponentService.ciudades;
        this.monedas = this.configuracionEnteComponentService.monedas;
        this.protocolos = this.configuracionEnteComponentService.protocolos;
        this.protocolosFTP = this.configuracionEnteComponentService.protocolosFTP;

        //Cargamos los combos
        this.cargaCombos();

        //Creamos el Form del empleado
        this.createEnteForm(this.ente);
        this.spinner.hide();
      }, error => {
        this.spinner.hide();
        this._toastr.error(GenericService.getError(error).message);
      });
    } catch (exception) {
      this.spinner.hide();
      this._toastr.error("Error al cargar la información del ente");
    }
  }

  //Metodo para cargar la informacion necesaria en los combos
  cargaCombos() {
    //Carga inicial de paises
    let list: NgOption[] = [];
    list = [];
    this.paises.forEach(registro => {
      list.push({ id: registro.id, name: registro.nombre });
    });
    this.listadoPaises = [...list];

    //Si existe un pais seleccionado cargamos los estados de dicho país
    list = [];
    if (this.ente.paisId) {
      list = [];
      this.estados.forEach(registro => {
        if (registro.paisId == this.ente.paisId) {
          list.push({ id: registro.id, name: registro.nombre });
        }
      });
      this.listadoEstados = [...list];
    }

    //Si existe un estado cargado al ente, cargamos las ciudades de dicho estado
    list = [];
    if (this.ente.estadoId) {
      this.ciudades.forEach(registro => {
        if (registro.estadoId == this.ente.estadoId) {
          list.push({ id: registro.id, name: registro.nombre });
        }
      });
      this.listadoCiudades = [...list];
    }

    list = [];
    this.monedas.forEach(registro => {
      list.push({ id: registro.id, name: registro.nombre });
    });
    this.listadoMonedas = [...list];

    list = [];
    this.protocolos.forEach(registro => {
      list.push({ id: registro.id, name: registro.valor });
    });
    this.listadoProtocolos = [...list];

    list = [];
    this.protocolosFTP.forEach(registro => {
      list.push({ id: registro.id, name: registro.valor });
    });
    this.listadoProtocolosFTP = [...list];
  }

  cboPaisChange(event) {
    let id = event ? event.id : null;
    this.ente.paisId = id;
    this.ente.estadoId = null;
    this.ente.ciudadId = null;

    this.enteForm.controls.estadoId.setValue(null);
    this.enteForm.controls.ciudadId.setValue(null);

    let list: NgOption[] = [];
    this.estados.forEach(registro => {
      if (registro.paisId == id) {
        list.push({ id: registro.id, name: registro.nombre });
      }
    });
    this.listadoEstados = [...list];

    this.listadoCiudades = [];
    this.paisValido = event;
  }

  cboEstadoChange(event) {
    let id = event ? event.id : null;

    this.ente.estadoId = id;
    this.ente.ciudadId = null;

    this.enteForm.controls.ciudadId.setValue(null);

    let list: NgOption[] = [];
    this.ciudades.forEach(registro => {
      if (registro.estadoId == id) {
        list.push({ id: registro.id, name: registro.nombre });
      }
    });
    this.listadoCiudades = [...list];
    this.estadoValido = event;
  }

  cboCiudadChange(event) {
    this.ente.ciudadId = event ? event.id : null;
    this.ciudadValida = event;
  }

  cboMonedaChange(event) {
    this.ente.monedaPredeterminadaId = event ? event.id : null;
    this.monedaValida = event;
  }

  cboProtocoloChange(event) {
    this.ente.protocolo = event ? event.id : null;
    this.protocoloValido = event;
  }

  cboProtocoloFTPChange(event) {
    this.ente.protocoloFTP = event ? event.id : null;
    this.protocoloFTPValido = event;
  }

  directorioRemotoChange(directorioRemoto: boolean) {
    if (directorioRemoto) {
      this.enteForm.controls.directorioPublico.clearValidators();
      this.enteForm.controls.directorioPublico.disable();

      this.enteForm.controls.directorioFTP.setValidators(Validators.required);
      this.enteForm.controls.protocoloFTP.setValidators(Validators.required);
      this.enteForm.controls.servidorFTP.setValidators(Validators.required);
      this.enteForm.controls.usuarioFTP.setValidators(Validators.required);
      this.enteForm.controls.contraseniaFTP.setValidators(Validators.required);
      this.protocoloFTPValido = !this.enteForm.controls.protocoloFTP.touched || this.enteForm.controls.protocoloFTP.value;
    } else {
      this.enteForm.controls.directorioPublico.setValidators(Validators.required);
      this.enteForm.controls.directorioPublico.enable();

      this.enteForm.controls.directorioFTP.clearValidators();
      this.enteForm.controls.protocoloFTP.clearValidators();
      this.enteForm.controls.servidorFTP.clearValidators();
      this.enteForm.controls.usuarioFTP.clearValidators();
      this.enteForm.controls.contraseniaFTP.clearValidators();
      this.protocoloFTPValido = true;
    }

    this.enteForm.controls.directorioPublico.updateValueAndValidity();

    this.enteForm.controls.directorioFTP.updateValueAndValidity();
    this.enteForm.controls.protocoloFTP.updateValueAndValidity();
    this.enteForm.controls.servidorFTP.updateValueAndValidity();
    this.enteForm.controls.usuarioFTP.updateValueAndValidity();
    this.enteForm.controls.contraseniaFTP.updateValueAndValidity();    
  }

  createEnteForm(ente: ConfiguracionEnte) {
    ente = ente ? ente : new ConfiguracionEnte();

    this.enteForm = this.formBuilder.group({
      id: [ente.id],
      nombreEnte: [ente.nombreEnte == "" ? null : ente.nombreEnte],
      correoElectronico: [ente.correoElectronico],
      paginaWeb: [ente.paginaWeb],
      domicilio: [ente.domicilio],
      numero: [ente.numero],
      colonia: [ente.colonia],
      paisId: [ente.paisId, Validators.required],
      estadoId: [ente.estadoId, Validators.required],
      ciudadId: [ente.ciudadId, Validators.required],
      telefono: [ente.telefono],
      monedaPredeterminadaId: [ente.monedaPredeterminadaId, Validators.required],
      porcentajeSinComprobante: [ente.porcentajeSinComprobante ? ente.porcentajeSinComprobante : 0],
      montoAnualSinComprobante: [ente.montoAnualSinComprobante ? ente.montoAnualSinComprobante : 0],
      nombreArchivoTemporal: null,
      nombreUsuario: [ente.nombreUsuario],
      email: [ente.email, Validators.required],
      contrasenia: [ente.contrasenia ? this.cryptoService.decrypt(ente.contrasenia) : null, Validators.required],
      contraseniaConfirmar: [ente.contrasenia ? this.cryptoService.decrypt(ente.contrasenia) : null],
      host: [ente.host, Validators.required],
      puerto: [ente.puerto, Validators.required],
      protocolo: [ente.protocolo, Validators.required],
      normativaViaticos: [ente.normativaViaticos],
      areaResponsableTransparencia: [ente.areaResponsableTransparencia, Validators.required],
      directorioPublico: [ente.directorioPublico],
      urlPublica: [ente.urlPublica],
      directorioRemoto: [ente.directorioRemoto],
      directorioFTP: [ente.directorioFTP],
      protocoloFTP: [ente.protocoloFTP],
      servidorFTP: [ente.servidorFTP],
      puertoFTP: [ente.puertoFTP],
      usuarioFTP: [ente.usuarioFTP],
      contraseniaFTP: [ente.contraseniaFTP ? this.cryptoService.decrypt(ente.contraseniaFTP) : null],
      contraseniaConfirmarFTP: [ente.contraseniaFTP ? this.cryptoService.decrypt(ente.contraseniaFTP) : null]
    });

    this.directorioRemotoChange(ente.directorioRemoto);
  }  

  validaDeshacer(eventoRegresar: boolean) {
    this.deshacerModal.eventoRegresar = eventoRegresar;
    if (this.enteForm.dirty) {
      this.deshacerModal.show();
    } else {
      this.deshacer();
    }
  }

  deshacer() {
    if (this.deshacerModal.eventoRegresar) {
      this.router.navigate(['app/']);
    } else {

      //Inicializar banderas
      this.paisValido = true;
      this.estadoValido = true;
      this.ciudadValida = true;
      this.monedaValida = true;
      this.normativaValida = true;
      this.protocoloValido = true;
      this.protocoloFTPValido = true;
      this.cambiosArchivo = false;
      jQuery('.parsleyjsEnte').parsley().reset();

      //Recargar la ficha
      this.router.navigate([this.router.url]);
    }
  }

  validarForm(): boolean {

    let componentesInvalidos = [];

    if (this.enteForm.invalid) {
      for (var i in this.enteForm.controls)
        this.enteForm.controls[i].markAsTouched();
    }

    if (!this.enteForm.controls.paisId.valid) {
      this.paisValido = false;
      componentesInvalidos.push(this.cboPais);
    }

    if (!this.enteForm.controls.estadoId.valid) {
      this.estadoValido = false;
      componentesInvalidos.push(this.cboEstado);
    }

    if (!this.enteForm.controls.ciudadId.valid) {
      this.ciudadValida = false;
      componentesInvalidos.push(this.cboCiudad);
    }

    if (!this.enteForm.controls.protocolo.valid) {
      this.protocoloValido = false;
      componentesInvalidos.push(this.cboProtocolo);
    }

    if (this.enteForm.controls.directorioRemoto.value && !this.enteForm.controls.protocoloFTP.valid) {
      this.protocoloFTPValido = false;
      componentesInvalidos.push(this.cboProtocoloFTP);
    }

    if (!this.normativaValida) {
      return false;
    }

    if (this.enteForm.controls.contrasenia.value != this.enteForm.controls.contraseniaConfirmar.value
      || this.enteForm.controls.contraseniaFTP.value != this.enteForm.controls.contraseniaConfirmarFTP.value) {
        return false;
    }

    //Mandamos el foco al primer componente invalido
    if (componentesInvalidos.length > 0) {
      componentesInvalidos[0].focus();
    }

    //Regresamos el estatus del Form
    return this.enteForm.valid;
  }

  guardar(): boolean {
    //Validamos que se hayan llenado los datos requeridos
    if (!this.validarForm()) {
      return false;
    }

    let ente: ConfiguracionEnte = this.enteForm.getRawValue();

    //Obtener nombre del archivo temporal de fotografía
    ente.fotografia = this.ente.fotografia;
    ente.nombreArchivoTemporal = this.ente.nombreArchivoTemporal;
    ente.fotografiaEliminada = this.ente.fotografiaEliminada;
    ente.contrasenia = this.cryptoService.encrypt(ente.contrasenia);
    ente.contraseniaConfirmar = this.cryptoService.encrypt(ente.contraseniaConfirmar);
    ente.normativaViaticos = this.ente.normativaViaticos;
    ente.nombreNormativaViaticosArchivoTemp = this.ente.nombreNormativaViaticosArchivoTemp;

    if (this.enteForm.controls.directorioRemoto.value) {
      ente.contraseniaFTP = this.cryptoService.encrypt(ente.contraseniaFTP);
      ente.contraseniaConfirmarFTP = this.cryptoService.encrypt(ente.contraseniaConfirmarFTP);
    } 
    // else {
    //   ente.protocoloFTP = null;
    //   ente.servidorFTP = null;
    //   ente.puertoFTP = null;
    //   ente.usuarioFTP = null;
    //   ente.contraseniaFTP = null;
    //   ente.contraseniaConfirmarFTP = null;
    // }

    this.spinner.show();

    this.configuracionEnteComponentService.guarda(ente).then(response => {
      if (response.status == 200) {
        this._toastr.success(response.message);
        location.reload(true);
        return true;
      }
      this.spinner.hide();
      return false;
    }, error => {
      this.spinner.hide();
      this._toastr.error(GenericService.getError(error).message);
      return false;
    });
  }

  cancelar(): void {
    throw new Error("Method not implemented.");
  }

  eliminar(): boolean {
    throw new Error("Method not implemented.");
  }

  //Método para guardar fotografía del Ente
  onArchivoLogo(event) {
    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      this.cambiosArchivo = true;
      let file: File = fileList[0];
      let extension = file.name.substr(file.name.indexOf('.'));

      if (environment.extensionImagen.indexOf(extension) == -1) {
        jQuery("#eliminar").click();
        this.eliminarImagen();
        this._toastr.error('Debe seleccionar una imagen');
        return;
      }

      this.archivoService.subirArchivo(file).then(
      response => {
        this.ente.nombreArchivoTemporal = response.data;
        this.ente.fotografiaEliminada = false;
      }, error => {
        this._toastr.error(GenericService.getError(error).message);
      });
    }
  }

  //Método para guardar Archivo Normativa
  onArchivoNormativa(event) {
    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      this.cambiosArchivo = true;
      let file: File = fileList[0];
      this.archivoService.subirArchivo(file).then(
      response => {
        this.ente.nombreNormativaViaticosArchivoTemp = response.data;
      }, error => {
        this._toastr.error(GenericService.getError(error).message);
      });
      this.normativaValida = true;
    } else {
      this.normativaValida = false;
    }
  }

  descargarArchivoTmp(archivo: Archivo) {
    this.archivoService.descargarArchivo(archivo.id).then(
    response => {
      let extension = archivo.rutaFisica.substr(archivo.rutaFisica.indexOf('.'));
      this.urlTmp = this.archivoService.generarURLTmp(response, extension);
    }, error => {
      this._toastr.error(GenericService.getError(error).message);
    });
  }

  eliminarImagen() {
    this.cambiosArchivo = true;
    this.urlTmp = null;
    this.ente.nombreArchivoTemporal = null;
    this.ente.fotografiaEliminada = true;
  }

  porcentajeChange(event) {
    let porcentaje: number = this.moneyPipe.convertToNumber(event.target.value);

    if (porcentaje > 100) {
      this._toastr.error("El Porcentaje sin Comprobante no puede ser mayor a 100");
      porcentaje = 100;
    }

    // Set Value
    this.enteForm.controls.porcentajeSinComprobante.setValue(porcentaje);
  }

  montoChange(event) {
    let money: number = this.moneyPipe.convertToNumber(event.target.value);

    let moneyLimit = environment.moneyLimit;
    if (money > moneyLimit) {
      this._toastr.error('El Monto Anual sin Comprobante no puede ser mayor a $' + moneyLimit);
      money = moneyLimit;
    }

    // Set Value
    this.enteForm.controls.montoAnualSinComprobante.setValue(this.moneyPipe.convertToNumber(this.moneyPipe.transform(money, '', false)));
  }
}