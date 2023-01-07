import { Component, OnInit, OnDestroy, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Toast, ToastrService } from 'ngx-toastr';
import { InformeComprobacionComponentService } from './informe_comprobacion.service';
import { Router } from '@angular/router';
import { takeUntil, share } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { GenericService } from '@services/generic.service';
import { SolicitudViatico } from '@models/solicitud_viatico';
import { SolicitudViaticoInforme } from '@models/solicitud_viatico_informe';
import { SolicitudResumenComponent } from '../../solicitudes/solicitud_resumen/solicitud_resumen.component';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { AsignacionViatico } from '@models/asignacionViatico';
import { SolicitudViaticoComprobacion } from '@models/solicitud_viatico_comprobacion';
import { SolicitudViaticoComprobacionPasaje } from '@models/solicitud_viatico_comprobacion_pasaje';
import { SolicitudViaticoComprobacionCargo } from '@models/solicitud_viatico_comprobacion_cargo';
import { Listado_CMM } from '@models/listado_cmm';
import { NgOption } from '@ng-select/ng-select';
import { ListadoCMM } from '@models/mapeos/listadoCMM';
import { ConceptoViatico } from '@models/concepto_viatico';
import xml2js from 'xml2js';
import { Moneda } from '@models/moneda';
import { DateTimeAdapter } from 'ng-pick-datetime';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import * as moment from 'moment';
import { AsignacionPasaje } from '@models/asignacionPasaje';
import { SolicitudViaticoComprobacionDetalle, SolicitudViaticoComprobacionDetalleRMBorrado } from '@models/solicitud_viatico_comprobacion_detalle';
import { MatrizViatico, MatrizViaticoRecomendacionConceptoViatico } from '@models/matriz_viatico';
import { environment } from 'environments/environment';
import { ArchivoService } from '@services/archivo.service';
import { ArchivoTipoComporbante, Archivo } from '@models/archivo';
import { SolicitudViaticoComprobacionDetalleValidacion } from '@models/solicitud_viatico_comprobacion_detalle_validacion';
import { ConfiguracionEnte } from '@models/configuracion_ente';
import { MoneyPipe } from 'app/pipes/money.pipe';
import { SolicitudViaticoComprobacionDetalleImpuesto } from '@models/solicitud_viatico_comprobacion_detalle_impuesto';
import { Proveedor, NewProveedor } from '@models/saacg/proveedor';
import { CuentaGasto } from '@models/saacg/CuentaGasto';
import { isNgContainer } from '@angular/compiler';
import { PaisSAACG } from '@models/saacg/pais_saacg';
import * as PolizaComprobacion from '@models/saacg/poliza_comprobacion';
import { CfdiConcepto, CfdiRetencion, CfdiTraslado, Impuesto, ImpuestosLocale, Traslado, TrasladosLocale, RetencionesLocale, FacturaXMLModel, Impuesto2 } from '@models/factura/factura_xml_model';
import { FacturaConcepto, FacturaConceptoDetalle } from '@models/factura/factura_concepto';
import { parse } from 'querystring';
import { data } from 'jquery';
import { AlertaEtapaAccion } from '@models/alerta_etapa_accion';


moment.locale('es');

declare let jQuery: any;

@Component({
  selector: 'app-informe-comprobacion',
  templateUrl: './informe_comprobacion.component.html',
  styleUrls: ['./informe_comprobacion.component.scss']
})
export class InformeComprobacionComponent implements OnInit, OnDestroy {

  // ID Padre Solicitud Viatico Comprobacion Detalle
  idFatherSolicitudViaticoComprobacionDetalle: number = 0;

  // ID Padre Solicitud Viatico Comprobacion Pasaje
  idFatherSolicitudViaticoComprobacionPasaje: number = 0;

  // Text Mask Money //
  maskMoney = {
    mask: createNumberMask({
      prefix: '$',
      includeThousandsSeparator: true,
      allowDecimal: true,
    }),
  }  

  // View Solicitud Viatico
  @ViewChild(SolicitudResumenComponent, { static: false }) solicitudResumenComponent;

  // View Wizard
  @ViewChild('bootstrapWizardPixvs', {static: true}) bootstrapWizardPixvs: ElementRef;
  
  // Global Wizard
  _bootstrapWizardPixvs;

  // View Modal Deshacer
  @ViewChild('deshacerModal', null) deshacerModal;
  
  // Ficha
  esVisibleArchivo: boolean = false;
  esModoEliminarXML: boolean = false;

  // Version Plaform
  isMobile = false;

  // Solicitud Viatico
  solicitudViatico: SolicitudViatico;

  // Informe //
  // Solicitud Viatico Informe
  solicitudViaticoInforme: SolicitudViaticoInforme;
  solicitudViaticoInformeForm: FormGroup;

  // Comprobación //
  // Asignación Viatico
  asignacionViatico: AsignacionViatico[];

  // Asignacion Pasaje
  asignacionPasaje: AsignacionPasaje[];

  // Solicitud Viatico Comrobacion
  solicitudViaticoComprobacion: SolicitudViaticoComprobacion = null;
  solicitudViaticoComprobacionForm: FormGroup;

  // Solicitud Viatico Comprobacion Detalle
  solicitudViaticoComprobacionDetalle: SolicitudViaticoComprobacionDetalle[];
  solicitudViaticoComprobacionDetalleForm: FormGroup;
  solicitudViaticoComprobacionDetalleValid: boolean = true;
  solicitudViaticoComprobacionDetalleSelected: SolicitudViaticoComprobacionDetalle[];
  solicitudViaticoComprobacionDetalleFormArray: FormArray = new FormArray([]);

  // Solicitud Viatico Comprobacion Detalle Impuesto
  solicitudViaticoComprobacionDetalleImpuestoFormArray: FormArray = new FormArray([]);

  // Date Start Viaje
  dateStartViaje: Date = null;

  // Proveedor
  proveedor: Proveedor = new Proveedor();
  proveedoresList: NgOption[] = [];
  jsonProveedor:any={"rfc":"X","ejercicio":0};

  // Pais
  paisesList: NgOption[] = [];

  // Cuenta Pago Gasto
  cuentasGastoList: NgOption[] = [];
  
  //////////////////////////////////////////

  // Archivo
  archivo: Archivo[];
  archivoTipoComprobante: ArchivoTipoComporbante;
  archivoTipoComprobanteOther: ArchivoTipoComporbante;
  archivoTipoComprobanteFormArray: FormArray = new FormArray([]);

  // Solicitud Viatico Comprobacion Pasaje
  solicitudViaticoComprobacionPasaje: SolicitudViaticoComprobacionPasaje[];
  solicitudViaticoComprobacionPasajeForm: FormGroup;
  solicitudViaticoComprobacionPasajeFormArray: FormArray = new FormArray([]);

  // Solicitud Viatico Comprobacion Cargo
  solicitudViaticoComprobacionCargo: SolicitudViaticoComprobacionCargo[];
  solicitudViaticoComprobacionCargoForm: FormGroup;
  solicitudViaticoComprobacionCargoFormArray: FormArray = new FormArray([]);

  // Recursos Materiales //
  solicitudViaticoComprobacionRMSelected: SolicitudViaticoComprobacion[];

  // Solicitud Viatico Comprobacion Detalle RM con Borrado
  solicitudViaticoComprobacionDetalleRMBorrado: SolicitudViaticoComprobacionDetalleRMBorrado[];

  // Listado CMM //
  // Categoria Viatico
  categoriaViatico: Listado_CMM[];
  categoriaViaticoList: NgOption[];
  categoriaViaticoListadoCMM: any;

  // Tipo Comprobante
  tipoComprobante: Listado_CMM[];
  tipoComprobanteList: NgOption[];
  tipoComprobanteListadoCMM: any;

  // Forma Comprobacion
  formaComprobacion: Listado_CMM[];
  formaComprobacionList: NgOption[];
  formaComprobacionListadoCMM: any;

  // Forma Pago
  formaPago: Listado_CMM[];
  formaPagoList: NgOption[];

  // Concepto Viatico //
  conceptoViatico: ConceptoViatico[];

  // Concepto Viatico: Viatico
  conceptoViaticoViaticoList: NgOption[];

  // Moneda //
  moneda: Moneda[];
  monedaList: NgOption[];

  // Concepto Viatico: Pasaje
  conceptoViaticoPasaje: ConceptoViatico[];
  conceptoViaticoPasajeList: NgOption[];

  // RolMenu //
  rolPermisonRM: boolean = false;
  usuarioSolicitante: boolean = false;

  // Concepto Viatico: Matriz Viatico //
  matrizViatico: MatrizViatico[];
  matrizViaticoRecomendacionConceptoViatico: MatrizViaticoRecomendacionConceptoViatico[];

  // Configuracion del Ente //
  configuracionEnte: ConfiguracionEnte;

  soloLectura: boolean;

  // Factura XML //
  facturaImporteMax: number = 0;
  facturaConceptosList: NgOption[];
  facturaCompartida: SolicitudViaticoComprobacionDetalle[] = [];
  facturaImpuestoCompartida: SolicitudViaticoComprobacionDetalleImpuesto[] = [];

  // Listado CMM Claves Productos Hospedaje
  listadoCMMClavesProductosHospedaje: Listado_CMM[] = [];
  /////////////////

  //UnsubscribeAll
  private unsubscribeAll: Subject<any>;
  private importe:number=0;

  public minDatosComprobante:Date=new Date();
  public maxDatosComprobante:Date=new Date();
  public minFechaHoraSalida:Date=new Date();
  public maxFechaHoraSalida:Date=new Date();
  public minFechaHoraRegreso:Date=new Date();
  public maxFechaHoraRegreso:Date=new Date();

  // Modo Button Edit
  modoButtonEdit: boolean = false;

  constructor(
    private _spinner: NgxSpinnerService,
    private _toastr: ToastrService,
    private _informeComprobacionService: InformeComprobacionComponentService,
    private router: Router,
    private _formBuilder: FormBuilder,
    private _dateTimeAdapter: DateTimeAdapter<any>,
    private archivoService: ArchivoService,
    private moneyPipe: MoneyPipe
  ) {
    this.unsubscribeAll = new Subject();
    this._dateTimeAdapter.setLocale('es-MX');
  }

  ngOnInit() {
    this.searchPlaform();
    this.cargarInformeComprobacion();
    
  }

  ngOnDestroy() {
    // Unsubscribe from all subscriptions
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }

  ngAfterViewInit(): void {
    this.solicitudResumenComponent.cargaSolicitud(parseInt(this._informeComprobacionService.routeParams.id));

    // Modal With Bootstrap Wizard
    this.bootstrapWizardPixvsRender();

    //Parsley JS
    //jQuery('.parsleyjsComprobacionDatosGenerales').parsley();
    
  }

  searchPlaform() {
    // Mobile Width = 576.99
    if (window.innerWidth <= 576.99) {
      this.isMobile = true;
    }
  }

  clean() {
    // Comprobación //
    // Asignación Viatico
    this.asignacionViatico = [];

    // Asignacion Pasaje
    this.asignacionPasaje = [];

    // Solicitud Viatico Comprobacion
    this.solicitudViaticoComprobacion = null;

    // Solicitud Viatico Comprobacion Detalle
    this.solicitudViaticoComprobacionDetalle = [];
    this.createComprobacionDetalleForm(null, false);
    this.solicitudViaticoComprobacionDetalleSelected = [];
    this.solicitudViaticoComprobacionDetalleFormArray = new FormArray([]);

    // Solicitud Viatico Comprobacion Detalle Impuesto
    this.solicitudViaticoComprobacionDetalleImpuestoFormArray = new FormArray([]);

    // Solicitud Viatico Comprobacion Pasaje
    this.solicitudViaticoComprobacionPasaje = [];
    this.createComprobacionPasajeForm(null);
    this.solicitudViaticoComprobacionPasajeFormArray = new FormArray([]);

    // Solicitud Viatico Comprobacion Cargo
    this.solicitudViaticoComprobacionCargo = [];
    this.createComprobacionCargoForm(null);
    this.solicitudViaticoComprobacionCargoFormArray = new FormArray([]);

    // Archivo //
    this.archivo = [];
    this.archivoTipoComprobante = new ArchivoTipoComporbante();
    this.archivoTipoComprobanteOther = new ArchivoTipoComporbante();
    this.archivoTipoComprobanteFormArray = new FormArray([]);

    // Recursos Materiales //
    this.solicitudViaticoComprobacionRMSelected = [];

    // Solicitud Viatico Comprobacion Detalle RM con Borrado
    this.solicitudViaticoComprobacionDetalleRMBorrado = [];

    // Listado CMM //
    // Categoria Viatico
    this.categoriaViatico = [];
    this.categoriaViaticoList = [];

    // Tipo Comprobante
    this.tipoComprobante = [];
    this.tipoComprobanteList = [];
    this.tipoComprobanteListadoCMM = {};

    // Forma Comprobacion
    this.formaComprobacion = [];
    this.formaComprobacionList = [];
    this.formaComprobacionListadoCMM = {};

    // Forma Pago
    this.formaPago = [];
    this.formaPagoList = [];

    // Concepto Viatico //
    this.conceptoViatico = [];

    // Concepto Viatico: Viatico
    this.conceptoViaticoViaticoList = [];

    // Moneda //
    this.moneda = [];
    this.monedaList = [];

    // Concepto Viatico: Pasaje
    this.conceptoViaticoPasajeList = [];

    // Concepto Viatico: Matriz Viatico //
    this.matrizViatico = [];
    this.matrizViaticoRecomendacionConceptoViatico = [];

    // Configuracion del Ente //
    this.configuracionEnte = null;

    // Listado CMM Claves Productos Hospedaje
    this.listadoCMMClavesProductosHospedaje = [];
    //////////////////////
  }

  cargarInformeComprobacion() {
    this._spinner.show();
    this._informeComprobacionService.onInformeComprobacionChanged.pipe(takeUntil(this.unsubscribeAll)).subscribe(response => {
      if (response.status == 200) {
        this.clean();

        // Solicitud Viatico
        this.solicitudViatico = this._informeComprobacionService.solicitudViatico;

        // Informe //
        // Solicitud Viatico Informe
        this.solicitudViaticoInforme = this._informeComprobacionService.solicitudViaticoInforme;

        // Form for Solicitud Viatico Informe 
        this.createInformeForm(this.solicitudViaticoInforme);

        // Comprobación //
        // Asignacion Viatico Kpop, saliva, gato, colmillo, oso
        this.asignacionViatico = this._informeComprobacionService.asignacionViatico;

        // Asignacion Pasaje
        this.asignacionPasaje = this._informeComprobacionService.asignacionPasaje;

        this.asignacionPasaje.map(pasaje => {
          pasaje.fechaCompra = pasaje.fechaCompra ? new Date(pasaje.fechaCompra) : null;
          pasaje.fechaSalida = pasaje.fechaSalida ? new Date(pasaje.fechaSalida) : null;
          pasaje.fechaRegreso = pasaje.fechaRegreso ? new Date(pasaje.fechaRegreso) : null;
        });

        // Solicitud Viatico Comprobacion
        this.solicitudViaticoComprobacion = this._informeComprobacionService.solicitudViaticoComprobacion == null ? new SolicitudViaticoComprobacion() : this._informeComprobacionService.solicitudViaticoComprobacion;

        // Set ID Solicitud Viatico To Solicitud Viatico Comprobacion
        if (this.solicitudViaticoComprobacion.solicitudViaticoId == null) {
          this.solicitudViaticoComprobacion.solicitudViaticoId = parseInt(this._informeComprobacionService.routeParams.id);
        }

        // Form for Solicitud Viatico Comprobacion
        this.createComprobacionForm(this.solicitudViaticoComprobacion);

        // Solicitud Viatico Comprobacion Detalle
        this.solicitudViaticoComprobacionDetalle = this._informeComprobacionService.solicitudViaticoComprobacionDetalle;
        
        this.solicitudViaticoComprobacionDetalle.map(detalle => {
          detalle.fechaComprobante = detalle.fechaComprobante ? new Date(detalle.fechaComprobante) : null;
          this.solicitudViaticoComprobacionDetalleFormArray.push(this._formBuilder.group(detalle));
        });
    
        // Solicitud Viatico Comprobacion Detalle Impuesto
        this._informeComprobacionService.solicitudViaticoComprobacionDetalleImpuesto.map(impuesto => {
          this.solicitudViaticoComprobacionDetalleImpuestoFormArray.push(this._formBuilder.group(impuesto));
        });

        // Solicitud Viatico Comprobacion Detalle RM con Borrado
        this._informeComprobacionService.solicitudViaticoComprobacionDetalleRMBorrado.map(RMBorrado => {
          this.solicitudViaticoComprobacionDetalleRMBorrado.push(new SolicitudViaticoComprobacionDetalleRMBorrado(RMBorrado));
        });

        // Solicitud Viatico Comprobacion Pasaje
        this.solicitudViaticoComprobacionPasaje = this._informeComprobacionService.solicitudViaticoComprobacionPasaje;
        this.solicitudViaticoComprobacionPasaje.map(pasaje => {
          pasaje.fechaCompra = pasaje.fechaCompra ? new Date(pasaje.fechaCompra) : null;
          pasaje.fechaSalida = pasaje.fechaSalida ? new Date(pasaje.fechaSalida) : null;
          pasaje.fechaRegreso = pasaje.fechaRegreso ? new Date(pasaje.fechaRegreso) : null;
          this.solicitudViaticoComprobacionPasajeFormArray.push(this._formBuilder.group(pasaje));
        });

        // Solicitud Viatico Comprobacion Cargo
        this.solicitudViaticoComprobacionCargo = this._informeComprobacionService.solicitudViaticoComprobacionCargo;
        this.solicitudViaticoComprobacionCargo.map(cargo => {
          cargo.fechaCargoSalida = cargo.fechaCargoSalida ? new Date(cargo.fechaCargoSalida) : null;
          cargo.fechaCargoRegreso = cargo.fechaCargoRegreso ? new Date(cargo.fechaCargoRegreso) : null;
          this.solicitudViaticoComprobacionCargoFormArray.push(this._formBuilder.group(cargo));
        });

        // Archivo //
        // File
        this.archivo = this._informeComprobacionService.archivo;
        this.archivo.map(file => {
          let archivoTipoComporbante: ArchivoTipoComporbante = new ArchivoTipoComporbante(file);
          archivoTipoComporbante.nombreArchivoTemporal = file.nombreFisico + file.nombreOriginal;
          this.archivoTipoComprobanteFormArray.push(this._formBuilder.group(archivoTipoComporbante));
        });

        // Listado CMM //
        // Categoria Viatico
        this.categoriaViatico = this._informeComprobacionService.categoriaViatico;
        this.categoriaViaticoListadoCMM = ListadoCMM.CategoriaViatico;

        // Tipo Comprobante
        this.tipoComprobante = this._informeComprobacionService.tipoComprobante;
        this.tipoComprobanteListadoCMM = ListadoCMM.TipoComprobante;

        // Forma Comprobacion
        this.formaComprobacion = this._informeComprobacionService.formaComprobacion;
        this.formaComprobacionListadoCMM = ListadoCMM.FormaComprobacion;

        // Forma Pago
        this.formaPago = this._informeComprobacionService.formaPago;

        // Concepto Viatico
        this.conceptoViatico = this._informeComprobacionService.conceptoViatico;

        // Moneda
        this.moneda = this._informeComprobacionService.moneda;

        // Rol Menu
        this.rolPermisonRM = this._informeComprobacionService.permisoRM;
        this.usuarioSolicitante = this._informeComprobacionService.usuarioSolicitante;

        // Listado CMM Claves Productos Hospedaje
        this.listadoCMMClavesProductosHospedaje = this._informeComprobacionService.listadoCMMClavesProductosHospedaje;
        /////////////////

        // Load Combos
        this.cargarCombos();

        // Configuracion del Ente
        this.configuracionEnte = this._informeComprobacionService.configuracionEnte;

        // Recursos Materiales
        if (!this.solicitudViaticoComprobacion.rmFinalizoComprobacion) {

          // Concepto Viatico: Matriz Viatico //
          this.matrizViatico = this._informeComprobacionService.matrizViatico;

          // Recomendacion Concepto Viatico
          this.recursosMaterialesRecomendacionConceptoViatico();

          // Cargar Recursos Materiales
          this.cargarRecursosMateriales();
        }

        // Resumen Calculator Total No Modify
        this.resumenCalculatorTotalNoModify();

        
        // Resumen Calculator Total Modify
        this.resumenCalculatorTotalModify();

        // Comprobacion Calculator Total No Modify
        this.comprobacionCalculatorTotalNoModify();

        // Comprobacion Calculator Total Modify
        this.comprobacionCalculatorTotalModify();

        // Recursos Materiales Total
        this.recursosMaterialesCalculatorTotal();

        this.soloLectura = this._informeComprobacionService.soloLectura;

        this._spinner.hide();
      }
    }, error => {
      //Ocultamos el spinner
      this._spinner.hide();

      //Mostramos error 
      this._toastr.error(GenericService.getError(error).message);
    });
  }

  // Agregan los combos
  cargarCombos() {
    // Concepto Viatico: Viatico
    this.conceptoViatico.filter(concepto => concepto.categoriaId == ListadoCMM.CategoriaViatico.VIATICO).map(concepto => {
      this.conceptoViaticoViaticoList.push({ id: concepto.id, name: concepto.concepto });
    });

    // Concepto Viatico: Pasaje
    this.conceptoViatico.filter(concepto => concepto.categoriaId == ListadoCMM.CategoriaViatico.PASAJE).map(concepto => {
      this.conceptoViaticoPasajeList.push({ id: concepto.id, name: concepto.concepto });
    });

    // Tipo Comporbante: Factura Nacional, Comprobante Extranjero y Sin Comprobante.
    this.tipoComprobante.map(tc => {
      this.tipoComprobanteList.push({ id: tc.id, name: tc.valor });
    });

    // Forma Comprobacion
    this.formaComprobacion.map(fc => {
      this.formaComprobacionList.push({ id: fc.id, name: fc.valor });
    });

    // Forma Pago
    this.formaPago.map(pago => {
      this.formaPagoList.push({ id: pago.id, name: pago.valor });
    });

    // Moneda
    this.moneda.map(moneda => {
      this.monedaList.push({ id: moneda.id, name: moneda.nombre });
    });

  }

  // Solicitud Viatico Comprobacion
  createComprobacionForm(solicitudViaticoComprobacion: SolicitudViaticoComprobacion) {

    // Solicitud Viatico Comprobacion
    solicitudViaticoComprobacion = solicitudViaticoComprobacion;

    this.solicitudViaticoComprobacionForm = this._formBuilder.group({
      comisionNoRealizada: [solicitudViaticoComprobacion.comisionNoRealizada],
      motivoNoRealizada: [solicitudViaticoComprobacion.motivoNoRealizada],
    });
  }

  // Solicitud Viatico Informe
  createInformeForm(solicitudViaticoInforme: SolicitudViaticoInforme) {

    // Solicitud Viatico Informe
    solicitudViaticoInforme = solicitudViaticoInforme ? solicitudViaticoInforme : new SolicitudViaticoInforme();

    //Vertify Solicitud Viatico Informe es null y get new Informe
    if (this.solicitudViaticoInforme == null) {
      this.solicitudViaticoInforme = solicitudViaticoInforme
    }

    this.solicitudViaticoInformeForm = this._formBuilder.group({
      id: [solicitudViaticoInforme.id],
      solicitudViaticoComprobacionId: [solicitudViaticoInforme.solicitudViaticoComprobacionId],
      objetivoEstrategico: [solicitudViaticoInforme.objetivoEstrategico],
      objetivoEspecifico: [solicitudViaticoInforme.objetivoEspecifico],
      actividadesRealizadas: [solicitudViaticoInforme.actividadesRealizadas],
      resultadosObtenidos: [solicitudViaticoInforme.resultadosObtenidos],
      contribuciones: [solicitudViaticoInforme.contribuciones],
      vinculosANotas: [solicitudViaticoInforme.vinculosANotas],
      listadoDocumentos: [solicitudViaticoInforme.listadoDocumentos],
      conclusiones: [solicitudViaticoInforme.conclusiones],
      estatusId: [solicitudViaticoInforme.estatusId],
      fechaCreacion: [solicitudViaticoInforme.fechaCreacion],
      creadoPorId: [solicitudViaticoInforme.creadoPorId],
      fechaUltimaModificacion: [solicitudViaticoInforme.fechaUltimaModificacion],
      modificadoPorId: [solicitudViaticoInforme.modificadoPorId],
      timestamp: [solicitudViaticoInforme.timestamp]
    });

  }

  // Comprobación
  // Solicitud Viatico Comprobacion Detalle Sin RM Data to Data Table
  solicitudViaticoComprobacionDetalleSinRMDataTable(): any {
    return this.solicitudViaticoComprobacionDetalleFormArray.value.filter((detalle: SolicitudViaticoComprobacionDetalle) => detalle.estatusId == ListadoCMM.EstatusRegistro.ACTIVO && detalle.esComprobadoPorRM == false);
  }

  // Form Group
  // Create Form Group Solicitud Viatico Comprobacion Detalle
  createComprobacionDetalleForm(solicitudViaticoComprobacionDetalle: SolicitudViaticoComprobacionDetalle, esComprobadoPorRM: boolean) {
    solicitudViaticoComprobacionDetalle = solicitudViaticoComprobacionDetalle ? solicitudViaticoComprobacionDetalle : new SolicitudViaticoComprobacionDetalle();
    this.solicitudViaticoComprobacionDetalleForm = this._formBuilder.group({
      id: [solicitudViaticoComprobacionDetalle.id],
      solicitudViaticoComprobacionId: [solicitudViaticoComprobacionDetalle.solicitudViaticoComprobacionId],
      categoriaId: [solicitudViaticoComprobacionDetalle.categoriaId, Validators.required],
      categoria: [solicitudViaticoComprobacionDetalle.categoria],
      conceptoViaticoId: [solicitudViaticoComprobacionDetalle.conceptoViaticoId, Validators.required],
      conceptoViatico: [solicitudViaticoComprobacionDetalle.conceptoViatico],
      tipoComprobanteId: [solicitudViaticoComprobacionDetalle.tipoComprobanteId, Validators.required],
      tipoComprobante: [solicitudViaticoComprobacionDetalle.tipoComprobante],
      rfc: [solicitudViaticoComprobacionDetalle.rfc,[Validators.minLength(12), Validators.maxLength(13)]],
      razonSocial: [solicitudViaticoComprobacionDetalle.razonSocial, [Validators.minLength(4), Validators.maxLength(100)]],
      proveedorId: [solicitudViaticoComprobacionDetalle.proveedorId],
      proveedorPaisId: [solicitudViaticoComprobacionDetalle.proveedorPaisId],
      fechaComprobante: [solicitudViaticoComprobacionDetalle.fechaComprobante, Validators.required],
      folio: [solicitudViaticoComprobacionDetalle.folio],
      formaPagoId: [solicitudViaticoComprobacionDetalle.formaPagoId, Validators.required],
      formaPago: [solicitudViaticoComprobacionDetalle.formaPago],
      monedaId: [solicitudViaticoComprobacionDetalle.monedaId, Validators.required],
      tipoCambio: [solicitudViaticoComprobacionDetalle.tipoCambio],
      importe: [solicitudViaticoComprobacionDetalle.importe, [Validators.required, Validators.min(1)]],
      importePesos: [solicitudViaticoComprobacionDetalle.importePesos, [Validators.required, Validators.min(1)]],
      esComprobadoPorRM: [esComprobadoPorRM],
      asignacionViaticoId: [solicitudViaticoComprobacionDetalle.asignacionViaticoId],
      asignacionPasajeId: [solicitudViaticoComprobacionDetalle.asignacionPasajeId],
      comentarios: [solicitudViaticoComprobacionDetalle.comentarios],
      estatusId: [solicitudViaticoComprobacionDetalle.estatusId],
      totalFactura: [solicitudViaticoComprobacionDetalle.totalFactura],
      subTotalFactura: [solicitudViaticoComprobacionDetalle.subTotalFactura],
      descuentoFactura: [solicitudViaticoComprobacionDetalle.descuentoFactura],
      numeroPartida: [solicitudViaticoComprobacionDetalle.numeroPartida, Validators.required],
      conceptoDescripcion: [solicitudViaticoComprobacionDetalle.conceptoDescripcion],
      claveProdServ: [solicitudViaticoComprobacionDetalle.claveProdServ],
      conceptoImporte: [solicitudViaticoComprobacionDetalle.conceptoImporte],
      conceptoDescuento : [solicitudViaticoComprobacionDetalle.conceptoDescuento],
      subTotalComprobacion : [solicitudViaticoComprobacionDetalle.subTotalComprobacion],
      descuentoComprobacion : [solicitudViaticoComprobacionDetalle.descuentoComprobacion],      
      cuentaPagoGastoId: [solicitudViaticoComprobacionDetalle.cuentaPagoGastoId],
      formaComprobacionId: [solicitudViaticoComprobacionDetalle.formaComprobacionId, Validators.required],
      formaComprobacion: [solicitudViaticoComprobacionDetalle.formaComprobacion],
      uuid: [solicitudViaticoComprobacionDetalle.uuid],
      fileXML: [solicitudViaticoComprobacionDetalle.fileXML, Validators.required],
      fileOther: [solicitudViaticoComprobacionDetalle.fileOther]
    });
  }

  // Create Form Group Solicitud Viatico Comprobacion Pasaje 
  createComprobacionPasajeForm(solicitudViaticoComprobacionPasaje: SolicitudViaticoComprobacionPasaje) {
    solicitudViaticoComprobacionPasaje = solicitudViaticoComprobacionPasaje ? solicitudViaticoComprobacionPasaje : new SolicitudViaticoComprobacionPasaje();
    this.solicitudViaticoComprobacionPasajeForm = this._formBuilder.group({
      id: [solicitudViaticoComprobacionPasaje.id],
      fechaCompra: [solicitudViaticoComprobacionPasaje.fechaCompra, Validators.required],
      nombreLinea: [solicitudViaticoComprobacionPasaje.nombreLinea, Validators.required],
      viajeRedondo: [solicitudViaticoComprobacionPasaje.viajeRedondo],
      fechaSalida: [solicitudViaticoComprobacionPasaje.fechaSalida, Validators.required],
      fechaRegreso: [solicitudViaticoComprobacionPasaje.fechaRegreso, Validators.required],
      numeroBoletoIda: [solicitudViaticoComprobacionPasaje.numeroBoletoIda, Validators.required],
      numeroBoletoRegreso: [solicitudViaticoComprobacionPasaje.numeroBoletoRegreso, Validators.required],
      boletoUtilizadoIda: [solicitudViaticoComprobacionPasaje.boletoUtilizadoIda],
      boletoUtilizadoRegreso: [solicitudViaticoComprobacionPasaje.boletoUtilizadoRegreso],
      codigoReservacion: [solicitudViaticoComprobacionPasaje.codigoReservacion, Validators.required],
      comentarios: [solicitudViaticoComprobacionPasaje.comentarios],
      estatusId: [solicitudViaticoComprobacionPasaje.estatusId],
    });
  }

  // Create Form Group Solicitud Viatico Comprobacion Cargo
  createComprobacionCargoForm(solicitudViaticoComprobacionCargo: SolicitudViaticoComprobacionCargo) {
    solicitudViaticoComprobacionCargo = solicitudViaticoComprobacionCargo ? solicitudViaticoComprobacionCargo : new SolicitudViaticoComprobacion();
    this.solicitudViaticoComprobacionCargoForm = this._formBuilder.group({
      id: [solicitudViaticoComprobacionCargo.id],
      fechaCargoSalida: [solicitudViaticoComprobacionCargo.fechaCargoSalida, Validators.required],
      fechaCargoRegreso: [solicitudViaticoComprobacionCargo.fechaCargoRegreso],
      montoCargoSalida: [solicitudViaticoComprobacionCargo.montoCargoSalida, Validators.required],
      montoCargoRegreso: [solicitudViaticoComprobacionCargo.montoCargoRegreso],
      solicitudCambio: [solicitudViaticoComprobacionCargo.solicitudCambio],
      estatusId: [solicitudViaticoComprobacionCargo.estatusId],
    });
  }

  //Section Balance por concepto asignado By:AGG
  public comprobacionesConBalance=new Array();
  private comprobaciones=new Array();
  //Section 1 Resumen
  resumenTableResult: {
    viaticos: {
      montoComision: number,
      montoTransferido: number,
      gastoComprobado: number,
      aReintegar: number
    },
    pasajes: {
      montoComision: number,
      montoTransferido: number,
      gastoComprobado: number,
      aReintegar: number
    }
  } = {
      viaticos: {
        montoComision: 0,
        montoTransferido: 0,
        gastoComprobado: 0,
        aReintegar: 0
      },
      pasajes: {
        montoComision: 0,
        montoTransferido: 0,
        gastoComprobado: 0,
        aReintegar: 0
      }
    }

  cleanResumenTableResult() {
    this.resumenTableResult = {
      viaticos: {
        montoComision: 0,
        montoTransferido: 0,
        gastoComprobado: 0,
        aReintegar: 0
      },
      pasajes: {
        montoComision: 0,
        montoTransferido: 0,
        gastoComprobado: 0,
        aReintegar: 0
      }
    };  
    
  }

  calcularBalanceViaticos(){    

     //Quitar los conceptos asignados y con monto 0  By:AGG     
     //Agregar los conceptos y montos asignados para despues hacer el balance con la comprobacion By:AGG
     this.asignacionViatico.filter(asignacion=>asignacion.montoPorTransferir>0).map(concepto=>{
       this.comprobacionesConBalance.push({
         ConceptoViaticoId:concepto.conceptoViatico.id,
         ConceptoViaticoNombre:concepto.conceptoViaticoNombre,
         MontoAsignado:this.moneyPipe.transformNotSymbol(concepto.montoPorTransferir),
         MontoComprobado:0,
         Balance:concepto.montoPorTransferir
       });      
     });

       //Realizar el balance de las comprobaciones By:AGG
    this.comprobaciones.forEach((comprobacion)=>{
      if(comprobacion.conceptoViaticoId){
          let concepto=this.comprobacionesConBalance.find(_comprobacion=>_comprobacion.ConceptoViaticoId==comprobacion.conceptoViaticoId);

          if(concepto){
              concepto.MontoComprobado +=  parseFloat(this.moneyPipe.transformNotSymbol(comprobacion.importe));  
              concepto.Balance= (parseFloat(this.moneyPipe.transformNotSymbol(concepto.MontoAsignado))-parseFloat(concepto.MontoComprobado)).toFixed(2);
          }   
      }   
      });
  }
 
  // Resumen Calculator Total No Modify
  resumenCalculatorTotalNoModify() {
    // Refresh
    this.cleanResumenTableResult();
  
    // Asignacion Viatico
    this.asignacionViatico.map(viatico => {
      // Monto Comision
      this.resumenTableResult.viaticos.montoComision += viatico.montoConPernocta;
      this.resumenTableResult.viaticos.montoComision += viatico.montoSinPernocta;

      // Total Transferido
      this.resumenTableResult.viaticos.montoTransferido += viatico.montoPorTransferir;
    });

    // Asignacion Pasaje
    this.asignacionPasaje.map(pasaje => {
      // Monto Comision
      this.resumenTableResult.pasajes.montoComision += pasaje.costo;

      // Asignar a funcionario
      if (pasaje.asignadoAFuncionario) {
        // Total Transferido
        this.resumenTableResult.pasajes.montoTransferido += pasaje.costo;
      }
      
    });
   
   
    // With Redondeo //
    // Viaticos
    this.resumenTableResult.viaticos.montoComision = parseFloat(parseFloat(this.resumenTableResult.viaticos.montoComision.toString()).toFixed(2));
    this.resumenTableResult.viaticos.montoTransferido = parseFloat(parseFloat(this.resumenTableResult.viaticos.montoTransferido.toString()).toFixed(2));
    
    // Pasajes
    this.resumenTableResult.pasajes.montoComision = parseFloat(parseFloat(this.resumenTableResult.pasajes.montoComision.toString()).toFixed(2));
    this.resumenTableResult.pasajes.montoTransferido = parseFloat(parseFloat(this.resumenTableResult.pasajes.montoTransferido.toString()).toFixed(2));
    ///////////////////
  }

  // Resumen Calculator Total Modify
  resumenCalculatorTotalModify() {      
   // Viatico
   this.resumenTableResult.viaticos.gastoComprobado = 0;
   this.resumenTableResult.viaticos.aReintegar = 0;
   // Pasaje
   this.resumenTableResult.pasajes.gastoComprobado = 0; 
   
   //Limpiar arreglos By:AGG
   this.comprobaciones=[];
   this.comprobacionesConBalance=[];

   this.solicitudViaticoComprobacionDetalleFormArray.value.filter((comprobacion: SolicitudViaticoComprobacionDetalle) => comprobacion.estatusId == ListadoCMM.EstatusRegistro.ACTIVO && comprobacion.esComprobadoPorRM == false).map((comprobacion: SolicitudViaticoComprobacionDetalle) => {     
      //Agregar todas las comprobaciones del comisionado By:AGG
      this.comprobaciones.push(comprobacion);
      
      // Viatico
      if (comprobacion.categoriaId == ListadoCMM.CategoriaViatico.VIATICO) {
        // Gasto Comprobado
        this.resumenTableResult.viaticos.gastoComprobado += parseFloat(comprobacion.importePesos.toString());
      }

      // Pasaje
      if (comprobacion.categoriaId == ListadoCMM.CategoriaViatico.PASAJE) {
        // Gasto Comprobado
        this.resumenTableResult.pasajes.gastoComprobado += parseFloat(comprobacion.importePesos.toString());
      }
    });
  
    // Reintegro //
    // Viatico    
    if(this.resumenTableResult.viaticos.montoTransferido >= this.resumenTableResult.viaticos.gastoComprobado){
      this.resumenTableResult.viaticos.aReintegar = this.resumenTableResult.viaticos.montoTransferido - this.resumenTableResult.viaticos.gastoComprobado;
    }else{
      this.resumenTableResult.viaticos.aReintegar = 0;
    }

    //Pasaje
    if(this.resumenTableResult.pasajes.montoTransferido >= this.resumenTableResult.pasajes.gastoComprobado){
      this.resumenTableResult.pasajes.aReintegar = this.resumenTableResult.pasajes.montoTransferido - this.resumenTableResult.pasajes.gastoComprobado;
    }else{
      this.resumenTableResult.pasajes.aReintegar = 0;
    }
    ///////////////

    // With Redondeo //
    // Viaticos
    this.resumenTableResult.viaticos.gastoComprobado = parseFloat(parseFloat(this.resumenTableResult.viaticos.gastoComprobado.toString()).toFixed(2));
    this.resumenTableResult.viaticos.aReintegar = parseFloat(parseFloat(this.resumenTableResult.viaticos.aReintegar.toString()).toFixed(2));
    
    // Pasajes
    this.resumenTableResult.pasajes.gastoComprobado = parseFloat(parseFloat(this.resumenTableResult.pasajes.gastoComprobado.toString()).toFixed(2));
    this.resumenTableResult.pasajes.aReintegar = parseFloat(parseFloat(this.resumenTableResult.pasajes.aReintegar.toString()).toFixed(2));
    ///////////////////
    this.calcularBalanceViaticos();
  }

  //Section 2 Comprobacion  //
  comprobacionTableResult: {
    totalTransferido: number,
    sinComprobante: number,
    conComprobante: number,
    totalComision: number,
    reintegro: number,
    balance: number
  } = {
      totalTransferido: 0,
      sinComprobante: 0,
      conComprobante: 0,
      totalComision: 0,
      reintegro: 0,
      balance: 0
    }

  cargarComprobacion() {
    // Categoria Viatico List
    this.categoriaViaticoList = [];

    // Which esComprobadoPorRM
    if (this.solicitudViaticoComprobacionDetalleForm.controls.esComprobadoPorRM.value) {
      // Categoria Viatico
      this.categoriaViatico.map(categoria => {
        // Viatico, Pasaje and Cargo por Servicio
        if (categoria.id == ListadoCMM.CategoriaViatico.VIATICO || categoria.id == ListadoCMM.CategoriaViatico.PASAJE || categoria.id == ListadoCMM.CategoriaViatico.CARGO_SERVICIO) {
          this.categoriaViaticoList.push({ id: categoria.id, name: categoria.valor });
        }
      });
      this.categoriaViaticoList = [...this.categoriaViaticoList];
    } else {
      // Categoria Viatico
      this.categoriaViatico.map(categoria => {
        // Viatico, Pasaje and Reintegro
        if (categoria.id == ListadoCMM.CategoriaViatico.VIATICO || categoria.id == ListadoCMM.CategoriaViatico.PASAJE || categoria.id == ListadoCMM.CategoriaViatico.REINTEGRO) {
          this.categoriaViaticoList.push({ id: categoria.id, name: categoria.valor });
        }
      });
      this.categoriaViaticoList = [...this.categoriaViaticoList];
    }
  }

  getInfoFile(row: SolicitudViaticoComprobacionDetalle, tipoArchivoId: number): string {
    let file = this.archivoTipoComprobanteFormArray.controls.find((file: FormGroup) => file.controls.referenciaId.value == row.id && file.controls.vigente.value == true && (tipoArchivoId == ListadoCMM.Archivo.XML ? file.controls.tipoArchivoId.value == ListadoCMM.Archivo.XML : file.controls.tipoArchivoId.value != ListadoCMM.Archivo.XML)) as FormGroup;
    if (file) {
      return file.controls.nombreArchivoTemporal.value;
    }

    return '';
  }

  //Select Solicitud Viatico Comprobacion
  comprobacionSelect({ selected }): void {
    this.solicitudViaticoComprobacionDetalleSelected.splice(0, this.solicitudViaticoComprobacionDetalleSelected.length);
    this.solicitudViaticoComprobacionDetalleSelected.push(...selected);
  }

  //Remove Solicitud Viatico Comprobacion/Pasaje/Cargo
  comprobacionRemove(): void {
    this.solicitudViaticoComprobacionDetalleSelected.map(comprobacion => {
      const comprobacionSinRM = this.solicitudViaticoComprobacionDetalleFormArray.controls.find((_comprobacion: FormGroup) => _comprobacion.controls.esComprobadoPorRM.value == false && _comprobacion.controls.id.value == comprobacion.id) as FormGroup;
      comprobacionSinRM.controls.estatusId.setValue(ListadoCMM.EstatusRegistro.BORRADO);
      comprobacionSinRM.markAsDirty();

      // Busca Solicitud Viatico Comprobacion Detalle Impuesto (Factura Nacional)
      if(comprobacionSinRM.controls.tipoComprobanteId.value == ListadoCMM.TipoComprobante.FACTURA_NACIONAL){
        this.solicitudViaticoComprobacionDetalleImpuestoFormArray.controls.filter((impuesto: FormGroup) => impuesto.controls.solicitudViaticoComprobacionDetalleId.value == comprobacionSinRM.controls.id.value && impuesto.controls.estatusId.value == ListadoCMM.EstatusRegistro.ACTIVO).map((impuesto: FormGroup) => {
          impuesto.controls.estatusId.setValue(ListadoCMM.EstatusRegistro.BORRADO);
          impuesto.markAsDirty();
        });
      }

      // Busca el Archivo para eliminar o el estatus vigente a false
      this.archivoTipoComprobanteFormArray.controls.filter(file => file.value.referenciaId == comprobacion.id).map((file: FormGroup) => {
        if (file.controls.id.value != '') {
          file.controls.vigente.setValue(false);
          file.markAsDirty();
        } else {
          this.archivoTipoComprobanteFormArray.removeAt(this.archivoTipoComprobanteFormArray.controls.findIndex((_file: FormGroup) => _file.controls == file.controls))
        }
      });

      // Busca Pasaje
      this.solicitudViaticoComprobacionPasajeFormArray.controls.filter(_pasaje => _pasaje.value.solicitudViaticoComprobacionDetalleId == comprobacion.id).map((_pasaje: FormGroup) => {
        _pasaje.controls.estatusId.setValue(ListadoCMM.EstatusRegistro.BORRADO);
        _pasaje.markAsDirty();
      });
    });

    this.solicitudViaticoComprobacionDetalleSelected = [];
    
    // Resumen Calculator Total Modify
    this.resumenCalculatorTotalModify();

    // Comprobacion Calculator Total Modify
    this.comprobacionCalculatorTotalModify();
  }

  convertDateFormat(fecha): string {
    let date: string = '';
    if (fecha) {
      date = moment(fecha).format('MMMM DD, YYYY h:mm A');
      date = date.charAt(0).toUpperCase() + date.slice(1)
    }
    return date;
  }

  /*
    TOTAL TRANSFERIDO = Viene de Asignacion de Viaticos
    GASTOS SIN COMPROBANTE = Sumatoria de Registros que no tengan un Comprobante Nacional
    GASTOS CON COMROBANTE = Sumatoria de Registros que tengan un XML (Factura)
    TOTAL COMISION = Sumatoria de GASTOS SIN COMPROBANTE + GASTOS CON COMROBANTE
    REINTEGRO = TOTAL TRANSFERIDO  - GASTOS SIN COMPROBANTE - GASTOS CON COMROBANTE
    BALANCE = TOTAL TRANSFERIDO  - TOTAL COMISION - REINTREGRO
  */

  // Comprobacion Calculator Total No Modify
  comprobacionCalculatorTotalNoModify() {
    // Total Transferido : Viatico + Pasaje
    this.comprobacionTableResult.totalTransferido = this.resumenTableResult.viaticos.montoTransferido + this.resumenTableResult.pasajes.montoTransferido
  }

  // Comprobacion Calculator Total Modify
  comprobacionCalculatorTotalModify() {
    // Refresh
    this.comprobacionTableResult.sinComprobante = 0;
    this.comprobacionTableResult.conComprobante = 0;
    this.comprobacionTableResult.reintegro = 0;
    this.comprobacionTableResult.totalComision = 0;
    this.comprobacionTableResult.balance = 0;

    this.solicitudViaticoComprobacionDetalleFormArray.value.filter((comprobacion: SolicitudViaticoComprobacionDetalle) => comprobacion.esComprobadoPorRM == false && comprobacion.estatusId == ListadoCMM.EstatusRegistro.ACTIVO).map((comprobacion: SolicitudViaticoComprobacionDetalle) => {

      // Categoria Viatico: Viatico y Pasaje
      if (comprobacion.categoriaId == ListadoCMM.CategoriaViatico.VIATICO || comprobacion.categoriaId == ListadoCMM.CategoriaViatico.PASAJE) {
        // Gastos Sin Comprobante
        if (comprobacion.tipoComprobanteId == ListadoCMM.TipoComprobante.SIN_COMPROBANTE || comprobacion.tipoComprobanteId == ListadoCMM.TipoComprobante.COMPROBANTE_EXTRANJERO) {
          this.comprobacionTableResult.sinComprobante += parseFloat(comprobacion.importePesos.toString());
        }

        // Gastos Con Comprobante
        if (comprobacion.tipoComprobanteId == ListadoCMM.TipoComprobante.FACTURA_NACIONAL) {
          this.comprobacionTableResult.conComprobante += parseFloat(comprobacion.importePesos.toString());
        }
      }

      // Reintegro
      if (comprobacion.categoriaId == ListadoCMM.CategoriaViatico.REINTEGRO) {
        this.comprobacionTableResult.reintegro += parseFloat(comprobacion.importePesos.toString());
      }
    });

    // Total Comision
    this.comprobacionTableResult.totalComision = this.comprobacionTableResult.conComprobante + this.comprobacionTableResult.sinComprobante;

    // Balance
    this.comprobacionTableResult.balance = (this.comprobacionTableResult.totalTransferido - this.comprobacionTableResult.totalComision) - this.comprobacionTableResult.reintegro;

    // With Redondeo //
    this.comprobacionTableResult.sinComprobante = parseFloat(parseFloat(this.comprobacionTableResult.sinComprobante.toString()).toFixed(2));
    this.comprobacionTableResult.conComprobante = parseFloat(parseFloat(this.comprobacionTableResult.conComprobante.toString()).toFixed(2));
    this.comprobacionTableResult.reintegro = parseFloat(parseFloat(this.comprobacionTableResult.reintegro.toString()).toFixed(2));
    this.comprobacionTableResult.totalComision = parseFloat(parseFloat(this.comprobacionTableResult.totalComision.toString()).toFixed(2));
    this.comprobacionTableResult.balance = parseFloat(parseFloat(this.comprobacionTableResult.balance.toString()).toFixed(2));
    ///////////////////
  }

  // Selected Categoria Viatico
  categoriaViaticoSelected(event) {

    // Reintegro
    if (event.id == ListadoCMM.CategoriaViatico.REINTEGRO) {
      this.solicitudViaticoComprobacionDetalleForm.controls.importePesos.enable();
    }

    //this.solicitudViaticoComprobacionDetalleForm.controls.importePesos.enable();
    this.createComprobacionDetalleForm(null, this.solicitudViaticoComprobacionDetalleForm.controls.esComprobadoPorRM.value);
    this.createComprobacionPasajeForm(null);
    this.createComprobacionCargoForm(null);

    //Set ID Categoria Viatico And Comprobado Por RM
    this.solicitudViaticoComprobacionDetalleForm.controls.categoriaId.setValue(event.id);

    setTimeout(() => {
      this._bootstrapWizardPixvs.bootstrapWizard('resetWizard');
    }, 0);
  }

  getCategoriaViatico(categoriaId: number): string {
    if (categoriaId) {
      return this.categoriaViatico.find(categoria => categoria.id == categoriaId).valor;
    }
    return '';
  }

  getConceptoViatico(conceptoViaticoId: number): string {
    if (conceptoViaticoId) {
      return this.conceptoViatico.find(concepto => concepto.id == conceptoViaticoId).concepto;
    }
    return '';
  }

  getConceptoViaticoPasaje(conceptoViaticoId: number): string {
    if (conceptoViaticoId) {
      return this.conceptoViatico.find(concepto => concepto.id == conceptoViaticoId).concepto;
    }
    return '';
  }

  // Selected Tipo Comprobante
  tipoComprobanteSelected(event) {
    if (event.id != ListadoCMM.TipoComprobante.FACTURA_NACIONAL) {
      this.cleanFileXML();      
    }

    if(event.id == ListadoCMM.TipoComprobante.COMPROBANTE_EXTRANJERO){
      // Mostrar spinner
      this._spinner.show();
      jQuery('.modal').addClass("pixvs-spinner-modal");
      this.proveedoresList = [];
      this.paisesList = [];
      this._informeComprobacionService.getListadoProveedoresAndPaises(this.solicitudViatico.ejercicio).then(response => {
        
        if(response.data.proveedores.status != 30200){
          // Get Proveedores and Paises
          var proveedores: Proveedor[] = response.data.proveedores.data;
          var paises: PaisSAACG[] = response.data.paises.data;
         
          // Set ProveedoresList
          proveedores.filter(proveedor => proveedor.TipoProveedorId == '05').map(proveedor => {
            this.proveedoresList.push({id: proveedor.ProveedorId, razonSocial: proveedor.RazonSocial, rfc: proveedor.RFC, paisId: proveedor.PaisId});
          });
          this.proveedoresList=this.proveedoresList.filter(provee=>provee.paisId!="mx".toUpperCase());
          this.proveedoresList = [...this.proveedoresList];

          // Set PaisesList
          paises.map(pais => {
            this.paisesList.push({id: pais.PaisId, nombre: pais.Nombre});
          });
          this.paisesList=this.paisesList.filter(pais=>pais.id!="mx".toUpperCase());

          this.paisesList = [...this.paisesList];
        }
        // Ocultar spinner
        this._spinner.hide();
        jQuery('.modal').removeClass("pixvs-spinner-modal");
        
        //Si SAACG_API regresa error con los proveedores mostrar el msj
        if(response.data.proveedores.status!=200){          
          this._toastr.error(response.data.proveedores.status+' | '+response.data.proveedores.message);
        }
        //Si SAACG_API regresa erro con los paises mostrar el msj
        if(response.data.paises.status!=200){          
          this._toastr.error(response.data.paises.status+' | '+response.data.paises.message);
          this.proveedoresList=null;
        }
      }, error => {

        // Ocultar spinner
        this._spinner.hide();
        jQuery('.modal').removeClass("pixvs-spinner-modal");
      });
    }

    setTimeout(() => {
      this._bootstrapWizardPixvs.bootstrapWizard('resetWizard');
    }, 0);
  }

  // Recursos Materiales
  recursosMaterialesTableResult: {
    sinComprobante: number,
    conComprobante: number,
    totalComision: number
  } = {
      sinComprobante: 0,
      conComprobante: 0,
      totalComision: 0
    }

  // Solicitud Viatico Comprobacion Detalle Con RM Data to Data Table
  solicitudViaticoComprobacionDetalleConRMDataTable(): any {
    return this.solicitudViaticoComprobacionDetalleFormArray.value.filter((detalle: SolicitudViaticoComprobacionDetalle) => detalle.estatusId == ListadoCMM.EstatusRegistro.ACTIVO && detalle.esComprobadoPorRM == true);
  }

  cargarRecursosMateriales() {
    try {
      //Viatico
    this.asignacionViatico.map(viatico => {
      let solicitudViaticoComprobacionDetalle: SolicitudViaticoComprobacionDetalle[] = this.solicitudViaticoComprobacionDetalleFormArray.value.filter((comprobacion: SolicitudViaticoComprobacionDetalle) => comprobacion.esComprobadoPorRM == true && comprobacion.asignacionViaticoId == viatico.id);
      if (solicitudViaticoComprobacionDetalle.length == 0) {

        // Vertify Solicitud Viatico Comprobacion Deetalle RM with Remove
        let solicitudViaticoComprobacionDetalleRMBorrado = this.solicitudViaticoComprobacionDetalleRMBorrado.find(RMBorrado => RMBorrado.asignacionViaticoId == viatico.id && RMBorrado.conceptoViaticoId == viatico.conceptoViaticoId && RMBorrado.categoriaId == ListadoCMM.CategoriaViatico.VIATICO && RMBorrado.already == false);
        
        if (!solicitudViaticoComprobacionDetalleRMBorrado) {
          let _solicitudViaticoComprobacionDetalle: SolicitudViaticoComprobacionDetalle = new SolicitudViaticoComprobacionDetalle();
          _solicitudViaticoComprobacionDetalle.id = this.idFatherSolicitudViaticoComprobacionDetalle;
          _solicitudViaticoComprobacionDetalle.categoriaId = ListadoCMM.CategoriaViatico.VIATICO;
          _solicitudViaticoComprobacionDetalle.categoria = this.categoriaViatico.find(categoria => categoria.id == ListadoCMM.CategoriaViatico.VIATICO);
          _solicitudViaticoComprobacionDetalle.conceptoViaticoId = this.conceptoViatico.find(concepto => concepto.id == viatico.conceptoViaticoId).id;
          _solicitudViaticoComprobacionDetalle.conceptoViatico = this.conceptoViatico.find(concepto => concepto.id == viatico.conceptoViaticoId);
          _solicitudViaticoComprobacionDetalle.esComprobadoPorRM = true;
          _solicitudViaticoComprobacionDetalle.asignacionViaticoId = viatico.id;
          _solicitudViaticoComprobacionDetalle.tipoComprobante = this.tipoComprobante.find(tipo => tipo.id == _solicitudViaticoComprobacionDetalle.tipoComprobanteId);
          _solicitudViaticoComprobacionDetalle.formaPago = this.formaPago.find(pago => pago.id == _solicitudViaticoComprobacionDetalle.formaPagoId);          
          // _solicitudViaticoComprobacionDetalle.conceptoImporte = _solicitudViaticoComprobacionDetalle.conceptoImporte!=null?_solicitudViaticoComprobacionDetalle.conceptoImporte:0;
          //_solicitudViaticoComprobacionDetalle.fechaComprobante = viatico.fec new Date(viatico.fechaCreacion);

          // Vertify Recomendacion Concepto Viatico for importe
          //let matrizViaticoRecomendacionConceptoViatico: MatrizViaticoRecomendacionConceptoViatico = this.matrizViaticoRecomendacionConceptoViatico.find(matriz => matriz.conceptoViaticoId == this.conceptoViatico.find(concepto => concepto.id == viatico.conceptoViaticoId).id);

          //_solicitudViaticoComprobacionDetalle.importePesos = matrizViaticoRecomendacionConceptoViatico ? matrizViaticoRecomendacionConceptoViatico.monto - viatico.montoPorTransferir : 0;
          _solicitudViaticoComprobacionDetalle.importePesos = (viatico.montoConPernocta + viatico.montoSinPernocta) - viatico.montoPorTransferir;
          if(_solicitudViaticoComprobacionDetalle.conceptoImporte!=null)
            this.solicitudViaticoComprobacionDetalleFormArray.push(this._formBuilder.group(_solicitudViaticoComprobacionDetalle));
          
            // this.solicitudViaticoComprobacionDetalleFormArray=this.solicitudViaticoComprobacionDetalleFormArray && this.solicitudViaticoComprobacionDetalleFormArray.value.filter(x=>x.conceptoImporte!=null);
          this.idFatherSolicitudViaticoComprobacionDetalle--;
        } else {
          solicitudViaticoComprobacionDetalleRMBorrado.already = true;
        }
      }
    });

    //Pasaje
    this.asignacionPasaje.map(pasaje => {
      if (!pasaje.asignadoAFuncionario) {
        let solicitudViaticoComprobacionDetalle: SolicitudViaticoComprobacionDetalle[] = this.solicitudViaticoComprobacionDetalleFormArray.value.filter((comprobacion: SolicitudViaticoComprobacionDetalle) => comprobacion.esComprobadoPorRM == true && comprobacion.asignacionPasajeId == pasaje.id);
        if (solicitudViaticoComprobacionDetalle.length == 0) {

          // Vertify Solicitud Viatico Comprobacion Deetalle RM with Remove
          let solicitudViaticoComprobacionDetalleRMBorrado = this.solicitudViaticoComprobacionDetalleRMBorrado.find(RMBorrado => RMBorrado.asignacionPasajeId == pasaje.id && RMBorrado.conceptoViaticoId == pasaje.conceptoViaticoId && RMBorrado.categoriaId == ListadoCMM.CategoriaViatico.PASAJE && RMBorrado.importePesos == pasaje.costo && RMBorrado.already == false);
          if (!solicitudViaticoComprobacionDetalleRMBorrado) {

            // Comprobacion
            let _solicitudViaticoComprobacionDetalle: SolicitudViaticoComprobacionDetalle = new SolicitudViaticoComprobacionDetalle();
            _solicitudViaticoComprobacionDetalle.id = this.idFatherSolicitudViaticoComprobacionDetalle;
            _solicitudViaticoComprobacionDetalle.categoriaId = ListadoCMM.CategoriaViatico.PASAJE;
            _solicitudViaticoComprobacionDetalle.categoria = this.categoriaViatico.find(categoria => categoria.id == ListadoCMM.CategoriaViatico.PASAJE);
            _solicitudViaticoComprobacionDetalle.conceptoViaticoId = pasaje.conceptoViaticoId;
            _solicitudViaticoComprobacionDetalle.conceptoViatico = pasaje.conceptoViatico;
            _solicitudViaticoComprobacionDetalle.esComprobadoPorRM = true;
            _solicitudViaticoComprobacionDetalle.asignacionPasajeId = pasaje.id;
            _solicitudViaticoComprobacionDetalle.importePesos = pasaje.costo;
            _solicitudViaticoComprobacionDetalle.tipoComprobante = this.tipoComprobante.find(tipo => tipo.id == _solicitudViaticoComprobacionDetalle.tipoComprobanteId);
            _solicitudViaticoComprobacionDetalle.formaPago = this.formaPago.find(pago => pago.id == _solicitudViaticoComprobacionDetalle.formaPagoId);

            this.solicitudViaticoComprobacionDetalleFormArray.push(this._formBuilder.group(_solicitudViaticoComprobacionDetalle));
            this.idFatherSolicitudViaticoComprobacionDetalle--;

            // Pasaje
            let solicitudViaticoComprobacionPasaje: SolicitudViaticoComprobacionPasaje = new SolicitudViaticoComprobacionPasaje(pasaje);
            solicitudViaticoComprobacionPasaje.id = this.idFatherSolicitudViaticoComprobacionPasaje;
            solicitudViaticoComprobacionPasaje.solicitudViaticoComprobacionDetalleId = _solicitudViaticoComprobacionDetalle.id;
            this.solicitudViaticoComprobacionPasajeFormArray.push(this._formBuilder.group(solicitudViaticoComprobacionPasaje));
            this.idFatherSolicitudViaticoComprobacionPasaje--;
          } else {
            solicitudViaticoComprobacionDetalleRMBorrado.already = true;
          }
        }
      }
    });
    } catch (error) {
      this._toastr.info("Informe Comprobacion front: "+error);
    }
    
  }

  recursosMaterialesCalculatorTotal() {
    this.recursosMaterialesTableResult = {
      sinComprobante: 0,
      conComprobante: 0,
      totalComision: 0
    }

    this.solicitudViaticoComprobacionDetalleFormArray.value.filter((data: SolicitudViaticoComprobacionDetalle) => data.esComprobadoPorRM == true && data.estatusId == ListadoCMM.EstatusRegistro.ACTIVO).map(data => {
      if (data.tipoComprobanteId == ListadoCMM.TipoComprobante.SIN_COMPROBANTE || data.tipoComprobanteId == ListadoCMM.TipoComprobante.COMPROBANTE_EXTRANJERO) {
        this.recursosMaterialesTableResult.sinComprobante += parseFloat(data.importePesos.toString());
      }

      if (data.tipoComprobanteId == ListadoCMM.TipoComprobante.FACTURA_NACIONAL) {
        this.recursosMaterialesTableResult.conComprobante += parseFloat(data.importePesos.toString());
      }

      this.recursosMaterialesTableResult.totalComision += parseFloat(data.importePesos.toString());
    });

    // With Redondeo //
    this.recursosMaterialesTableResult.sinComprobante = parseFloat(parseFloat(this.recursosMaterialesTableResult.sinComprobante.toString()).toFixed(2));
    this.recursosMaterialesTableResult.conComprobante = parseFloat(parseFloat(this.recursosMaterialesTableResult.conComprobante.toString()).toFixed(2));
    this.recursosMaterialesTableResult.totalComision = parseFloat(parseFloat(this.recursosMaterialesTableResult.totalComision.toString()).toFixed(2));
    ///////////////////
  }

  //Select Solicitud Viatico Comprobacion
  recursosMaterialesSelect({ selected }): void {
    this.solicitudViaticoComprobacionRMSelected.splice(0, this.solicitudViaticoComprobacionRMSelected.length);    
    //selected=selected.filter(sinPasajesDeSistema=>sinPasajesDeSistema.conceptoViaticoId>3);
    this.solicitudViaticoComprobacionRMSelected.push(...selected);
  }

  //Remove Solicitud Viatico Comprobacion/Pasaje/Cargo
  recursosMaterialesRemove(): void {
    this.solicitudViaticoComprobacionRMSelected.map(comprobacion => {
      const _comprobacion = this.solicitudViaticoComprobacionDetalleFormArray.controls.filter(_comprobacion => _comprobacion.value.esComprobadoPorRM == true).find(_comprobacion => _comprobacion.value == comprobacion) as FormGroup;     
      _comprobacion.controls.estatusId.setValue(ListadoCMM.EstatusRegistro.BORRADO);
      _comprobacion.markAsDirty();

      // Search Solicitud Viatico Comprobacion Detalle Impuesto (Factura Nacional)
      if(_comprobacion.controls.tipoComprobanteId.value == ListadoCMM.TipoComprobante.FACTURA_NACIONAL){
        this.solicitudViaticoComprobacionDetalleImpuestoFormArray.controls.filter((impuesto: FormGroup) => impuesto.controls.solicitudViaticoComprobacionDetalleId.value == _comprobacion.controls.id.value && impuesto.controls.estatusId.value == ListadoCMM.EstatusRegistro.ACTIVO).map((impuesto: FormGroup) => {
          impuesto.controls.estatusId.setValue(ListadoCMM.EstatusRegistro.BORRADO);
          impuesto.markAsDirty();
        });
      }

      // Search Pasaje
      this.solicitudViaticoComprobacionPasaje.filter(pasaje => pasaje.solicitudViaticoComprobacionDetalleId == comprobacion.id).map(pasaje => {
        pasaje.estatusId = ListadoCMM.EstatusRegistro.BORRADO;

        // Search Cargo
        this.solicitudViaticoComprobacionCargo.filter(cargo => cargo.solicitudViaticoComprobacionPasajeId == pasaje.id).map(cargo => {
          cargo.estatusId = ListadoCMM.EstatusRegistro.BORRADO;
        });
      });
    });

    this.solicitudViaticoComprobacionRMSelected = [];

    this.recursosMaterialesCalculatorTotal();
  }

  recursosMaterialesVertifyPermissionRM() {
    if (!this.rolPermisonRM) {
      this._toastr.info("No tienes permisos de Recursos Materiales");
    }
  }

  // Calculator la recomendarcion concepto viatico en la ficha de asignacion
  recursosMaterialesRecomendacionConceptoViatico() {
    var dateOut = moment(this.solicitudViatico.fechaSalida);
    var dateBack = moment(this.solicitudViatico.fechaRegreso);
    let pernoctaCon: number = dateBack.diff(dateOut, 'days');
    let pernoctaSin: number = (pernoctaCon + 1) - pernoctaCon;

    if (this.matrizViatico.length > 0) {
      this.matrizViatico.map(matriz => {
        let montoConPernocta = matriz.monto * pernoctaCon,
          montoSinPernocta = matriz.monto * pernoctaSin,
          montoPorTransferir = montoConPernocta + montoSinPernocta;
        let matrizViaticoRecomendacionConceptoViatico = new MatrizViaticoRecomendacionConceptoViatico();
        matrizViaticoRecomendacionConceptoViatico.conceptoViaticoId = matriz.conceptoViaticoId;
        matrizViaticoRecomendacionConceptoViatico.monto = montoPorTransferir;
        this.matrizViaticoRecomendacionConceptoViatico.push(matrizViaticoRecomendacionConceptoViatico);
      });

    }
  }

  // Registrar Comprobante
  registrarComprobante(): boolean {
    // Solicitud Viatico Comprobacion //
    let solicitudViaticoComprobacionDetalle: SolicitudViaticoComprobacionDetalle = new SolicitudViaticoComprobacionDetalle(this.solicitudViaticoComprobacionDetalleForm.getRawValue());
    // ID -> Nuevo
    if (solicitudViaticoComprobacionDetalle.id == null) {
      solicitudViaticoComprobacionDetalle.id = this.idFatherSolicitudViaticoComprobacionDetalle;
      solicitudViaticoComprobacionDetalle.categoria = this.categoriaViatico.find(categoria => categoria.id == solicitudViaticoComprobacionDetalle.categoriaId);

      if (solicitudViaticoComprobacionDetalle.categoriaId != ListadoCMM.CategoriaViatico.REINTEGRO) {
        if (solicitudViaticoComprobacionDetalle.categoria.id == ListadoCMM.CategoriaViatico.VIATICO) {
          solicitudViaticoComprobacionDetalle.conceptoViatico = this.conceptoViatico.find(concepto => concepto.id == solicitudViaticoComprobacionDetalle.conceptoViaticoId);
        }

        if (solicitudViaticoComprobacionDetalle.categoria.id == ListadoCMM.CategoriaViatico.PASAJE || ListadoCMM.CategoriaViatico.CARGO_SERVICIO) {
          solicitudViaticoComprobacionDetalle.conceptoViatico = this.conceptoViatico.find(concepto => concepto.id == solicitudViaticoComprobacionDetalle.conceptoViaticoId);
        }

        solicitudViaticoComprobacionDetalle.formaPago = this.formaPago.find(pago => pago.id == solicitudViaticoComprobacionDetalle.formaPagoId);
        solicitudViaticoComprobacionDetalle.tipoComprobante = this.tipoComprobante.find(tipo => tipo.id == solicitudViaticoComprobacionDetalle.tipoComprobanteId);
        // Forma Comprobacion
        if(!!solicitudViaticoComprobacionDetalle.formaComprobacionId){
          solicitudViaticoComprobacionDetalle.formaComprobacion = this.formaComprobacion.find(fc => fc.id == solicitudViaticoComprobacionDetalle.formaComprobacionId);
        }

        // Archivo
        // Archivo XML
        if (this.archivoTipoComprobante.nombreArchivoTemporal != '') {
          this.archivoTipoComprobante.referenciaId = solicitudViaticoComprobacionDetalle.id;
          this.archivoTipoComprobanteFormArray.push(this._formBuilder.group(this.archivoTipoComprobante));
          this.archivoTipoComprobanteFormArray.at(this.archivoTipoComprobanteFormArray.length - 1).markAsDirty();
        }
      }

      // Archvivo Other
      if (this.archivoTipoComprobanteOther.nombreArchivoTemporal != '') {
        this.archivoTipoComprobanteOther.referenciaId = solicitudViaticoComprobacionDetalle.id;
        this.archivoTipoComprobanteFormArray.push(this._formBuilder.group(this.archivoTipoComprobanteOther));
        this.archivoTipoComprobanteFormArray.at(this.archivoTipoComprobanteFormArray.length - 1).markAsDirty();
      }

      // Es Comprobado Por RM
      solicitudViaticoComprobacionDetalle.esComprobadoPorRM = this.solicitudViaticoComprobacionDetalleForm.controls.esComprobadoPorRM.value;
      
      // Tipo Comprobante Factura Nacional
      if (solicitudViaticoComprobacionDetalle.tipoComprobanteId == ListadoCMM.TipoComprobante.FACTURA_NACIONAL) {
        // Solicitud Viatico Comprobacion Detalle Impuesto
        const esFacturaCompleto: boolean = solicitudViaticoComprobacionDetalle.formaComprobacionId == ListadoCMM.FormaComprobacion.FACTURA_COMPLETA ? true: false;
        this.facturaConceptosList.filter((facturaConcepto: FacturaConcepto) => {
          // Forma Comprobacion -> Factura Completa o Por Detalles
          if(solicitudViaticoComprobacionDetalle.formaComprobacionId == ListadoCMM.FormaComprobacion.FACTURA_COMPLETA){
            return facturaConcepto;
          }else{
            return facturaConcepto.id == solicitudViaticoComprobacionDetalle.numeroPartida;
          }
        }).map((facturaConcepto: FacturaConcepto) => {
          if(esFacturaCompleto){
            // Factura Completa
            // Concepto Impuestos
            if(facturaConcepto.impuestos){
              // Retenciones
              if(facturaConcepto.impuestos['cfdi:Retenciones']){
                facturaConcepto.impuestos['cfdi:Retenciones'][0]['cfdi:Retencion'].map(retencion => {
                  this.agregarRetencion(retencion, solicitudViaticoComprobacionDetalle);
                });
              }
              // Traslados
              if(facturaConcepto.impuestos['cfdi:Traslados']){
                facturaConcepto.impuestos['cfdi:Traslados'][0]['cfdi:Traslado'].map(traslado => {
                  this.agregarTraslado(traslado, solicitudViaticoComprobacionDetalle);
                });
              }
            }

            // Impuestos Locale
            if(facturaConcepto.impuestosLocale){
              // Traslados Locales
              if(facturaConcepto.impuestosLocale['implocal:TrasladosLocales']){
                facturaConcepto.impuestosLocale['implocal:TrasladosLocales'].map((tl: TrasladosLocale) => {
                  this.agregarTrasladoLocale(tl, solicitudViaticoComprobacionDetalle);
                });
              }
              // Retenciones Locales
              if(facturaConcepto.impuestosLocale['implocal:RetencionesLocales']){
                facturaConcepto.impuestosLocale['implocal:RetencionesLocales'].map((rl: RetencionesLocale) => {
                  this.agregarRetencionLocale(rl, solicitudViaticoComprobacionDetalle);
                });
              }
            }
          }else{
            // Por Detalles
            const facturaConceptoDetalle: FacturaConceptoDetalle = this.facturaConceptoDetalle(esFacturaCompleto, solicitudViaticoComprobacionDetalle.importePesos, facturaConcepto);
            // Sub Total Comprobacion
            solicitudViaticoComprobacionDetalle.subTotalComprobacion = facturaConceptoDetalle.subTotalComprobacion;
            // Concepto Impuestos
            // Traslados
            if(facturaConcepto.concepto['cfdi:Impuestos'][0]['cfdi:Traslados']){
              facturaConcepto.concepto['cfdi:Impuestos'][0]['cfdi:Traslados'][0]['cfdi:Traslado'].map((traslado: CfdiTraslado) => {
                this.agregarTraslado(traslado, solicitudViaticoComprobacionDetalle, facturaConcepto, facturaConceptoDetalle);
              });
            }
            // Retenciones
            if(facturaConcepto.concepto['cfdi:Impuestos'][0]['cfdi:Retenciones']){
              facturaConcepto.concepto['cfdi:Impuestos'][0]['cfdi:Retenciones'][0]['cfdi:Retencion'].map((retencion: CfdiRetencion) => {
                this.agregarRetencion(retencion, solicitudViaticoComprobacionDetalle, facturaConcepto, facturaConceptoDetalle);                
              });
            }

            // Impuestos Locale
            if(facturaConcepto.impuestosLocale){
              // Traslados Locales
              if(facturaConcepto.impuestosLocale['implocal:TrasladosLocales']){
                facturaConcepto.impuestosLocale['implocal:TrasladosLocales'].map((tl: TrasladosLocale) => {
                  this.agregarTrasladoLocale(tl, solicitudViaticoComprobacionDetalle, facturaConcepto, facturaConceptoDetalle);
                });
              }
              // Retenciones Locales
              if(facturaConcepto.impuestosLocale['implocal:RetencionesLocales']){
                facturaConcepto.impuestosLocale['implocal:RetencionesLocales'].map((rl: RetencionesLocale) => {
                  this.agregarRetencionLocale(rl, solicitudViaticoComprobacionDetalle, facturaConcepto, facturaConceptoDetalle);
                });
              }
            }
          }
        });
      }    
      
      // Agregar los datos de Solicitud Viatico Comprobacion Detalle a Array
      this.solicitudViaticoComprobacionDetalleFormArray.push(this._formBuilder.group(solicitudViaticoComprobacionDetalle));
      this.solicitudViaticoComprobacionDetalleFormArray.at(this.solicitudViaticoComprobacionDetalleFormArray.length - 1).markAsDirty();
      this.idFatherSolicitudViaticoComprobacionDetalle--;

    } else {
      // ID -> Editar
      this.solicitudViaticoComprobacionDetalleFormArray.controls.filter(comprobacion => comprobacion.value.id == solicitudViaticoComprobacionDetalle.id && comprobacion.value.estatusId == ListadoCMM.EstatusRegistro.ACTIVO).map((comprobacion: FormGroup) => {
        if (solicitudViaticoComprobacionDetalle.categoriaId != ListadoCMM.CategoriaViatico.REINTEGRO) {

          // Tipo Comprobante Factura Nacional
          if (solicitudViaticoComprobacionDetalle.tipoComprobanteId != ListadoCMM.TipoComprobante.FACTURA_NACIONAL) {
            solicitudViaticoComprobacionDetalle.totalFactura = null;
            solicitudViaticoComprobacionDetalle.subTotalComprobacion = null;
            solicitudViaticoComprobacionDetalle.descuentoFactura = null;
            solicitudViaticoComprobacionDetalle.numeroPartida = null;
            solicitudViaticoComprobacionDetalle.conceptoDescripcion = '';
            solicitudViaticoComprobacionDetalle.claveProdServ = '';
            solicitudViaticoComprobacionDetalle.conceptoImporte = null;
            solicitudViaticoComprobacionDetalle.conceptoDescuento = null;
            solicitudViaticoComprobacionDetalle.subTotalComprobacion = null;
            solicitudViaticoComprobacionDetalle.descuentoComprobacion = null;
            solicitudViaticoComprobacionDetalle.formaComprobacionId = null;
            solicitudViaticoComprobacionDetalle.uuid = '';

            // Solicitud Viatico Comprobacion Detalle Impuesto
            this.solicitudViaticoComprobacionDetalleImpuestoFormArray.controls.filter((impuesto: FormGroup) => impuesto.controls.solicitudViaticoComprobacionDetalleId.value == comprobacion.controls.id.value && impuesto.controls.estatusId.value == ListadoCMM.EstatusRegistro.ACTIVO).map((impuesto: FormGroup) => {
              impuesto.controls.estatusId.setValue(ListadoCMM.EstatusRegistro.BORRADO);
              impuesto.markAsDirty();
            });
            
          }else{
            // Tipo Comprobante Factura Nacional
            if (solicitudViaticoComprobacionDetalle.tipoComprobanteId == ListadoCMM.TipoComprobante.FACTURA_NACIONAL) {
              // Solicitud Viatico Comprobacion Detalle Impuesto
              this.solicitudViaticoComprobacionDetalleImpuestoFormArray.controls.filter((impuesto: FormGroup) => impuesto.controls.solicitudViaticoComprobacionDetalleId.value == comprobacion.controls.id.value && impuesto.controls.estatusId.value == ListadoCMM.EstatusRegistro.ACTIVO).map((impuesto: FormGroup) => {
                impuesto.controls.estatusId.setValue(ListadoCMM.EstatusRegistro.BORRADO);
                impuesto.markAsDirty();
              });

              // Solicitud Viatico Comprobacion Detalle Impuesto
              const esFacturaCompleto: boolean = solicitudViaticoComprobacionDetalle.formaComprobacionId == ListadoCMM.FormaComprobacion.FACTURA_COMPLETA ? true: false;
              this.facturaConceptosList.filter((facturaConcepto: FacturaConcepto) => {
                // Forma Comprobacion -> Factura Completa o Por Detalles
                if(solicitudViaticoComprobacionDetalle.formaComprobacionId == ListadoCMM.FormaComprobacion.FACTURA_COMPLETA){
                  return facturaConcepto;
                }else{
                  return facturaConcepto.id == solicitudViaticoComprobacionDetalle.numeroPartida;
                }
              }).map((facturaConcepto: FacturaConcepto) => {
                if(esFacturaCompleto){
                  // Factura Completa
                  // Concepto Impuestos
                  if(facturaConcepto.impuestos){
                    // Retenciones
                    if(facturaConcepto.impuestos['cfdi:Retenciones']){
                      facturaConcepto.impuestos['cfdi:Retenciones'][0]['cfdi:Retencion'].map(retencion => {
                        this.agregarRetencion(retencion, solicitudViaticoComprobacionDetalle);
                      });
                    }
                    // Traslados
                    if(facturaConcepto.impuestos['cfdi:Traslados']){
                      facturaConcepto.impuestos['cfdi:Traslados'][0]['cfdi:Traslado'].map(traslado => {
                        this.agregarTraslado(traslado, solicitudViaticoComprobacionDetalle);
                      });
                    }
                  }

                  // Impuestos Locale
                  if(facturaConcepto.impuestosLocale){
                    // Traslados Locales
                    if(facturaConcepto.impuestosLocale['implocal:TrasladosLocales']){
                      facturaConcepto.impuestosLocale['implocal:TrasladosLocales'].map((tl: TrasladosLocale) => {
                        this.agregarTrasladoLocale(tl, solicitudViaticoComprobacionDetalle);
                      });
                    }
                    // Retenciones Locales
                    if(facturaConcepto.impuestosLocale['implocal:RetencionesLocales']){
                      facturaConcepto.impuestosLocale['implocal:RetencionesLocales'].map((rl: RetencionesLocale) => {
                        this.agregarRetencionLocale(rl, solicitudViaticoComprobacionDetalle);
                      });
                    }
                  }
                }else{
                  // Por Detalles
                  const facturaConceptoDetalle: FacturaConceptoDetalle = this.facturaConceptoDetalle(esFacturaCompleto, solicitudViaticoComprobacionDetalle.importePesos, facturaConcepto);
                  // Sub Total Comprobacion
                  solicitudViaticoComprobacionDetalle.subTotalComprobacion = facturaConceptoDetalle.subTotalComprobacion;
                  // Concepto Impuestos
                  // Traslados
                  if(facturaConcepto.concepto['cfdi:Impuestos'][0]['cfdi:Traslados']){
                    facturaConcepto.concepto['cfdi:Impuestos'][0]['cfdi:Traslados'][0]['cfdi:Traslado'].map((traslado: CfdiTraslado) => {
                      this.agregarTraslado(traslado, solicitudViaticoComprobacionDetalle, facturaConcepto, facturaConceptoDetalle);
                    });
                  }
                  // Retenciones
                  if(facturaConcepto.concepto['cfdi:Impuestos'][0]['cfdi:Retenciones']){
                    facturaConcepto.concepto['cfdi:Impuestos'][0]['cfdi:Retenciones'][0]['cfdi:Retencion'].map((retencion: CfdiRetencion) => {
                      this.agregarRetencion(retencion, solicitudViaticoComprobacionDetalle, facturaConcepto, facturaConceptoDetalle);
                    });
                  }

                  // Impuestos Locale
                  if(facturaConcepto.impuestosLocale){
                    // Traslados Locales
                    if(facturaConcepto.impuestosLocale['implocal:TrasladosLocales']){
                      facturaConcepto.impuestosLocale['implocal:TrasladosLocales'].map((tl: TrasladosLocale) => {
                        this.agregarTrasladoLocale(tl, solicitudViaticoComprobacionDetalle, facturaConcepto, facturaConceptoDetalle);
                      });
                    }
                    // Retenciones Locales
                    if(facturaConcepto.impuestosLocale['implocal:RetencionesLocales']){
                      facturaConcepto.impuestosLocale['implocal:RetencionesLocales'].map((rl: RetencionesLocale) => {
                        this.agregarRetencionLocale(rl, solicitudViaticoComprobacionDetalle, facturaConcepto, facturaConceptoDetalle);
                      });
                    }
                  }
                }
              });

              // Archivo
              // Archivo XML
              if (this.archivoTipoComprobante.nombreArchivoTemporal != '') {
                const archivoTipoComprobante =  this.archivoTipoComprobanteFormArray.controls.find((_file: FormGroup) => _file.controls.referenciaId.value == comprobacion.controls.id.value && _file.controls.tipoArchivoId.value == ListadoCMM.Archivo.XML && _file.controls.vigente.value == true) as FormGroup;
                if(archivoTipoComprobante && archivoTipoComprobante.controls.nombreArchivoTemporal.value != this.archivoTipoComprobante.nombreArchivoTemporal){
                  if (archivoTipoComprobante.controls.id.value != '') {
                    archivoTipoComprobante.controls.vigente.setValue(false);
                    archivoTipoComprobante.markAsDirty();
                  } else {
                    this.archivoTipoComprobanteFormArray.removeAt(this.archivoTipoComprobanteFormArray.controls.findIndex((__file: FormGroup) => __file.controls == archivoTipoComprobante.controls));
                  }

                  // Add file new
                  this.archivoTipoComprobante.referenciaId = solicitudViaticoComprobacionDetalle.id;
                  this.archivoTipoComprobanteFormArray.push(this._formBuilder.group(this.archivoTipoComprobante));
                  this.archivoTipoComprobanteFormArray.at(this.archivoTipoComprobanteFormArray.length - 1).markAsDirty();
                }else{
                  // Primero verificar si el archivo ya existe para que no agregar el registro de archivo
                  if(!this.archivoTipoComprobanteFormArray.controls.some(_file => _file.value == archivoTipoComprobante.value)){
                    // Agregar archivo nuevo
                    this.archivoTipoComprobante.referenciaId = solicitudViaticoComprobacionDetalle.id;
                    this.archivoTipoComprobanteFormArray.push(this._formBuilder.group(this.archivoTipoComprobante));
                    this.archivoTipoComprobanteFormArray.at(this.archivoTipoComprobanteFormArray.length - 1).markAsDirty();
                  }
                }
              }
            }
          }

          comprobacion.controls.categoriaId.setValue(solicitudViaticoComprobacionDetalle.categoriaId);
          comprobacion.controls.categoria.setValue(this.categoriaViatico.find(categoria => categoria.id == solicitudViaticoComprobacionDetalle.categoriaId));
          comprobacion.controls.conceptoViaticoId.setValue(solicitudViaticoComprobacionDetalle.conceptoViaticoId);
          comprobacion.controls.conceptoViatico.setValue(this.conceptoViatico.find(concepto => concepto.id == solicitudViaticoComprobacionDetalle.conceptoViaticoId));
          comprobacion.controls.tipoComprobanteId.setValue(solicitudViaticoComprobacionDetalle.tipoComprobanteId);
          comprobacion.controls.tipoComprobante.setValue(this.tipoComprobante.find(tipo => tipo.id == solicitudViaticoComprobacionDetalle.tipoComprobanteId));
          comprobacion.controls.rfc.setValue(solicitudViaticoComprobacionDetalle.rfc);
          comprobacion.controls.razonSocial.setValue(solicitudViaticoComprobacionDetalle.razonSocial);
          comprobacion.controls.proveedorId.setValue(solicitudViaticoComprobacionDetalle.proveedorId);
          comprobacion.controls.proveedorPaisId.setValue(solicitudViaticoComprobacionDetalle.proveedorPaisId);
          comprobacion.controls.fechaComprobante.setValue(solicitudViaticoComprobacionDetalle.fechaComprobante);
          comprobacion.controls.folio.setValue(solicitudViaticoComprobacionDetalle.folio);
          comprobacion.controls.formaPagoId.setValue(solicitudViaticoComprobacionDetalle.formaPagoId);
          comprobacion.controls.formaPago.setValue(this.formaPago.find(pago => pago.id == solicitudViaticoComprobacionDetalle.formaPagoId));
          comprobacion.controls.monedaId.setValue(solicitudViaticoComprobacionDetalle.monedaId);
          comprobacion.controls.tipoCambio.setValue(solicitudViaticoComprobacionDetalle.tipoCambio);
          comprobacion.controls.importe.setValue(solicitudViaticoComprobacionDetalle.importe);
          comprobacion.controls.comentarios.setValue(solicitudViaticoComprobacionDetalle.comentarios);
          comprobacion.controls.totalFactura.setValue(solicitudViaticoComprobacionDetalle.totalFactura);
          comprobacion.controls.subTotalFactura.setValue(solicitudViaticoComprobacionDetalle.subTotalFactura);
          comprobacion.controls.descuentoFactura.setValue(solicitudViaticoComprobacionDetalle.descuentoFactura);
          comprobacion.controls.numeroPartida.setValue(solicitudViaticoComprobacionDetalle.numeroPartida);
          comprobacion.controls.conceptoDescripcion.setValue(solicitudViaticoComprobacionDetalle.conceptoDescripcion);
          comprobacion.controls.claveProdServ.setValue(solicitudViaticoComprobacionDetalle.claveProdServ);
          comprobacion.controls.conceptoImporte.setValue(solicitudViaticoComprobacionDetalle.conceptoImporte);
          comprobacion.controls.conceptoDescuento.setValue(solicitudViaticoComprobacionDetalle.conceptoDescuento);
          comprobacion.controls.subTotalComprobacion.setValue(solicitudViaticoComprobacionDetalle.subTotalComprobacion);
          comprobacion.controls.descuentoComprobacion.setValue(solicitudViaticoComprobacionDetalle.descuentoComprobacion);
          comprobacion.controls.cuentaPagoGastoId.setValue(solicitudViaticoComprobacionDetalle.cuentaPagoGastoId);
          comprobacion.controls.formaComprobacionId.setValue(solicitudViaticoComprobacionDetalle.formaComprobacionId);
          comprobacion.controls.formaComprobacion.setValue(this.formaComprobacion.find(fc => fc.id == solicitudViaticoComprobacionDetalle.formaComprobacionId));
          
          comprobacion.controls.uuid.setValue(solicitudViaticoComprobacionDetalle.uuid);
          
          // Concepto Viatico Pasaje
          comprobacion.controls.conceptoViaticoId.setValue(solicitudViaticoComprobacionDetalle.conceptoViaticoId);
          comprobacion.controls.conceptoViatico.setValue(this.conceptoViatico.find(concepto => concepto.id == solicitudViaticoComprobacionDetalle.conceptoViaticoId));
          comprobacion.markAsDirty();
        }

        // Set Importe en Pesos (Viatico, Pasaje, Cargo, Reintegro)
        comprobacion.controls.importePesos.setValue(solicitudViaticoComprobacionDetalle.importePesos);
        comprobacion.markAsDirty();

        // Archivo otro
        if (this.archivoTipoComprobanteOther.nombreArchivoTemporal != '') {
          const archivoTipoComprobanteOther =  this.archivoTipoComprobanteFormArray.controls.find((_file: FormGroup) => _file.controls.referenciaId.value == comprobacion.controls.id.value && _file.controls.tipoArchivoId.value != ListadoCMM.Archivo.XML && _file.controls.vigente.value == true) as FormGroup;
          if(archivoTipoComprobanteOther && archivoTipoComprobanteOther.controls.nombreArchivoTemporal.value != this.archivoTipoComprobanteOther.nombreArchivoTemporal){
            if (archivoTipoComprobanteOther.controls.id.value != '') {
              archivoTipoComprobanteOther.controls.vigente.setValue(false);
              archivoTipoComprobanteOther.markAsDirty();
            } else {
              this.archivoTipoComprobanteFormArray.removeAt(this.archivoTipoComprobanteFormArray.controls.findIndex((__file: FormGroup) => __file.controls == archivoTipoComprobanteOther.controls));
            }
            // Agregar archivo nuevo
            this.archivoTipoComprobanteOther.referenciaId = solicitudViaticoComprobacionDetalle.id;
            this.archivoTipoComprobanteFormArray.push(this._formBuilder.group(this.archivoTipoComprobanteOther));
            this.archivoTipoComprobanteFormArray.at(this.archivoTipoComprobanteFormArray.length - 1).markAsDirty();
          }else{
            // Primero verificar si el archivo ya existe para que no agregar el registro de archivo
            if(!this.archivoTipoComprobanteFormArray.controls.some(_file => _file.value == archivoTipoComprobanteOther.value)){
              // Agregar archivo nuevo
              this.archivoTipoComprobanteOther.referenciaId = solicitudViaticoComprobacionDetalle.id;
              this.archivoTipoComprobanteFormArray.push(this._formBuilder.group(this.archivoTipoComprobanteOther));
              this.archivoTipoComprobanteFormArray.at(this.archivoTipoComprobanteFormArray.length - 1).markAsDirty();
            }
          }
        }
      });
    }

    // Solicitud Viatico Comprobacion Pasaje //
    if (solicitudViaticoComprobacionDetalle.categoriaId == ListadoCMM.CategoriaViatico.PASAJE || solicitudViaticoComprobacionDetalle.categoriaId == ListadoCMM.CategoriaViatico.CARGO_SERVICIO) {
      let solicitudViaticoComprobacionPasaje: SolicitudViaticoComprobacionPasaje = new SolicitudViaticoComprobacionPasaje(this.solicitudViaticoComprobacionPasajeForm.getRawValue());
      if (solicitudViaticoComprobacionPasaje.id == null) {
        solicitudViaticoComprobacionPasaje.id = this.idFatherSolicitudViaticoComprobacionPasaje;

        // ID Solicitud Viatico Comprobacion
        solicitudViaticoComprobacionPasaje.solicitudViaticoComprobacionDetalleId = solicitudViaticoComprobacionDetalle.id;

        this.solicitudViaticoComprobacionPasajeFormArray.push(this._formBuilder.group(solicitudViaticoComprobacionPasaje));
        this.solicitudViaticoComprobacionPasajeFormArray.at(this.solicitudViaticoComprobacionPasajeFormArray.length - 1).markAsDirty();
        this.idFatherSolicitudViaticoComprobacionPasaje--;
      } else {
        this.solicitudViaticoComprobacionPasajeFormArray.controls.filter(pasaje => pasaje.value.id == solicitudViaticoComprobacionPasaje.id && pasaje.value.estatusId == ListadoCMM.EstatusRegistro.ACTIVO).map((pasaje: FormGroup) => {
          pasaje.controls.fechaCompra.setValue(solicitudViaticoComprobacionPasaje.fechaCompra);
          pasaje.controls.nombreLinea.setValue(solicitudViaticoComprobacionPasaje.nombreLinea);
          pasaje.controls.viajeRedondo.setValue(solicitudViaticoComprobacionPasaje.viajeRedondo);
          pasaje.controls.fechaSalida.setValue(solicitudViaticoComprobacionPasaje.fechaSalida);
          pasaje.controls.fechaRegreso.setValue(solicitudViaticoComprobacionPasaje.fechaRegreso);
          pasaje.controls.numeroBoletoIda.setValue(solicitudViaticoComprobacionPasaje.numeroBoletoIda);
          pasaje.controls.numeroBoletoRegreso.setValue(solicitudViaticoComprobacionPasaje.numeroBoletoRegreso);
          pasaje.controls.boletoUtilizadoIda.setValue(solicitudViaticoComprobacionPasaje.boletoUtilizadoIda);
          pasaje.controls.boletoUtilizadoRegreso.setValue(solicitudViaticoComprobacionPasaje.boletoUtilizadoRegreso);
          pasaje.controls.codigoReservacion.setValue(solicitudViaticoComprobacionPasaje.codigoReservacion);
          pasaje.controls.comentarios.setValue(solicitudViaticoComprobacionPasaje.comentarios);
          pasaje.markAsDirty();
        });
      }

      // Solicitud Viatico Comprobacion Cargo
      if (solicitudViaticoComprobacionDetalle.categoriaId == ListadoCMM.CategoriaViatico.CARGO_SERVICIO) {
        let solicitudViaticoComprobacionCargo: SolicitudViaticoComprobacionCargo = new SolicitudViaticoComprobacionCargo(this.solicitudViaticoComprobacionCargoForm.getRawValue());
        if (solicitudViaticoComprobacionCargo.id == null) {
          solicitudViaticoComprobacionCargo.solicitudViaticoComprobacionPasajeId = solicitudViaticoComprobacionPasaje.id;
          this.solicitudViaticoComprobacionCargoFormArray.push(this._formBuilder.group(solicitudViaticoComprobacionCargo));
          this.solicitudViaticoComprobacionCargoFormArray.at(this.solicitudViaticoComprobacionCargoFormArray.length - 1).markAsDirty();
        } else {
          this.solicitudViaticoComprobacionCargoFormArray.controls.filter(cargo => cargo.value.solicitudViaticoComprobacionPasajeId == solicitudViaticoComprobacionCargo.solicitudViaticoComprobacionPasajeId && cargo.value.estatusId == ListadoCMM.EstatusRegistro.ACTIVO).map((cargo: FormGroup) => {
            cargo.controls.fechaCargoSalida.setValue(solicitudViaticoComprobacionCargo.fechaCargoSalida);
            cargo.controls.fechaCargoRegreso.setValue(solicitudViaticoComprobacionCargo.fechaCargoRegreso);
            cargo.controls.montoCargoSalida.setValue(solicitudViaticoComprobacionCargo.montoCargoSalida);
            cargo.controls.montoCargoRegreso.setValue(solicitudViaticoComprobacionCargo.montoCargoRegreso);
            cargo.controls.solicitudCambio.setValue(solicitudViaticoComprobacionCargo.solicitudCambio);
            cargo.markAsDirty();
          });
        }
      }

    }

    // Resumen Calculator Total Modify
    this.resumenCalculatorTotalModify();

    if (solicitudViaticoComprobacionDetalle.esComprobadoPorRM) {
      this.recursosMaterialesCalculatorTotal();
    } else {
      this.comprobacionCalculatorTotalModify();
    }

    return true;
  } 

  // Agregar Traslados
  agregarTraslado(traslado, solicitudViaticoComprobacionDetalle: SolicitudViaticoComprobacionDetalle, facturaConcepto?: FacturaConcepto, facturaConceptoDetalle?: FacturaConceptoDetalle): void{
    const impuestoId: number = ListadoCMM.SwitchTipoImpuesto(traslado.$.Impuesto),
      impuestoImporte: number = traslado.$.Importe ? this.redondeos2decimales(traslado.$.Importe) : 0;

    let solicitudViaticoComprobacionDetalleImpuesto: SolicitudViaticoComprobacionDetalleImpuesto = new SolicitudViaticoComprobacionDetalleImpuesto();
    solicitudViaticoComprobacionDetalleImpuesto.solicitudViaticoComprobacionDetalleId = solicitudViaticoComprobacionDetalle.id;
    solicitudViaticoComprobacionDetalleImpuesto.tipoImpuestoId = ListadoCMM.NodoImpuesto.TRASLADO;
    solicitudViaticoComprobacionDetalleImpuesto.impuestoId = impuestoId;
    solicitudViaticoComprobacionDetalleImpuesto.tasaOCuota = traslado.$.TasaOCuota ? parseFloat(traslado.$.TasaOCuota) : 0;
    solicitudViaticoComprobacionDetalleImpuesto.impuestoImporte = impuestoImporte;

    if(facturaConcepto)
      solicitudViaticoComprobacionDetalleImpuesto.impuestoComprobado = this.redondeos2decimales(facturaConceptoDetalle.esUltimaComprobacion ? this.impuestoEsUltimaComprobacion(facturaConcepto.id, impuestoId, impuestoImporte) : facturaConceptoDetalle.importe * solicitudViaticoComprobacionDetalleImpuesto.tasaOCuota);
    else
      solicitudViaticoComprobacionDetalleImpuesto.impuestoComprobado = impuestoImporte;
    
    // Agregar impuesto a Solicitud Viatico Comprobacion Detalle Impuesto
    this.solicitudViaticoComprobacionDetalleImpuestoFormArray.push(this._formBuilder.group(solicitudViaticoComprobacionDetalleImpuesto));
    this.solicitudViaticoComprobacionDetalleImpuestoFormArray.at(this.solicitudViaticoComprobacionDetalleImpuestoFormArray.length - 1).markAsDirty();
  }

  // Agregar Translados Locales
  agregarTrasladoLocale(tl, solicitudViaticoComprobacionDetalle: SolicitudViaticoComprobacionDetalle, facturaConcepto?: FacturaConcepto, facturaConceptoDetalle?: FacturaConceptoDetalle): void{
    const impuestoId: number = ListadoCMM.SwitchTipoImpuestoImpuestosLocales(tl.$.ImpLocTrasladado),
      impuestoImporte: number = tl.$.Importe ? this.redondeos2decimales(tl.$.Importe) : 0;
    
    let solicitudViaticoComprobacionDetalleImpuesto: SolicitudViaticoComprobacionDetalleImpuesto = new SolicitudViaticoComprobacionDetalleImpuesto();
    solicitudViaticoComprobacionDetalleImpuesto.solicitudViaticoComprobacionDetalleId = solicitudViaticoComprobacionDetalle.id;
    solicitudViaticoComprobacionDetalleImpuesto.tipoImpuestoId = ListadoCMM.NodoImpuesto.TRASLADO;
    solicitudViaticoComprobacionDetalleImpuesto.impuestoId = impuestoId;
    solicitudViaticoComprobacionDetalleImpuesto.impuestoImporte = impuestoImporte;
    solicitudViaticoComprobacionDetalleImpuesto.tasaOCuota = tl.$.TasadeTraslado ? parseFloat(tl.$.TasadeTraslado) / 100 : 0;
    
    if(facturaConcepto)
      solicitudViaticoComprobacionDetalleImpuesto.impuestoComprobado = this.redondeos2decimales(facturaConceptoDetalle.esUltimaComprobacion ? this.impuestoEsUltimaComprobacion(facturaConcepto.id, impuestoId, impuestoImporte) : facturaConceptoDetalle.importe * solicitudViaticoComprobacionDetalleImpuesto.tasaOCuota);
    else
      solicitudViaticoComprobacionDetalleImpuesto.impuestoComprobado = impuestoImporte;

    // Agregar impuesto a Solicitud Viatico Comprobacion Detalle Impuesto
    this.solicitudViaticoComprobacionDetalleImpuestoFormArray.push(this._formBuilder.group(solicitudViaticoComprobacionDetalleImpuesto));
    this.solicitudViaticoComprobacionDetalleImpuestoFormArray.at(this.solicitudViaticoComprobacionDetalleImpuestoFormArray.length - 1).markAsDirty();
  } 

  // Agregar Retenciones
  agregarRetencion(retencion, solicitudViaticoComprobacionDetalle: SolicitudViaticoComprobacionDetalle, facturaConcepto?: FacturaConcepto, facturaConceptoDetalle?: FacturaConceptoDetalle): void{
    const impuestoId: number = ListadoCMM.SwitchTipoImpuesto(retencion.$.Impuesto),
      impuestoImporte: number = retencion.$.Importe ? this.redondeos2decimales(retencion.$.Importe) : 0;
    
    
    let solicitudViaticoComprobacionDetalleImpuesto: SolicitudViaticoComprobacionDetalleImpuesto = new SolicitudViaticoComprobacionDetalleImpuesto();
    solicitudViaticoComprobacionDetalleImpuesto.solicitudViaticoComprobacionDetalleId = solicitudViaticoComprobacionDetalle.id;
    solicitudViaticoComprobacionDetalleImpuesto.tipoImpuestoId = ListadoCMM.NodoImpuesto.RETENCION;
    solicitudViaticoComprobacionDetalleImpuesto.impuestoId = impuestoId;
    solicitudViaticoComprobacionDetalleImpuesto.tasaOCuota = 0;
    solicitudViaticoComprobacionDetalleImpuesto.impuestoImporte = impuestoImporte;
    
    if(facturaConcepto)
      solicitudViaticoComprobacionDetalleImpuesto.impuestoComprobado = this.redondeos2decimales(facturaConceptoDetalle.esUltimaComprobacion ? this.impuestoEsUltimaComprobacion(facturaConcepto.id, impuestoId, impuestoImporte) : facturaConceptoDetalle.importe * solicitudViaticoComprobacionDetalleImpuesto.tasaOCuota);
    else
      solicitudViaticoComprobacionDetalleImpuesto.impuestoComprobado = impuestoImporte;
    
    // Agregar impuesto a Solicitud Viatico Comprobacion Detalle Impuesto
    this.solicitudViaticoComprobacionDetalleImpuestoFormArray.push(this._formBuilder.group(solicitudViaticoComprobacionDetalleImpuesto));
    this.solicitudViaticoComprobacionDetalleImpuestoFormArray.at(this.solicitudViaticoComprobacionDetalleImpuestoFormArray.length - 1).markAsDirty();
  }

  // Agregar Retenciones Locales
  agregarRetencionLocale(rl, solicitudViaticoComprobacionDetalle: SolicitudViaticoComprobacionDetalle, facturaConcepto?: FacturaConcepto, facturaConceptoDetalle?: FacturaConceptoDetalle): void{
    const impuestoId: number = ListadoCMM.SwitchTipoImpuestoImpuestosLocales(rl.$.ImpLocRetenido),
      impuestoImporte: number = rl.$.Importe ? this.redondeos2decimales(rl.$.Importe) : 0;

    let solicitudViaticoComprobacionDetalleImpuesto: SolicitudViaticoComprobacionDetalleImpuesto = new SolicitudViaticoComprobacionDetalleImpuesto();
    solicitudViaticoComprobacionDetalleImpuesto.solicitudViaticoComprobacionDetalleId = solicitudViaticoComprobacionDetalle.id;
    solicitudViaticoComprobacionDetalleImpuesto.tipoImpuestoId = ListadoCMM.NodoImpuesto.RETENCION;
    solicitudViaticoComprobacionDetalleImpuesto.impuestoId = impuestoId;
    solicitudViaticoComprobacionDetalleImpuesto.impuestoImporte = impuestoImporte;
    solicitudViaticoComprobacionDetalleImpuesto.tasaOCuota = rl.$.TasadeRetencion ? parseFloat(rl.$.TasadeRetencion) / 100 : 0;
    
    if(facturaConcepto)
      solicitudViaticoComprobacionDetalleImpuesto.impuestoComprobado = this.redondeos2decimales(facturaConceptoDetalle.esUltimaComprobacion ? this.impuestoEsUltimaComprobacion(facturaConcepto.id, impuestoId, impuestoImporte) : facturaConceptoDetalle.importe * solicitudViaticoComprobacionDetalleImpuesto.tasaOCuota);
    else
      solicitudViaticoComprobacionDetalleImpuesto.impuestoComprobado = impuestoImporte;

    // Agregar impuesto a Solicitud Viatico Comprobacion Detalle Impuesto
    this.solicitudViaticoComprobacionDetalleImpuestoFormArray.push(this._formBuilder.group(solicitudViaticoComprobacionDetalleImpuesto));
    this.solicitudViaticoComprobacionDetalleImpuestoFormArray.at(this.solicitudViaticoComprobacionDetalleImpuestoFormArray.length - 1).markAsDirty();
  }

  // Concepto su importe con original sin impuestos o si es falta de centavos de diferencia.
  facturaConceptoDetalle = (esFacturaCompleto: boolean, importe: number, facturaConcepto: FacturaConcepto): FacturaConceptoDetalle =>{
    let facturaConceptoDetalle: FacturaConceptoDetalle  = {
      importe: esFacturaCompleto ? this.redondeos2decimales(facturaConcepto.importeTotal) : this.redondeos2decimales(importe),
      importeOriginal: esFacturaCompleto ? this.redondeos2decimales(facturaConcepto.importeTotal) : this.redondeos2decimales(importe),
      subTotalComprobacion: 0,
      totalComprobacion: 0,
      esUltimaComprobacion: false,
      totalTasaOCouta: 0,
      totalDescuento: 0,
      ISRTasaOCuota: 0,
      IVATasaOCuota: 0,
      IEPSTasaOCuota: 0,
      ISHTasaOCuota: 0,
      OTROTasaOCuota: 0
    }

    // Descuento
    if(facturaConcepto.concepto.$.Descuento){
      facturaConceptoDetalle.totalDescuento += this.redondeos2decimales(facturaConcepto.concepto.$.Descuento);
    }

    // Impuestos
    if(facturaConcepto.concepto['cfdi:Impuestos']){
     
      // Traslados
      if(facturaConcepto.concepto['cfdi:Impuestos'].filter((impuesto: Impuesto) => impuesto['cfdi:Traslados']).length > 0){
        facturaConcepto.concepto['cfdi:Impuestos'][0]['cfdi:Traslados'][0]['cfdi:Traslado'].map((traslado: CfdiTraslado) =>{
          // ISR
          if(ListadoCMM.SwitchTipoImpuesto(traslado.$.Impuesto) == ListadoCMM.TipoImpuesto.ISR){
            facturaConceptoDetalle.totalTasaOCouta += parseFloat(traslado.$.TasaOCuota);
            facturaConceptoDetalle.ISRTasaOCuota += parseFloat(traslado.$.TasaOCuota);
          }
          // IVA
          if(ListadoCMM.SwitchTipoImpuesto(traslado.$.Impuesto) == ListadoCMM.TipoImpuesto.IVA){
            // Verificar si tiene el campo de importe en traslado (impuestos)
            if(traslado.$.Importe){
              facturaConceptoDetalle.totalTasaOCouta += parseFloat(traslado.$.TasaOCuota);
              facturaConceptoDetalle.IVATasaOCuota += parseFloat(traslado.$.TasaOCuota);
            }
          }
          // IEPS
          if(ListadoCMM.SwitchTipoImpuesto(traslado.$.Impuesto) == ListadoCMM.TipoImpuesto.IEPS){
            facturaConceptoDetalle.totalTasaOCouta += parseFloat(traslado.$.TasaOCuota);
            facturaConceptoDetalle.IEPSTasaOCuota += parseFloat(traslado.$.TasaOCuota);
          }
          // ISH
          if(ListadoCMM.SwitchTipoImpuesto(traslado.$.Impuesto) == ListadoCMM.TipoImpuesto.ISH){
            facturaConceptoDetalle.totalTasaOCouta += parseFloat(traslado.$.TasaOCuota);
            facturaConceptoDetalle.ISHTasaOCuota += parseFloat(traslado.$.TasaOCuota);
          }
        });
      }

      // Retenciones
      if(facturaConcepto.concepto['cfdi:Impuestos'].filter((impuesto: Impuesto) => impuesto['cfdi:Retenciones']).length > 0){
        facturaConcepto.concepto['cfdi:Impuestos'][0]['cfdi:Retenciones'][0]['cfdi:Retencion'].map((retencion: CfdiRetencion) =>{
          // ISR
          if(ListadoCMM.SwitchTipoImpuesto(retencion.$.Impuesto) == ListadoCMM.TipoImpuesto.ISR){
            facturaConceptoDetalle.totalTasaOCouta -= parseFloat(retencion.$.TasaOCuota);
            facturaConceptoDetalle.ISRTasaOCuota -= parseFloat(retencion.$.TasaOCuota);
          }
          // IVA
          if(ListadoCMM.SwitchTipoImpuesto(retencion.$.Impuesto) == ListadoCMM.TipoImpuesto.IVA){
            // Verificar si tiene el campo de importe en traslado (impuestos)
            if(retencion.$.Importe){
              facturaConceptoDetalle.totalTasaOCouta -= parseFloat(retencion.$.TasaOCuota);
              facturaConceptoDetalle.IVATasaOCuota -= parseFloat(retencion.$.TasaOCuota);
            }
          }
          // IEPS
          if(ListadoCMM.SwitchTipoImpuesto(retencion.$.Impuesto) == ListadoCMM.TipoImpuesto.IEPS){
            facturaConceptoDetalle.totalTasaOCouta -= parseFloat(retencion.$.TasaOCuota);
            facturaConceptoDetalle.IEPSTasaOCuota -= parseFloat(retencion.$.TasaOCuota);
          }
          // ISH
          if(ListadoCMM.SwitchTipoImpuesto(retencion.$.Impuesto) == ListadoCMM.TipoImpuesto.ISH){
            facturaConceptoDetalle.totalTasaOCouta -= parseFloat(retencion.$.TasaOCuota);
            facturaConceptoDetalle.ISHTasaOCuota -= parseFloat(retencion.$.TasaOCuota);
          }
        });
      }
    }

    // Impuestos Locale
    if(facturaConcepto.impuestosLocale){
      // Traslados Locales
      if(facturaConcepto.impuestosLocale['implocal:TrasladosLocales']){
        facturaConcepto.impuestosLocale['implocal:TrasladosLocales'].map((tl: TrasladosLocale) => {
          const tasa: number = parseFloat(tl.$.TasadeTraslado) / 100;
          facturaConceptoDetalle.totalTasaOCouta += tasa;
          switch(tl.$.ImpLocTrasladado){
            case ListadoCMM.TipoImpuestoNombre.ISR:
              facturaConceptoDetalle.ISRTasaOCuota += tasa;
              break;
            case ListadoCMM.TipoImpuestoNombre.IVA:
              facturaConceptoDetalle.IVATasaOCuota += tasa;
              break;
            case ListadoCMM.TipoImpuestoNombre.IEPS:
              facturaConceptoDetalle.IEPSTasaOCuota += tasa;
              break;
            case ListadoCMM.TipoImpuestoNombre.ISH:
              facturaConceptoDetalle.ISHTasaOCuota += tasa;
              break;
            default:
              facturaConceptoDetalle.OTROTasaOCuota += tasa;
              break;
          }
        });
      }

      // Retenciones Locales
      if(facturaConcepto.impuestosLocale['implocal:RetencionesLocales']){
        facturaConcepto.impuestosLocale['implocal:RetencionesLocales'].map((rl: RetencionesLocale) => {
          facturaConceptoDetalle.totalTasaOCouta -= (parseFloat(rl.$.TasadeRetencion) / 100);
          const tasa: number = parseFloat(rl.$.TasadeRetencion) / 100;
          facturaConceptoDetalle.totalTasaOCouta += tasa;
          switch(rl.$.ImpLocRetenido){
            case ListadoCMM.TipoImpuestoNombre.ISR:
              facturaConceptoDetalle.ISRTasaOCuota -= tasa;
              break;
            case ListadoCMM.TipoImpuestoNombre.IVA:
              facturaConceptoDetalle.IVATasaOCuota -= tasa;
              break;
            case ListadoCMM.TipoImpuestoNombre.IEPS:
              facturaConceptoDetalle.IEPSTasaOCuota -= tasa;
              break;
            case ListadoCMM.TipoImpuestoNombre.ISH:
              facturaConceptoDetalle.ISHTasaOCuota -= tasa;
              break;
            default:
              facturaConceptoDetalle.OTROTasaOCuota -= tasa;
              break;
          }
        });
      }
    }

    facturaConceptoDetalle.importe = this.redondeos2decimales((facturaConceptoDetalle.importe / (1+facturaConceptoDetalle.totalTasaOCouta)) - facturaConceptoDetalle.totalDescuento);

    // Forma Comprobacion -> Por Detalles
    if(!esFacturaCompleto){
      // Verificar hay centavos diferencia
      let importeTodo = this.redondeos2decimales(facturaConceptoDetalle.importe + this.redondeos2decimales(facturaConceptoDetalle.importe * facturaConceptoDetalle.ISRTasaOCuota) + this.redondeos2decimales(facturaConceptoDetalle.importe * facturaConceptoDetalle.IVATasaOCuota) + this.redondeos2decimales(facturaConceptoDetalle.importe * facturaConceptoDetalle.IEPSTasaOCuota) + this.redondeos2decimales(facturaConceptoDetalle.importe * facturaConceptoDetalle.ISHTasaOCuota) + this.redondeos2decimales(facturaConceptoDetalle.importe * facturaConceptoDetalle.OTROTasaOCuota)),
      centavosDiferencia: number = 0;
      if(facturaConceptoDetalle.importeOriginal != importeTodo){
        centavosDiferencia = this.redondeos2decimales(facturaConceptoDetalle.importeOriginal - importeTodo);
      }
      facturaConceptoDetalle.subTotalComprobacion = this.redondeos2decimales(facturaConceptoDetalle.importe + centavosDiferencia);

      // Verificar si importe compartida es mayor que concepto importe en factura.
      let conceptoImporteCompartida: number = facturaConceptoDetalle.importe;
      this.facturaCompartida.filter(compartida => compartida.numeroPartida == facturaConcepto.id).map(compartida => {
        conceptoImporteCompartida += this.redondeos2decimales(compartida.subTotalComprobacion);
      });
      const facturaConceptoImporte: number = this.redondeos2decimales(facturaConcepto.concepto.$.Importe);
      if(conceptoImporteCompartida >= facturaConceptoImporte){
        facturaConceptoDetalle.esUltimaComprobacion = true;
        facturaConceptoDetalle.subTotalComprobacion = facturaConceptoImporte - (conceptoImporteCompartida - facturaConceptoDetalle.importe);
      }
    }

    return facturaConceptoDetalle;
  }

  impuestoEsUltimaComprobacion(facturaConceptoId: number, impuestoId: number, impuestoImporte:number) {
    let impuestoComprobado: number = impuestoImporte;
    this.facturaCompartida.filter(compartida => compartida.numeroPartida == facturaConceptoId).map(compartida => {
      this.solicitudViaticoComprobacionDetalleImpuestoFormArray.controls.filter((impuesto: FormGroup) => impuesto.controls.estatusId.value == ListadoCMM.EstatusRegistro.ACTIVO && impuesto.controls.solicitudViaticoComprobacionDetalleId.value == compartida.id && impuesto.controls.impuestoId.value == impuestoId).map((impuesto: FormGroup) => {
        impuestoComprobado -= this.redondeos2decimales(impuesto.controls.impuestoComprobado.value);
      });

      this.facturaImpuestoCompartida.filter(impuestoCompartida => impuestoCompartida.solicitudViaticoComprobacionDetalleId == compartida.id && impuestoCompartida.impuestoId == impuestoId).map(impuestoCompartida => {
        if(!this.solicitudViaticoComprobacionDetalleImpuestoFormArray.controls.some((impuesto: FormGroup) => impuesto.controls.estatusId.value == ListadoCMM.EstatusRegistro.ACTIVO && impuesto.controls.solicitudViaticoComprobacionDetalleId.value == impuestoCompartida.solicitudViaticoComprobacionDetalleId && impuesto.controls.impuestoId.value == impuestoId))
          impuestoComprobado -= this.redondeos2decimales(impuestoCompartida.impuestoComprobado);
      });
    });
    return this.redondeos2decimales(impuestoComprobado);
  }

  // Other, Event, Click, Etc...
  cleanFiles() {
    jQuery(".fileinput").fileinput("clear");
    
    this.archivoTipoComprobante = new ArchivoTipoComporbante();
    this.archivoTipoComprobanteOther = new ArchivoTipoComporbante();
  }
  
  // Metodo file with XML
  onFileXML(event) {
    // Mostrar spinner
    this._spinner.show();
    jQuery('.modal').addClass("pixvs-spinner-modal");

    this.archivoTipoComprobante = new ArchivoTipoComporbante();

    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      let file: File = fileList[0];
      //let extension = file.name.substr(file.name.indexOf('.'));
      let extension = file.name.split('.').pop().toLowerCase();

      if (environment.extensionXML.indexOf(extension) == -1) {
        jQuery("#removeFileXML").click();
        this._toastr.error('Debe seleccionar un archivo XML');

        // Oculto spinner
        this._spinner.hide();
        jQuery('.modal').removeClass("pixvs-spinner-modal");

        const archivoTipoComprobante =  this.archivoTipoComprobanteFormArray.controls.find((_file: FormGroup) => _file.controls.referenciaId.value == this.solicitudViaticoComprobacionDetalleForm.controls.id.value && _file.controls.tipoArchivoId.value == ListadoCMM.Archivo.XML && _file.controls.vigente.value == true) as FormGroup;
        if(archivoTipoComprobante){
          this.esVisibleArchivo = false;
          this.archivoTipoComprobante = archivoTipoComprobante.value;
          this.solicitudViaticoComprobacionDetalleForm.controls.fileXML.setValue(archivoTipoComprobante.value);
          this.solicitudViaticoComprobacionDetalleForm.controls.fileXML.clearValidators();
          this.solicitudViaticoComprobacionDetalleForm.controls.fileXML.updateValueAndValidity();

          setTimeout(() => {
            this.esVisibleArchivo = true;
          }, 0);
        }else{
          this.limpiaArchivoCampos();
        }

        jQuery("#fileinputXML").fileinput("clear");
        
        return;
      }

      // Read file XML
      const reader = new FileReader();
      reader.onload = (evt) => {
        const xmlData: string = (evt as any).target.result;
        this.parseXML(xmlData, file);
      };
      reader.readAsText(file);
    } else {
      this.cleanFileXML();

      this.solicitudViaticoComprobacionDetalleForm.controls.fileXML.setValue(null);

      // Oculto spinner
      this._spinner.hide();
      jQuery('.modal').removeClass("pixvs-spinner-modal");
    }
  }

  // File XML Modo Edit
  onFileXMLModoEdit(blob: Blob) {
    const reader = new FileReader();
      reader.onload = (evt) => {
        const xmlData: string = (evt as any).target.result;
        this.parseXMLModoEditar(xmlData);
      };
      reader.readAsText(blob);
 }

  // Parse XML
  parseXML(data, file) {
    return new Promise(resolve => {
      var parser = new xml2js.Parser({
          trim: true,
          explicitArray: true
        });
      parser.parseString(data, function (err, result) {
        const facturaXML: FacturaXMLModel = result;
        resolve(facturaXML);
      });
    }).then((facturaXML: FacturaXMLModel) => {

      // Las Validaciones //
      // Verificar la factura version 3.3 en adelante
      if(!(parseFloat(facturaXML['cfdi:Comprobante'].$.Version) >= 3.3)){
        // Mostramos error 
        this._toastr.error("La versión de Factura debe ser 3.3 en adelante.");

        this.cleanFileXML();

        this.solicitudViaticoComprobacionDetalleForm.controls.fileXML.setValue(null);

        //Ocultamos el spinner
        this._spinner.hide();
        jQuery('.modal').removeClass("pixvs-spinner-modal");

        return false;
      }
      // Verificar la factura fecha despues de inicio de viaje / RM es libre.
      if(!this.solicitudViaticoComprobacionDetalleForm.controls.esComprobadoPorRM.value){
        var dateStartViaje = new Date(facturaXML['cfdi:Comprobante'].$.Fecha);
        
        // Verificar fecha es null
        if(isNaN(dateStartViaje.getTime())){
          //Mostramos error 
          this._toastr.error("La fecha de factura es incorrecto, sube una factura nueva.");

          this.cleanFileXML();

          this.solicitudViaticoComprobacionDetalleForm.controls.fileXML.setValue(null);

          //Ocultamos el spinner
          this._spinner.hide();
          jQuery('.modal').removeClass("pixvs-spinner-modal");

          return false;
        }
        if(moment(this.solicitudViatico.fechaSalida).isSameOrAfter(moment(dateStartViaje))){

          //Mostramos error 
          this._toastr.error("La fecha de factura no puede tener una fecha anterior a la fecha de inicio del viaje.");

          this.cleanFileXML();

          this.solicitudViaticoComprobacionDetalleForm.controls.fileXML.setValue(null);

          //Ocultamos el spinner
          this._spinner.hide();
          jQuery('.modal').removeClass("pixvs-spinner-modal");

          return false;
        }
      }
      // Verificar la factura XML tiene retenciones no se podra hacer comprobación por Detalle, solo por factura completo
      if(this.solicitudViaticoComprobacionDetalleForm.controls.formaComprobacionId.value == ListadoCMM.FormaComprobacion.POR_DETALLES){
        if(!!facturaXML['cfdi:Comprobante']['cfdi:Impuestos'] && !!facturaXML['cfdi:Comprobante']['cfdi:Impuestos'][0]['cfdi:Retenciones']){
          if(parseFloat(facturaXML['cfdi:Comprobante']['cfdi:Impuestos'][0].$.TotalImpuestosRetenidos) > 0){
            //Mostramos error 
            this._toastr.warning("La comprobación parcial no procede porque tiene retenciones de ISR, IVA.");

            this.cleanFileXML();

            this.solicitudViaticoComprobacionDetalleForm.controls.fileXML.setValue(null);

            //Ocultamos el spinner
            this._spinner.hide();
            jQuery('.modal').removeClass("pixvs-spinner-modal");

            return false;
          }
        }
      }

      // Agregan los datos a Solicitud Viatico Comprobacion Detalle
      let solicitudViaticoComprobacionDetalle = new SolicitudViaticoComprobacionDetalle();
      // ID Solicitud Viatico Comprobacion
      solicitudViaticoComprobacionDetalle.solicitudViaticoComprobacionId = this.solicitudViaticoComprobacion.id;
      // Tipo Comprobante
      solicitudViaticoComprobacionDetalle.tipoComprobanteId = this.solicitudViaticoComprobacionDetalleForm.controls.tipoComprobanteId.value;
      // RFC
      solicitudViaticoComprobacionDetalle.rfc = facturaXML['cfdi:Comprobante']['cfdi:Emisor'][0].$.Rfc;
      // Razon Social
      solicitudViaticoComprobacionDetalle.razonSocial = facturaXML['cfdi:Comprobante']['cfdi:Emisor'][0].$.Nombre;
      // Fecha Comprobacion
      solicitudViaticoComprobacionDetalle.fechaComprobante = new Date(facturaXML['cfdi:Comprobante'].$.Fecha); 
      // Folio
      if(facturaXML['cfdi:Comprobante'].$.Serie){
        solicitudViaticoComprobacionDetalle.folio = facturaXML['cfdi:Comprobante'].$.Serie + '-' + facturaXML['cfdi:Comprobante'].$.Folio;
      }else{
        solicitudViaticoComprobacionDetalle.folio = facturaXML['cfdi:Comprobante'].$.Folio;
      }
      // Forma Pago
      const formaPago = ListadoCMM.FormaPagoSat.find(forma => forma.clave == parseInt(facturaXML['cfdi:Comprobante'].$.FormaPago));
      solicitudViaticoComprobacionDetalle.formaPagoId = formaPago ? formaPago.estatusId : ListadoCMM.FormaPago.POR_DEFINIR;
      // Moneda
      solicitudViaticoComprobacionDetalle.monedaId = this.moneda.find(moneda => moneda.abreviacion == facturaXML['cfdi:Comprobante'].$.Moneda).id;
      // Tipo Cambio
      solicitudViaticoComprobacionDetalle.tipoCambio = this.moneda.find(moneda => moneda.id == solicitudViaticoComprobacionDetalle.monedaId).predeterminada ? 1.00 : parseFloat(facturaXML['cfdi:Comprobante'].$.TipoCambio);
      // Forma de Comprobacion -> Factura Completa
      if(this.solicitudViaticoComprobacionDetalleForm.controls.formaComprobacionId.value == ListadoCMM.FormaComprobacion.FACTURA_COMPLETA){
        // Importe
        solicitudViaticoComprobacionDetalle.importe = parseFloat(parseFloat(facturaXML['cfdi:Comprobante'].$.Total).toFixed(2));
        // Importe en pesos
        solicitudViaticoComprobacionDetalle.importePesos = parseFloat(parseFloat(facturaXML['cfdi:Comprobante'].$.Total).toFixed(2));
        // Sub Total Comprobacion
        solicitudViaticoComprobacionDetalle.subTotalComprobacion = parseFloat(parseFloat(facturaXML['cfdi:Comprobante'].$.SubTotal).toFixed(2));
        // Descuento Comprobacion
        solicitudViaticoComprobacionDetalle.descuentoComprobacion = facturaXML['cfdi:Comprobante'].$.Descuento ? parseFloat(facturaXML['cfdi:Comprobante'].$.Descuento) : 0;
      } 
      // Total Factura
      solicitudViaticoComprobacionDetalle.totalFactura = parseFloat(facturaXML['cfdi:Comprobante'].$.Total);
      // Sub Total Factura
      solicitudViaticoComprobacionDetalle.subTotalFactura = parseFloat(facturaXML['cfdi:Comprobante'].$.SubTotal);
      // Descuento Factura
      solicitudViaticoComprobacionDetalle.descuentoFactura = facturaXML['cfdi:Comprobante'].$.Descuento ? parseFloat(facturaXML['cfdi:Comprobante'].$.Descuento) : 0;
      // Forma Comprobacion
      solicitudViaticoComprobacionDetalle.formaComprobacionId = this.solicitudViaticoComprobacionDetalleForm.controls.formaComprobacionId.value;
      // UUID
      solicitudViaticoComprobacionDetalle.uuid = facturaXML['cfdi:Comprobante']['cfdi:Complemento'][0]['tfd:TimbreFiscalDigital'][0].$.UUID;

      // Busca la compartida con la solicitud
      this._informeComprobacionService.buscaCompartida(solicitudViaticoComprobacionDetalle).then((response: any) => {

        // Obtener la factura compartida
        this.facturaCompartida = response.data.solicitudViaticoComprobacionDetalle;
        this.facturaImpuestoCompartida = response.data.solicitudViaticoComprobacionDetalleImpuesto;

        // Factura XML Conceptos //
        this.facturaConceptosList = [];
        // Forma Comprobacion -> Factura Completa o Por Detalles
        if(solicitudViaticoComprobacionDetalle.formaComprobacionId == ListadoCMM.FormaComprobacion.FACTURA_COMPLETA){
          // Verificar hay impuestos
          let impuestos : Impuesto2;
          if(facturaXML['cfdi:Comprobante']['cfdi:Impuestos']){
            impuestos = facturaXML['cfdi:Comprobante']['cfdi:Impuestos'][0];
          }
          // verificar hay impuestos locale
          let impuestosLocale: ImpuestosLocale = null;
          if(facturaXML['cfdi:Comprobante']['cfdi:Complemento'][0]['implocal:ImpuestosLocales']){
            impuestosLocale = facturaXML['cfdi:Comprobante']['cfdi:Complemento'][0]['implocal:ImpuestosLocales'][0];
          }

          // Agregan los datos a Factura Concepto
          const facturaConcepto: FacturaConcepto = {
            impuestos: impuestos,
            impuestosLocale: impuestosLocale,
            disabled: false 
          }

          this.facturaConceptosList.push(facturaConcepto);
        }else{
          let countConcepto: number = 1
          let diferencia: number=1.0;
          facturaXML['cfdi:Comprobante']['cfdi:Conceptos'][0]['cfdi:Concepto'].map((concepto: CfdiConcepto) => {
            const conceptoImporte: number = this.redondeos2decimales(concepto.$.Importe);
            let importeTotal: number =  conceptoImporte;
            // Descuento
            if(concepto.$.Descuento){
              importeTotal = importeTotal - this.redondeos2decimales(concepto.$.Descuento);
            }
            // Impuestos
            if(concepto['cfdi:Impuestos']){
              // Traslados
              if(concepto['cfdi:Impuestos'].filter((impuesto: Impuesto) => impuesto['cfdi:Traslados']).length > 0){
                let totalTraslado: number = 0;
                concepto['cfdi:Impuestos'][0]['cfdi:Traslados'][0]['cfdi:Traslado'].map((traslado: CfdiTraslado) =>{
                  // ISR
                  if(ListadoCMM.SwitchTipoImpuesto(traslado.$.Impuesto) == ListadoCMM.TipoImpuesto.ISR){
                    totalTraslado += this.redondeos2decimales(conceptoImporte * parseFloat(traslado.$.TasaOCuota));
                  }
                  // IVA
                  if(ListadoCMM.SwitchTipoImpuesto(traslado.$.Impuesto) == ListadoCMM.TipoImpuesto.IVA){
                    // Verificar si tiene el campo de importe en traslado (impuestos)
                    if(traslado.$.Importe){
                      totalTraslado += this.redondeos2decimales((conceptoImporte * parseFloat(traslado.$.TasaOCuota)));
                    }
                  }
                  // IEPS
                  if(ListadoCMM.SwitchTipoImpuesto(traslado.$.Impuesto) == ListadoCMM.TipoImpuesto.IEPS){
                    totalTraslado += this.redondeos2decimales((conceptoImporte * parseFloat(traslado.$.TasaOCuota)));
                    
                    //Si existe una diferencia de centavos agregar el importe del XML
                    diferencia= parseFloat(traslado.$.Importe)-totalTraslado;
                    if(diferencia>=-0.09 && diferencia<=0.09){                      
                      totalTraslado = parseFloat(traslado.$.Importe);
                    }
                  }
                  // ISH
                  if(ListadoCMM.SwitchTipoImpuesto(traslado.$.Impuesto) == ListadoCMM.TipoImpuesto.ISH){
                    totalTraslado += this.redondeos2decimales(conceptoImporte * parseFloat(traslado.$.TasaOCuota));
                  }
                });
                // importeTotal = ISR + IVA + IEPS + ISH
                importeTotal += totalTraslado;
              }
  
              // Retenciones
              if(concepto['cfdi:Impuestos'].filter((impuesto: Impuesto) => impuesto['cfdi:Retenciones']).length > 0){
                let totalRetencion: number = 0;
                concepto['cfdi:Impuestos'][0]['cfdi:Retenciones'][0]['cfdi:Retencion'].map((retencion: CfdiRetencion) =>{
                  // ISR
                  if(ListadoCMM.SwitchTipoImpuesto(retencion.$.Impuesto) == ListadoCMM.TipoImpuesto.ISR){
                    totalRetencion += this.redondeos2decimales((conceptoImporte * parseFloat(retencion.$.TasaOCuota)));
                  }
                  // IVA
                  if(ListadoCMM.SwitchTipoImpuesto(retencion.$.Impuesto) == ListadoCMM.TipoImpuesto.IVA){
                    totalRetencion += this.redondeos2decimales((conceptoImporte * parseFloat(retencion.$.TasaOCuota)));
                  }
                  // IEPS
                  if(ListadoCMM.SwitchTipoImpuesto(retencion.$.Impuesto) == ListadoCMM.TipoImpuesto.IEPS){
                    totalRetencion += this.redondeos2decimales((conceptoImporte * parseFloat(retencion.$.TasaOCuota)));
                    //Si existe una diferencia de centavos agregar el importe del XML
                    diferencia= parseFloat(retencion.$.Importe)-totalRetencion;
                    if(diferencia>=-0.09 && diferencia<=0.09){                      
                      totalRetencion = parseFloat(retencion.$.Importe);
                    }
                  }
                  // ISH
                  if(ListadoCMM.SwitchTipoImpuesto(retencion.$.Impuesto) == ListadoCMM.TipoImpuesto.ISH){
                    totalRetencion += this.redondeos2decimales((conceptoImporte * parseFloat(retencion.$.TasaOCuota)));
                  }
                });
                // importeTotal = ISR - IVA - IEPS - ISH
                importeTotal -= totalRetencion;
              }
            }
  
            // Complemento Impuestos Locales: ISH y otros.
            let impuestosLocale: ImpuestosLocale = null;
            if(facturaXML['cfdi:Comprobante']['cfdi:Complemento'][0]['implocal:ImpuestosLocales']){
              // Verificar la factura concepto ClaveProdServ con ISH
              if(this.listadoCMMClavesProductosHospedaje.some(cph => cph.valor == concepto.$.ClaveProdServ)){
                impuestosLocale = facturaXML['cfdi:Comprobante']['cfdi:Complemento'][0]['implocal:ImpuestosLocales'][0];
                // Traslados Locales
                if(impuestosLocale['implocal:TrasladosLocales']){
                  impuestosLocale['implocal:TrasladosLocales'].map((tl: TrasladosLocale) => {
                    // Aplica ISH y otros.
                    importeTotal += this.redondeos2decimales((conceptoImporte * (parseFloat(tl.$.TasadeTraslado) / 100)));
                  });
                }
                // Retenciones Locales
                if(impuestosLocale['implocal:RetencionesLocales']){
                  impuestosLocale['implocal:RetencionesLocales'].map((rl: RetencionesLocale) => {
                    // Aplica ISH y otros.
                    importeTotal -= this.redondeos2decimales((conceptoImporte * (parseFloat(rl.$.TasadeRetencion) / 100)));
                  });
                }
              }
            }

            importeTotal = this.redondeos2decimales(importeTotal);

            // Agregan los datos a Factura Concepto
            const facturaConcepto: FacturaConcepto = {
              id: countConcepto,
              name: concepto.$.Descripcion + ' - $' + this.moneyPipe.transformarSinPrefijoConComa(importeTotal),
              importeTotal: importeTotal.toString(),
              concepto: concepto,
              impuestosLocale: impuestosLocale,
              disabled: false 
            }
  
            this.facturaConceptosList.push(facturaConcepto);
            countConcepto++;
          });
        }
        ///////////////////////////

        // Verificar el UUID de usuario o compartida
        // Factura compartida
        const _facturaCompartida = this.facturaCompartida.filter(compartida => compartida.estatusId == ListadoCMM.EstatusRegistro.ACTIVO && compartida.uuid == solicitudViaticoComprobacionDetalle.uuid);
        if(_facturaCompartida.length > 0){
          if(_facturaCompartida.some(compartida => {
            if(compartida.formaComprobacionId == ListadoCMM.FormaComprobacion.FACTURA_COMPLETA || compartida.formaComprobacionId != solicitudViaticoComprobacionDetalle.formaComprobacionId){
              return true;
            }
            return false;
          })){
            // Mostramos error 
            this._toastr.error("La factura ya esta registro forma de comprobación: '" + ListadoCMM.SwitchFormaComprobacion(_facturaCompartida.find(compartida => compartida.formaComprobacionId == ListadoCMM.FormaComprobacion.FACTURA_COMPLETA || compartida.formaComprobacionId != solicitudViaticoComprobacionDetalle.formaComprobacionId).formaComprobacionId) + "', sube otra factura.");

            // Limpiar el archivo XML
            this.cleanFileXML(this.esModoEliminarXML);
            this.solicitudViaticoComprobacionDetalleForm.controls.fileXML.setValue(null);

            //Ocultamos el spinner
            this._spinner.hide();
            jQuery('.modal').removeClass("pixvs-spinner-modal");

            return false;
          }
        }
        // Factura usuario
        const _facturaUsuario = this.solicitudViaticoComprobacionDetalleFormArray.controls.filter((svcdfa: FormGroup) => svcdfa.controls.estatusId.value == ListadoCMM.EstatusRegistro.ACTIVO && svcdfa.controls.uuid.value == solicitudViaticoComprobacionDetalle.uuid);
        if(_facturaUsuario.length > 0){
          if(_facturaUsuario.some((usuario: FormGroup) => {
            if(usuario.controls.formaComprobacionId.value == ListadoCMM.FormaComprobacion.FACTURA_COMPLETA || usuario.controls.formaComprobacionId.value != solicitudViaticoComprobacionDetalle.formaComprobacionId){
              return true;
            }
            return false;
          })){
            // Mostramos error 
            this._toastr.error("La factura ya esta registro forma de comprobación: '" + ListadoCMM.SwitchFormaComprobacion((_facturaUsuario.find((usuario: FormGroup) => usuario.controls.formaComprobacionId.value == ListadoCMM.FormaComprobacion.FACTURA_COMPLETA || usuario.controls.formaComprobacionId.value != solicitudViaticoComprobacionDetalle.formaComprobacionId) as FormGroup).controls.formaComprobacionId.value) + "' lo que subiste, sube otra factura.");

            // Limpiar el archivo XML
            this.cleanFileXML();
            this.solicitudViaticoComprobacionDetalleForm.controls.fileXML.setValue(null);

            //Ocultamos el spinner
            this._spinner.hide();
            jQuery('.modal').removeClass("pixvs-spinner-modal");

            return false;
          }
        }

        // Si el usuario tiene las facturas no es igual las facturas a factura compartida entonces para agregar
        let solicitudViaticoComprobacionDetalleArray: SolicitudViaticoComprobacionDetalle[] = [];
        this.facturaConceptosList.map(facturaConcepto => {
          const _solicitudViaticoComprobacionDetalleFormArray = this.solicitudViaticoComprobacionDetalleFormArray.controls.filter((svcdfa: FormGroup) => svcdfa.controls.tipoComprobanteId.value == ListadoCMM.TipoComprobante.FACTURA_NACIONAL && svcdfa.controls.estatusId.value == ListadoCMM.EstatusRegistro.ACTIVO && svcdfa.controls.uuid.value == solicitudViaticoComprobacionDetalle.uuid && svcdfa.controls.numeroPartida.value == facturaConcepto.id);
          if(_solicitudViaticoComprobacionDetalleFormArray.length > 0){
            _solicitudViaticoComprobacionDetalleFormArray.map((svcdfa: FormGroup) => {
              if(!this.facturaCompartida.some(compartida => compartida.uuid == svcdfa.controls.uuid.value && compartida.numeroPartida == svcdfa.controls.numeroPartida.value && compartida.id == svcdfa.controls.id.value)){
                solicitudViaticoComprobacionDetalleArray.push(svcdfa.getRawValue());
              }
            });
          }
        });
        solicitudViaticoComprobacionDetalleArray.map(svcd => {
          this.facturaCompartida.push(svcd);
        });

        // Verificar si el usuario tiene las facturas mismas entonces eliminar las facturas en factura compartida.
        let _facturaCompartidaRemove: SolicitudViaticoComprobacionDetalle[] = [];
        this.facturaCompartida.map(factura =>{
          // Si la factura es borrado
          if(this.solicitudViaticoComprobacionDetalleFormArray.controls.some((detalle: FormGroup) => detalle.controls.id.value == factura.id && detalle.controls.numeroPartida.value == factura.numeroPartida && detalle.controls.estatusId.value == ListadoCMM.EstatusRegistro.BORRADO)){
            _facturaCompartidaRemove.push(factura);
            return;
          }
        });
        _facturaCompartidaRemove.map(factura => {
          this.facturaCompartida.splice(this.facturaCompartida.indexOf(factura) , 1);
        });

        // Cuando hay existe la factura concepto entonces deshabilitar (Disabled)
        this.facturaConceptosList.map(facturaConcepto => {
          let importeTotal: number = 0;
          this.facturaCompartida.filter(compartida => compartida.numeroPartida == facturaConcepto.id).map(compartida => {
            importeTotal += parseFloat(compartida.importePesos.toString());
          });

          if(importeTotal >= parseFloat(facturaConcepto['importeTotal'])){
            facturaConcepto.disabled = true;
          }
        });
        this.facturaConceptosList = [...this.facturaConceptosList];

        // Verificar la factura concepto hay los conceptos
        const _facturaConceptosList = this.facturaConceptosList.filter(concepto => concepto.disabled == false);
        if(_facturaConceptosList.length == 0){
          // Mostramos error 
          this._toastr.error("Ya no existen conceptos por seleccionar para esta factura, sube otra factura.");

          this.cleanFileXML();

          this.solicitudViaticoComprobacionDetalleForm.controls.fileXML.setValue(null);

          //Ocultamos el spinner
          this._spinner.hide();
          jQuery('.modal').removeClass("pixvs-spinner-modal");

          return false;
        }

        // Subir el archivo
        this.archivoService.subirArchivo(file).then(_response => {

          this.archivoTipoComprobante.nombreArchivoTemporal = _response.data;
          this.archivoTipoComprobante.tipoArchivoId = ListadoCMM.Archivo.XML;

          // Fecha Comprobante
          this.solicitudViaticoComprobacionDetalleForm.controls.fechaComprobante.setValue(solicitudViaticoComprobacionDetalle.fechaComprobante);
          this.solicitudViaticoComprobacionDetalleForm.controls.fechaComprobante.disable();
          // Folio
          this.solicitudViaticoComprobacionDetalleForm.controls.folio.setValue(solicitudViaticoComprobacionDetalle.folio);
          this.solicitudViaticoComprobacionDetalleForm.controls.folio.disable();
          // Forma Pago
          this.solicitudViaticoComprobacionDetalleForm.controls.formaPagoId.setValue(solicitudViaticoComprobacionDetalle.formaPagoId);
          this.solicitudViaticoComprobacionDetalleForm.controls.formaPagoId.disable();
          // Moneda
          this.solicitudViaticoComprobacionDetalleForm.controls.monedaId.setValue(solicitudViaticoComprobacionDetalle.monedaId);
          this.solicitudViaticoComprobacionDetalleForm.controls.monedaId.disable();
          // Tipo Cambio
          this.solicitudViaticoComprobacionDetalleForm.controls.tipoCambio.setValue(solicitudViaticoComprobacionDetalle.tipoCambio);
          this.solicitudViaticoComprobacionDetalleForm.controls.tipoCambio.disable();
          // Forma Comprobacion -> Factura Completo
          if(this.solicitudViaticoComprobacionDetalleForm.controls.formaComprobacionId.value == ListadoCMM.FormaComprobacion.FACTURA_COMPLETA){
            // Importe
            this.solicitudViaticoComprobacionDetalleForm.controls.importe.setValue(this.moneyPipe.transformNotSymbol(solicitudViaticoComprobacionDetalle.importe));
            this.solicitudViaticoComprobacionDetalleForm.controls.importe.disable();
            // Importe Pesos
            this.solicitudViaticoComprobacionDetalleForm.controls.importePesos.setValue(this.moneyPipe.transformNotSymbol(solicitudViaticoComprobacionDetalle.importePesos));
            // Sub Total Comprobacion
            this.solicitudViaticoComprobacionDetalleForm.controls.subTotalComprobacion.setValue(solicitudViaticoComprobacionDetalle.subTotalComprobacion);
            // Descuento Comprobacion
            this.solicitudViaticoComprobacionDetalleForm.controls.descuentoComprobacion.setValue(solicitudViaticoComprobacionDetalle.descuentoComprobacion);
          }
          // Forma Comprobacion -> Por Detalle
          if(this.solicitudViaticoComprobacionDetalleForm.controls.formaComprobacionId.value == ListadoCMM.FormaComprobacion.POR_DETALLES){
            // Importe
            this.solicitudViaticoComprobacionDetalleForm.controls.importe.setValue(solicitudViaticoComprobacionDetalle.importe);
            // Importe Pesos
            this.solicitudViaticoComprobacionDetalleForm.controls.importePesos.setValue(solicitudViaticoComprobacionDetalle.importePesos);
            // Concepto Descripcion
            this.solicitudViaticoComprobacionDetalleForm.controls.conceptoDescripcion.setValue(solicitudViaticoComprobacionDetalle.conceptoDescripcion);
            // Clave Prod Serv
            this.solicitudViaticoComprobacionDetalleForm.controls.claveProdServ.setValue(solicitudViaticoComprobacionDetalle.claveProdServ);
            // Numero Partida
            this.solicitudViaticoComprobacionDetalleForm.controls.numeroPartida.setValue(solicitudViaticoComprobacionDetalle.numeroPartida);
            // Concepto Importe
            this.solicitudViaticoComprobacionDetalleForm.controls.conceptoImporte.setValue(solicitudViaticoComprobacionDetalle.conceptoImporte);
            // Concepto Descuento
            this.solicitudViaticoComprobacionDetalleForm.controls.conceptoDescuento.setValue(solicitudViaticoComprobacionDetalle.conceptoDescuento);
            // Descuento Comprobacion
            this.solicitudViaticoComprobacionDetalleForm.controls.descuentoComprobacion.setValue(solicitudViaticoComprobacionDetalle.descuentoComprobacion);
          }
          // Importe Pesos
          this.solicitudViaticoComprobacionDetalleForm.controls.importePesos.disable();
          // Total Factura
          this.solicitudViaticoComprobacionDetalleForm.controls.totalFactura.setValue(solicitudViaticoComprobacionDetalle.totalFactura);
          // Sub Total Factura
          this.solicitudViaticoComprobacionDetalleForm.controls.subTotalFactura.setValue(solicitudViaticoComprobacionDetalle.subTotalFactura);
          // Descuento Factura
          this.solicitudViaticoComprobacionDetalleForm.controls.descuentoFactura.setValue(solicitudViaticoComprobacionDetalle.descuentoFactura);
          // UUID
          this.solicitudViaticoComprobacionDetalleForm.controls.uuid.setValue(solicitudViaticoComprobacionDetalle.uuid);
          // Set File XML in Form Group
          this.solicitudViaticoComprobacionDetalleForm.controls.fileXML.setValue(true);

          // Proveedor //
          this.proveedoresList = [];
          this.paisesList = [];
          //By:AGG
          this.jsonProveedor.rfc=facturaXML['cfdi:Comprobante']['cfdi:Emisor'][0].$.Rfc;
          this.jsonProveedor.ejercicio=this.solicitudViatico.ejercicio;
          //End By:AGG
          this._informeComprobacionService.searchProveedor(this.jsonProveedor).then(response => {
            if(response.data.proveedor.status != 30103){
              // Get Proveedor and Paises
              var proveedor: Proveedor = response.data.proveedor.data[0];
              var paises: PaisSAACG[] = response.data.paises.data;

              // Set Proveedor ID in Solicitud Viatico Comprobacion Detalle And ProveedoresList
              this.solicitudViaticoComprobacionDetalleForm.controls.proveedorId.setValue(proveedor.ProveedorId);
              this.solicitudViaticoComprobacionDetalleForm.controls.proveedorId.disable();
              this.solicitudViaticoComprobacionDetalleForm.controls.proveedorPaisId.setValue(proveedor.PaisId);
              this.solicitudViaticoComprobacionDetalleForm.controls.proveedorPaisId.disable();
              this.solicitudViaticoComprobacionDetalleForm.controls.razonSocial.setValue(proveedor.RazonSocial);
              this.solicitudViaticoComprobacionDetalleForm.controls.razonSocial.disable();
              this.solicitudViaticoComprobacionDetalleForm.controls.rfc.setValue(proveedor.RFC);
              this.solicitudViaticoComprobacionDetalleForm.controls.rfc.disable();
              this.proveedoresList.push({id: proveedor.ProveedorId, razonSocial: proveedor.RazonSocial, rfc: proveedor.RFC, paisId: proveedor.PaisId});
              this.proveedoresList = [...this.proveedoresList];
              
              // Set PaisesList
              paises.map(pais => {
                this.paisesList.push({id: pais.PaisId, nombre: pais.Nombre});
              });
              this.paisesList = [...this.paisesList];

              // Oculto spinner
              this._spinner.hide();
              jQuery('.modal').removeClass("pixvs-spinner-modal");
            }else{
              // Create Proveedor
              var newProveedor = new NewProveedor();
              newProveedor.TipoProveedorId = "04";
              newProveedor.PaisId = "MX";
              newProveedor.RazonSocial = facturaXML['cfdi:Comprobante']['cfdi:Emisor'][0].$.Nombre;
              newProveedor.Estatus = "A";
              newProveedor.RFC = facturaXML['cfdi:Comprobante']['cfdi:Emisor'][0].$.Rfc;
              newProveedor.TipoOperacionId = "85";
              newProveedor.TipoComprobanteFiscalId = 6;
        
              this._informeComprobacionService.registerProveedor(newProveedor,this.solicitudViatico.ejercicio).then(response => {
                if(response.data.proveedor.status != 30200){
                  // Get and Set Proveedor and Paises
                  var proveedor: Proveedor = response.data.proveedor.data[0];
                  var paises: PaisSAACG[] = response.data.paises.data;
        
                  // Set Proveedor ID in Solicitud Viatico Comprobacion Detalle And ProveedoresList
                  this.solicitudViaticoComprobacionDetalleForm.controls.proveedorId.setValue(proveedor.ProveedorId);
                  this.solicitudViaticoComprobacionDetalleForm.controls.proveedorId.disable();
                  this.solicitudViaticoComprobacionDetalleForm.controls.proveedorPaisId.setValue(newProveedor.PaisId);
                  this.solicitudViaticoComprobacionDetalleForm.controls.proveedorPaisId.disable();
                  this.solicitudViaticoComprobacionDetalleForm.controls.razonSocial.setValue(facturaXML['cfdi:Comprobante']['cfdi:Emisor'][0].$.Nombre);
                  this.solicitudViaticoComprobacionDetalleForm.controls.razonSocial.disable();
                  this.solicitudViaticoComprobacionDetalleForm.controls.rfc.setValue(proveedor.RFC);
                  this.solicitudViaticoComprobacionDetalleForm.controls.rfc.disable();
                  this.proveedoresList.push({id: proveedor.ProveedorId, razonSocial: facturaXML['cfdi:Comprobante']['cfdi:Emisor'][0].$.Nombre, rfc: proveedor.RFC, paisId: newProveedor.PaisId});
                  this.proveedoresList = [...this.proveedoresList];

                  // Set PaisesList
                  paises.map(pais => {
                    this.paisesList.push({id: pais.PaisId, nombre: pais.Nombre});
                  });
                  this.paisesList = [...this.paisesList];                  
                }else{
                  this._toastr.warning('El proveedor ya esta registrado');
                }
                // Oculto spinner
                this._spinner.hide();
                jQuery('.modal').removeClass("pixvs-spinner-modal");
              });
            }
          }, error => {
            //Mostramos error 
            this._toastr.error(GenericService.getError(error).message);
    
            this.cleanFileXML();
    
            this.solicitudViaticoComprobacionDetalleForm.controls.fileXML.setValue(null);
    
            //Ocultamos el spinner
            this._spinner.hide();
            jQuery('.modal').removeClass("pixvs-spinner-modal");
          });
          ///////////////

        }, error => {
          this._toastr.error(GenericService.getError(error).message, 'Error');

          this.cleanFileXML();

          this.solicitudViaticoComprobacionDetalleForm.controls.fileXML.setValue(null);

          // Oculto spinner
          this._spinner.hide();
          jQuery('.modal').removeClass("pixvs-spinner-modal");

        });
      }, error => {
        //Mostramos error 
        this._toastr.error(GenericService.getError(error).message);

        this.cleanFileXML();

        this.solicitudViaticoComprobacionDetalleForm.controls.fileXML.setValue(null);

        //Ocultamos el spinner
        this._spinner.hide();
        jQuery('.modal').removeClass("pixvs-spinner-modal");
      });
    }, error => {
      //Mostramos error 
      this._toastr.error("No podemos leer el archivo XML", 'Error archivo');

      this.cleanFileXML();

      this.solicitudViaticoComprobacionDetalleForm.controls.fileXML.setValue(null);

      // Oculto spinner
      this._spinner.hide();
      jQuery('.modal').removeClass("pixvs-spinner-modal");

    });
  }

  // Parse XML Modo Editar
  parseXMLModoEditar(data) {
    return new Promise(resolve => {
      var parser = new xml2js.Parser({
          trim: true,
          explicitArray: true
        });
      parser.parseString(data, function (err, result) {
        const facturaXML: FacturaXMLModel = result;
        resolve(facturaXML);
      });
    }).then((facturaXML: FacturaXMLModel) => {

      // Factura XML Conceptos //
      this.facturaConceptosList = [];
      let countConcepto: number = 1;
      facturaXML['cfdi:Comprobante']['cfdi:Conceptos'][0]['cfdi:Concepto'].map((concepto: CfdiConcepto) => {
        let importeTotal: number = parseFloat(concepto.$.Importe);
        // Descuento
        if(concepto.$.Descuento){
          importeTotal = importeTotal - parseFloat(concepto.$.Descuento);
        }

        // Impuestos
        if(concepto['cfdi:Impuestos']){
          // Traslados
          if(concepto['cfdi:Impuestos'].filter((impuesto: Impuesto) => impuesto['cfdi:Traslados']).length > 0){
            let totalTraslado: number = 0;
            concepto['cfdi:Impuestos'][0]['cfdi:Traslados'][0]['cfdi:Traslado'].map((traslado: CfdiTraslado) =>{
              // ISR
              if(ListadoCMM.SwitchTipoImpuesto(traslado.$.Impuesto) == ListadoCMM.TipoImpuesto.ISR){
                totalTraslado += (parseFloat(concepto.$.Importe) * parseFloat(traslado.$.TasaOCuota));
              }
              // IVA
              if(ListadoCMM.SwitchTipoImpuesto(traslado.$.Impuesto) == ListadoCMM.TipoImpuesto.IVA){
                // Verificar si tiene el campo de importe en traslado (impuestos)
                if(traslado.$.Importe){
                  totalTraslado += (parseFloat(concepto.$.Importe) * parseFloat(traslado.$.TasaOCuota));
                }
              }
              // IEPS
              if(ListadoCMM.SwitchTipoImpuesto(traslado.$.Impuesto) == ListadoCMM.TipoImpuesto.IEPS){
                totalTraslado += (parseFloat(concepto.$.Importe) * parseFloat(traslado.$.TasaOCuota));
              }
              // ISR
              if(ListadoCMM.SwitchTipoImpuesto(traslado.$.Impuesto) == ListadoCMM.TipoImpuesto.ISH){
                totalTraslado += (parseFloat(concepto.$.Importe) * parseFloat(traslado.$.TasaOCuota));
              }
            });
            // importeTotal = ISR - IVA - IEPS - ISH
            importeTotal += totalTraslado;
          }

          // Retenciones
          if(concepto['cfdi:Impuestos'].filter((impuesto: Impuesto) => impuesto['cfdi:Retenciones']).length > 0){
            let totalRetencion: number = 0;
            concepto['cfdi:Impuestos'][0]['cfdi:Retenciones'][0]['cfdi:Retencion'].map((retencion: CfdiRetencion) =>{
              // ISR
              if(ListadoCMM.SwitchTipoImpuesto(retencion.$.Impuesto) == ListadoCMM.TipoImpuesto.ISR){
                totalRetencion += (parseFloat(concepto.$.Importe) * parseFloat(retencion.$.TasaOCuota));
              }
              // IVA
              if(ListadoCMM.SwitchTipoImpuesto(retencion.$.Impuesto) == ListadoCMM.TipoImpuesto.IVA){
                totalRetencion += (parseFloat(concepto.$.Importe) * parseFloat(retencion.$.TasaOCuota));
              }
              // IEPS
              if(ListadoCMM.SwitchTipoImpuesto(retencion.$.Impuesto) == ListadoCMM.TipoImpuesto.IEPS){
                totalRetencion += (parseFloat(concepto.$.Importe) * parseFloat(retencion.$.TasaOCuota));
              }
              // ISR
              if(ListadoCMM.SwitchTipoImpuesto(retencion.$.Impuesto) == ListadoCMM.TipoImpuesto.ISH){
                totalRetencion += (parseFloat(concepto.$.Importe) * parseFloat(retencion.$.TasaOCuota));
              }
            });
            // importeTotal = ISR - IVA - IEPS - ISH
            importeTotal -= totalRetencion;
          }
        }

        // Complemento Impuestos Locales: ISH
        let impuestosLocale: ImpuestosLocale = null;
        if(facturaXML['cfdi:Comprobante']['cfdi:Complemento'][0]['implocal:ImpuestosLocales']){
          // Verificar la factura concepto ClaveProdServ con ISH
          if(this.listadoCMMClavesProductosHospedaje.some(cph => cph.valor == concepto.$.ClaveProdServ)){
            impuestosLocale = facturaXML['cfdi:Comprobante']['cfdi:Complemento'][0]['implocal:ImpuestosLocales'][0];
            // Traslados Locales
            if(impuestosLocale['implocal:TrasladosLocales']){
              impuestosLocale['implocal:TrasladosLocales'].map((tl: TrasladosLocale) => {
                // Aplica ISH y otros.
                importeTotal += (parseFloat(concepto.$.Importe) * (parseFloat(tl.$.TasadeTraslado) / 100));
              });
            }
            // Retenciones Locales
            if(impuestosLocale['implocal:RetencionesLocales']){
              impuestosLocale['implocal:RetencionesLocales'].map((rl: RetencionesLocale) => {
                // Aplica ISH y otros.
                importeTotal -= (parseFloat(concepto.$.Importe) * (parseFloat(rl.$.TasadeRetencion) / 100));
              });
            }
          }
        }

        const facturaConcepto: FacturaConcepto = {
          id: countConcepto,
          name: concepto.$.Descripcion + ' - $' + importeTotal.toFixed(2),
          importeTotal: importeTotal.toFixed(2),
          concepto: concepto,
          impuestosLocale: impuestosLocale,
          disabled: false 
        }

        this.facturaConceptosList.push(facturaConcepto);
        countConcepto++;
      });
      ///////////////////////////

      // Solicitud Viatico Comprobacion Detalle
      let solicitudViaticoComprobacionDetalle: SolicitudViaticoComprobacionDetalle = this.solicitudViaticoComprobacionDetalleForm.getRawValue();

      // Busica la compartida con la solicitud
      this._informeComprobacionService.buscaCompartida(solicitudViaticoComprobacionDetalle).then((response: any) => {
        // Get Factura With Share File
        this.facturaCompartida = response.data.solicitudViaticoComprobacionDetalle;
        this.facturaCompartida = this.facturaCompartida.filter(compartida => compartida.id != solicitudViaticoComprobacionDetalle.id);

        // Search Exist Factura Concepto
        let solicitudViaticoComprobacionDetalleArray: SolicitudViaticoComprobacionDetalle[] = [];
        this.facturaConceptosList.map(facturaConcepto => {
          let _solicitudViaticoComprobacionDetalleFormArray = this.solicitudViaticoComprobacionDetalleFormArray.controls.filter((svcdfa: FormGroup) => svcdfa.controls.tipoComprobanteId.value == ListadoCMM.TipoComprobante.FACTURA_NACIONAL && svcdfa.controls.estatusId.value == ListadoCMM.EstatusRegistro.ACTIVO && svcdfa.controls.uuid.value == solicitudViaticoComprobacionDetalle.uuid && svcdfa.controls.numeroPartida.value == facturaConcepto.id && svcdfa.controls.id.value != solicitudViaticoComprobacionDetalle.id);
          _solicitudViaticoComprobacionDetalleFormArray = _solicitudViaticoComprobacionDetalleFormArray.filter((solicitud: FormGroup) => { 
            // existe en solicitud detalle para que no agregar.
            if(this.facturaCompartida.some(compartida => compartida.id == solicitud.controls.id.value)) 
              return false;
            else{
              return true;
            }
          });
          if(_solicitudViaticoComprobacionDetalleFormArray.length > 0){
            _solicitudViaticoComprobacionDetalleFormArray.map((svcdfa: FormGroup) => {
              solicitudViaticoComprobacionDetalleArray.push(svcdfa.getRawValue());
            });
          }
        });
        solicitudViaticoComprobacionDetalleArray.map(svcd => {
          this.facturaCompartida.push(svcd);
        });

        // Busca existe la factura compartida para cambiar disabled
        this.facturaConceptosList.map(facturaConcepto => {
          let importeTotal: number = 0;
          this.facturaCompartida.filter(share => share.numeroPartida == facturaConcepto.id).map(share => {
            importeTotal += parseFloat(share.importePesos.toString());
          });
          if(importeTotal >= parseFloat(facturaConcepto['importeTotal'])){
            facturaConcepto.disabled = true;
          }
          //Selecciono el concepto para poner el monto (maxima) en el importe
          if(solicitudViaticoComprobacionDetalle.numeroPartida == facturaConcepto.id){
            this.facturaImporteMax = parseFloat(facturaConcepto['importeTotal']) - importeTotal;
          }
        });
        this.facturaConceptosList = [...this.facturaConceptosList];
        
      }, error => {
        //Mostramos error 
        this._toastr.error(GenericService.getError(error).message);

        this.cleanFileXML();

        this.solicitudViaticoComprobacionDetalleForm.controls.fileXML.setValue(null);

        //Ocultamos el spinner
        this._spinner.hide();
        jQuery('.modal').removeClass("pixvs-spinner-modal");
      });
    }, error => {
      //Mostramos error 
      this._toastr.error("No podemos leer el archivo XML", 'Error archivo');

      this.cleanFileXML();

      this.solicitudViaticoComprobacionDetalleForm.controls.fileXML.setValue(null);

      // Oculto spinner
      this._spinner.hide();
      jQuery('.modal').removeClass("pixvs-spinner-modal");

    });
  }

  // Clean Archivo XML
  cleanFileXML(esEliminar?: boolean) {
    jQuery("#fileinputXML").fileinput("clear");

    this.archivoTipoComprobante = new ArchivoTipoComporbante();

    if(!!!esEliminar){
      const archivoTipoComprobante =  this.archivoTipoComprobanteFormArray.controls.find((_file: FormGroup) => _file.controls.referenciaId.value == this.solicitudViaticoComprobacionDetalleForm.controls.id.value && _file.controls.tipoArchivoId.value == ListadoCMM.Archivo.XML && _file.controls.vigente.value == true) as FormGroup;
      if(archivoTipoComprobante){

        this.esVisibleArchivo = false;
        var _solicitudViaticoComprobacionDetalle: SolicitudViaticoComprobacionDetalle = this.solicitudViaticoComprobacionDetalleFormArray.controls.find(detalle => detalle.value.id == archivoTipoComprobante.controls.referenciaId.value).value;
        this.archivoTipoComprobante = archivoTipoComprobante.value;
        this.solicitudViaticoComprobacionDetalleForm.controls.fileXML.setValue(archivoTipoComprobante.value);
        this.solicitudViaticoComprobacionDetalleForm.controls.fileXML.clearValidators();
        this.solicitudViaticoComprobacionDetalleForm.controls.fileXML.updateValueAndValidity();

        if(this.solicitudViaticoComprobacionDetalleForm.controls.formaComprobacionId.value != _solicitudViaticoComprobacionDetalle.formaComprobacionId){
          this.recuperaArchivoCampos(_solicitudViaticoComprobacionDetalle);
        }
        
        setTimeout(() => {
          this.esVisibleArchivo = true;
        }, 0);
      }else{
        this.limpiaArchivoCampos();
      }
    }else{
      this.esModoEliminarXML = true;
      this.limpiaArchivoCampos();
    }
    
    // Archivo
    // this.archivoTipoComprobante = new ArchivoTipoComporbante();
    // const archivoTipoComprobante =  this.archivoTipoComprobanteFormArray.controls.find((_file: FormGroup) => _file.controls.referenciaId.value == this.solicitudViaticoComprobacionDetalleForm.controls.id.value && _file.controls.tipoArchivoId.value == ListadoCMM.Archivo.XML && _file.controls.vigente.value == true) as FormGroup;
    // if(archivoTipoComprobante){
    //   archivoTipoComprobante.controls.vigente.setValue(false);
    //   if (this.solicitudViaticoComprobacionDetalleForm.controls.tipoComprobanteId.value != ListadoCMM.TipoComprobante.FACTURA_NACIONAL) {
    //     archivoTipoComprobante.markAsDirty();        
    //   }
    // }
  }

  limpiaArchivoCampos(){
    this.solicitudViaticoComprobacionDetalleForm.controls.proveedorId.setValue(null);
    this.solicitudViaticoComprobacionDetalleForm.controls.proveedorId.enable();

    this.solicitudViaticoComprobacionDetalleForm.controls.proveedorPaisId.setValue('');
    this.solicitudViaticoComprobacionDetalleForm.controls.proveedorPaisId.enable();

    
    this.solicitudViaticoComprobacionDetalleForm.controls.fechaComprobante.setValue('');
    this.solicitudViaticoComprobacionDetalleForm.controls.fechaComprobante.enable();

    this.solicitudViaticoComprobacionDetalleForm.controls.folio.setValue('');
    this.solicitudViaticoComprobacionDetalleForm.controls.folio.enable();

    this.solicitudViaticoComprobacionDetalleForm.controls.rfc.setValue('');
    this.solicitudViaticoComprobacionDetalleForm.controls.rfc.enable();

    this.solicitudViaticoComprobacionDetalleForm.controls.razonSocial.setValue('');
    this.solicitudViaticoComprobacionDetalleForm.controls.razonSocial.enable();

    this.solicitudViaticoComprobacionDetalleForm.controls.formaPagoId.setValue(null);
    this.solicitudViaticoComprobacionDetalleForm.controls.formaPagoId.enable();

    this.solicitudViaticoComprobacionDetalleForm.controls.monedaId.setValue(null);
    this.solicitudViaticoComprobacionDetalleForm.controls.monedaId.enable();

    this.solicitudViaticoComprobacionDetalleForm.controls.tipoCambio.setValue(0);
    this.solicitudViaticoComprobacionDetalleForm.controls.tipoCambio.enable();

    this.solicitudViaticoComprobacionDetalleForm.controls.importe.setValue(0);
    this.solicitudViaticoComprobacionDetalleForm.controls.importe.enable();

    this.solicitudViaticoComprobacionDetalleForm.controls.importePesos.setValue(0);
    //this.solicitudViaticoComprobacionDetalleForm.controls.importePesos.enable();

    this.solicitudViaticoComprobacionDetalleForm.controls.fileXML.setValue(null);
  }

  recuperaArchivoCampos(_solicitudViaticoComprobacionDetalle: SolicitudViaticoComprobacionDetalle){
    this.solicitudViaticoComprobacionDetalleForm.controls.proveedorId.setValue(_solicitudViaticoComprobacionDetalle.proveedorId);
    this.solicitudViaticoComprobacionDetalleForm.controls.proveedorId.disable();

    this.solicitudViaticoComprobacionDetalleForm.controls.proveedorPaisId.setValue(_solicitudViaticoComprobacionDetalle.proveedorPaisId);
    this.solicitudViaticoComprobacionDetalleForm.controls.proveedorPaisId.disable();

    
    this.solicitudViaticoComprobacionDetalleForm.controls.fechaComprobante.setValue(_solicitudViaticoComprobacionDetalle.fechaComprobante);
    this.solicitudViaticoComprobacionDetalleForm.controls.fechaComprobante.disable();

    this.solicitudViaticoComprobacionDetalleForm.controls.folio.setValue(_solicitudViaticoComprobacionDetalle.folio);
    this.solicitudViaticoComprobacionDetalleForm.controls.folio.disable();

    this.solicitudViaticoComprobacionDetalleForm.controls.rfc.setValue(_solicitudViaticoComprobacionDetalle.rfc);
    this.solicitudViaticoComprobacionDetalleForm.controls.rfc.disable();

    this.solicitudViaticoComprobacionDetalleForm.controls.razonSocial.setValue(_solicitudViaticoComprobacionDetalle.razonSocial);
    this.solicitudViaticoComprobacionDetalleForm.controls.razonSocial.disable();

    this.solicitudViaticoComprobacionDetalleForm.controls.formaPagoId.setValue(_solicitudViaticoComprobacionDetalle.formaPagoId);
    this.solicitudViaticoComprobacionDetalleForm.controls.formaPagoId.disable();

    this.solicitudViaticoComprobacionDetalleForm.controls.monedaId.setValue(_solicitudViaticoComprobacionDetalle.monedaId);
    this.solicitudViaticoComprobacionDetalleForm.controls.monedaId.disable();

    this.solicitudViaticoComprobacionDetalleForm.controls.tipoCambio.setValue(_solicitudViaticoComprobacionDetalle.tipoCambio);
    this.solicitudViaticoComprobacionDetalleForm.controls.tipoCambio.disable();

    this.solicitudViaticoComprobacionDetalleForm.controls.importe.setValue(_solicitudViaticoComprobacionDetalle.importe);

    this.solicitudViaticoComprobacionDetalleForm.controls.importePesos.setValue(_solicitudViaticoComprobacionDetalle.importePesos);

    this.solicitudViaticoComprobacionDetalleForm.controls.formaComprobacionId.setValue(_solicitudViaticoComprobacionDetalle.formaComprobacionId);
    
    // Factura Completoa
    if(this.solicitudViaticoComprobacionDetalleForm.controls.formaComprobacionId.value == ListadoCMM.FormaComprobacion.FACTURA_COMPLETA){
      this.solicitudViaticoComprobacionDetalleForm.controls.importe.disable();
    }else{
      // Por Detalle
      this.solicitudViaticoComprobacionDetalleForm.controls.conceptoDescripcion.setValue(_solicitudViaticoComprobacionDetalle.conceptoDescripcion);
      this.solicitudViaticoComprobacionDetalleForm.controls.numeroPartida.setValue(_solicitudViaticoComprobacionDetalle.numeroPartida);
      this.solicitudViaticoComprobacionDetalleForm.controls.conceptoImporte.setValue(_solicitudViaticoComprobacionDetalle.conceptoImporte);
      this.solicitudViaticoComprobacionDetalleForm.controls.conceptoDescuento.setValue(_solicitudViaticoComprobacionDetalle.conceptoDescuento);
      this.solicitudViaticoComprobacionDetalleForm.controls.descuentoComprobacion.setValue(_solicitudViaticoComprobacionDetalle.descuentoComprobacion);
      this.solicitudViaticoComprobacionDetalleForm.controls.importe.enable();
    }
  }

  // Recover Archivo XML
  recoverFileXML() {
    let fileLast = this.archivoTipoComprobanteFormArray.controls.filter((file: FormGroup) => file.controls.referenciaId.value == this.solicitudViaticoComprobacionDetalleForm.controls.id.value && file.controls.tipoArchivoId.value == ListadoCMM.Archivo.XML && file.controls.vigente.value == false);
    if (fileLast.length > 0) {
      (this.archivoTipoComprobanteFormArray.controls.filter((file: FormGroup) => file.controls.referenciaId.value == this.solicitudViaticoComprobacionDetalleForm.controls.id.value && file.controls.tipoArchivoId.value == ListadoCMM.Archivo.XML && file.controls.vigente.value == false)[fileLast.length - 1] as FormGroup).controls.vigente.setValue(true);
    }
  }

  // Recover Archivo Other
  recoverFileOther() {
    let fileLast = this.archivoTipoComprobanteFormArray.controls.filter((file: FormGroup) => file.controls.referenciaId.value == this.solicitudViaticoComprobacionDetalleForm.controls.id.value && file.controls.tipoArchivoId.value != ListadoCMM.Archivo.XML && file.controls.vigente.value == false);
    if (fileLast.length > 0) {
      (this.archivoTipoComprobanteFormArray.controls.filter((file: FormGroup) => file.controls.referenciaId.value == this.solicitudViaticoComprobacionDetalleForm.controls.id.value && file.controls.tipoArchivoId.value != ListadoCMM.Archivo.XML && file.controls.vigente.value == false)[fileLast.length - 1] as FormGroup).controls.vigente.setValue(true);
    }
  }

  // File Other
  onFileOtherChange(event) {
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      this.solicitudViaticoComprobacionDetalleForm.controls.fileOther.setValue(file);
    }
  }

  // Metodo file with Other: PDF, Image, Png, etc...
  onFileOther(event) {
    // Mostrar spinner
    this._spinner.show();
    jQuery('.modal').addClass("pixvs-spinner-modal");

    this.archivoTipoComprobanteOther = new ArchivoTipoComporbante();

    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      let file: File = fileList[0];
      let extension = file.name.split('.').pop().toLowerCase();

      if (environment.extensionOther.indexOf(extension) == -1) {
        jQuery("#removeFileXML").click();
        this._toastr.error('Debe seleccionar un archivo');

        // Oculto spinner
        this._spinner.hide();
        jQuery('.modal').removeClass("pixvs-spinner-modal");

        jQuery("#fileinputOtros").fileinput("clear");
        jQuery("#fileinputComprobantes").fileinput("clear");

        return;
      }

      this.archivoService.subirArchivo(file).then(response => {

        this.archivoTipoComprobanteOther.nombreArchivoTemporal = response.data;
        this.archivoTipoComprobanteOther.tipoArchivoId = this.getTipoArchivoWithExtension(extension);

        // Oculto spinner
        this._spinner.hide();
        jQuery('.modal').removeClass("pixvs-spinner-modal");

      }, error => {
        this._toastr.error(GenericService.getError(error).message, 'Error');
      });
    } else {
      // Oculto spinner
      this._spinner.hide();
      jQuery('.modal').removeClass("pixvs-spinner-modal");
    }    
  }

  ajustarFechas(isRM:boolean){
    try {
     
          if(isRM)
          {            
            //Recursos Materiales        
            let minDateFechaCom:Date;
            let categoria:number=null,conceptoId:number=null;            

            let solicitudViaticoComprobacionPasaje: SolicitudViaticoComprobacionPasaje = new SolicitudViaticoComprobacionPasaje(this.solicitudViaticoComprobacionPasajeForm.getRawValue());
          
            categoria=this.solicitudViaticoComprobacionDetalleForm.getRawValue().categoriaId;
            
            // conceptoId=this.solicitudViaticoComprobacionDetalleForm.getRawValue().conceptoViaticoId;
                      
            if(categoria==ListadoCMM.CategoriaViatico.PASAJE)
            {                        
                minDateFechaCom=solicitudViaticoComprobacionPasaje.fechaCompra;              
            }
            
            if(minDateFechaCom==null)
            {
              minDateFechaCom=new Date(this.asignacionViatico[0].asignacion.fechaComprometido);
            }
            
            this.minDatosComprobante=new Date(minDateFechaCom.toDateString());
            

         }else{
          //Solicitante
          this.minDatosComprobante=new Date(new Date(this.solicitudViatico.fechaSalida).toDateString());         
         }
    
        this.maxDatosComprobante=new Date(this.solicitudViatico.ejercicio,11,31);

        this.minFechaHoraSalida=new Date(this.solicitudViatico.fechaSalida);
        this.maxFechaHoraSalida=new Date(this.solicitudViatico.fechaSalida);
        
        this.minFechaHoraRegreso=new Date(this.solicitudViatico.fechaInicioEvento);
        this.maxFechaHoraRegreso=new Date(this.solicitudViatico.fechaRegreso);
    } catch (error) {
      this._toastr.error("informe_comprobacion.component "+error);
    }
    
  }
  // Clean File Other
  cleanFileOther() {
    const archivoTipoComprobanteOther =  this.archivoTipoComprobanteFormArray.controls.find((_file: FormGroup) => _file.controls.referenciaId.value == this.solicitudViaticoComprobacionDetalleForm.controls.id.value && _file.controls.tipoArchivoId.value != ListadoCMM.Archivo.XML && _file.controls.vigente.value == true) as FormGroup;
    if (archivoTipoComprobanteOther.controls.id.value != '') {
      archivoTipoComprobanteOther.controls.vigente.setValue(false);
      archivoTipoComprobanteOther.markAsDirty();
    } else {
      this.archivoTipoComprobanteFormArray.removeAt(this.archivoTipoComprobanteFormArray.controls.findIndex((__file: FormGroup) => __file.controls == archivoTipoComprobanteOther.controls));
    }

    this.archivoTipoComprobanteOther = new ArchivoTipoComporbante();

    jQuery("#fileinputOtros").fileinput("clear");
    jQuery("#fileinputComprobantes").fileinput("clear");
  }

  getTipoArchivoWithExtension(extension): number {
    switch (extension) {
      case '.pdf':
        return ListadoCMM.Archivo.PDF;
      case ".jpg":
        return ListadoCMM.Archivo.IMAGEN;
      case ".jpeg":
        return ListadoCMM.Archivo.IMAGEN;
      case ".pjpeg":
        return ListadoCMM.Archivo.IMAGEN;
      case ".png":
        return ListadoCMM.Archivo.IMAGEN;
      case ".gif":
        return ListadoCMM.Archivo.IMAGEN;
      case ".jfif":
        return ListadoCMM.Archivo.IMAGEN;
      default:
        return ListadoCMM.Archivo.OTRO;
    }
  }

  onMoneda(event) {
    if (event) {
      let moneda: Moneda = this.moneda.find(moneda => moneda.id == event.id);

      if (moneda.predeterminada) {
        // Meexico 1 peso - campo -> tipoCambio
        this.solicitudViaticoComprobacionDetalleForm.controls.tipoCambio.setValue(this.moneyPipe.transformNotSymbol(1));
        this.solicitudViaticoComprobacionDetalleForm.controls.tipoCambio.disable();
      } else {
        this.solicitudViaticoComprobacionDetalleForm.controls.tipoCambio.enable();
      }

      // Importe * cambio
      if (this.solicitudViaticoComprobacionDetalleForm.controls.importe.value != 0) {
        this.solicitudViaticoComprobacionDetalleForm.controls.importePesos.setValue(this.moneyPipe.transformNotSymbol(this.solicitudViaticoComprobacionDetalleForm.controls.importe.value * this.solicitudViaticoComprobacionDetalleForm.controls.tipoCambio.value));
      }
    }
  }

  validaDeshacer(eventoRegresar: boolean) {
    this.deshacerModal.eventoRegresar = eventoRegresar;

    if (this.validationData().isData) {
      this.deshacerModal.show();
    } else {
      this.deshacer();
    }
  }

  deshabilitarGuardarDeshacer(): boolean {
    return this.solicitudViaticoComprobacion.id != null
      && !this.solicitudViaticoInformeForm.dirty
      && !this.solicitudViaticoComprobacionDetalleFormArray.dirty
      && !this.solicitudViaticoComprobacionPasajeFormArray.dirty
      && !this.solicitudViaticoComprobacionCargoFormArray.dirty;
  }

  mostrarFinalizar(): boolean {
    return this.deshabilitarGuardarDeshacer()
      && this.solicitudViaticoInformeForm.controls.id.value
      && (this.rolPermisonRM
        ? !this.solicitudViaticoComprobacion.rmFinalizoComprobacion || this.usuarioSolicitante
        : this.solicitudViaticoComprobacion.rmFinalizoComprobacion);
  }

  deshacer() {
    this.router.navigate([this.deshacerModal.eventoRegresar ? 'app/viaticos/informes_comprobaciones/' : this.router.url]);
  }

  // Validation Data is change for send
  validationData(): any {
    // Send = response
    let response: {
      isData: boolean,
      data: any
    } = {
      isData: false,
      data: {}
    }

    // Archivos
    let sendArchivoTipoComprobante: ArchivoTipoComporbante[] = [];
    this.archivoTipoComprobanteFormArray.controls.map(file => {
      if (file.dirty) {
        sendArchivoTipoComprobante.push(file.value);
      }
    });

    // Informe y Comprobacion
    let sendSolicitudViaticoInforme: SolicitudViaticoInforme = null,
      sendSolicitudViaticoComprobacion: SolicitudViaticoComprobacion = null,
      sendSolicitudViaticoComprobacionDetalle: SolicitudViaticoComprobacionDetalle[] = [],
      sendSolicitudViaticoComprobacionDetalleImpuesto: SolicitudViaticoComprobacionDetalleImpuesto[] = [],
      sendSolicitudViaticoComprobacionPasaje: SolicitudViaticoComprobacionPasaje[] = [],
      sendSolicitudViaticoComprobacionCargo: SolicitudViaticoComprobacionCargo[] = [];

    // Solicitud Viatico Comprobacion
    sendSolicitudViaticoComprobacion = this.solicitudViaticoComprobacion;
    if (this.solicitudViaticoComprobacionForm.dirty) {
      sendSolicitudViaticoComprobacion.comisionNoRealizada = this.solicitudViaticoComprobacionForm.controls.comisionNoRealizada.value;
      sendSolicitudViaticoComprobacion.motivoNoRealizada = this.solicitudViaticoComprobacionForm.controls.motivoNoRealizada.value;
    }

    // Solicitud Viatico Informe
    if (this.solicitudViaticoInformeForm.dirty) {
      sendSolicitudViaticoInforme = this.solicitudViaticoInformeForm.getRawValue();
    }

    this.solicitudViaticoComprobacionDetalleFormArray.controls.map(comprobacion => {
      if (comprobacion.dirty) {
        sendSolicitudViaticoComprobacionDetalle.push(comprobacion.value);
      }
    });

    // Solicitud Viatico Comprobacion Detalle Impuesto
    this.solicitudViaticoComprobacionDetalleImpuestoFormArray.controls.map(impuesto => {
      if(impuesto.dirty){
        sendSolicitudViaticoComprobacionDetalleImpuesto.push(impuesto.value);
      }
    });

    // Solicitud Viatico Comprobacion Pasaje
    this.solicitudViaticoComprobacionPasajeFormArray.controls.map(pasaje => {
      if (pasaje.dirty) {
        sendSolicitudViaticoComprobacionPasaje.push(pasaje.value);
      }
    });

    // Solicitud Viatico Comprobacion Cargo
    this.solicitudViaticoComprobacionCargoFormArray.controls.map(cargo => {
      if (cargo.dirty) {
        sendSolicitudViaticoComprobacionCargo.push(cargo.value);
      }
    });

    if (sendArchivoTipoComprobante.length > 0 || this.solicitudViaticoComprobacionForm.dirty || sendSolicitudViaticoInforme != null || sendSolicitudViaticoComprobacionDetalle.length > 0 || sendSolicitudViaticoComprobacionPasaje.length > 0 || sendSolicitudViaticoComprobacionCargo.length > 0) {

      // Eliminar el Key FileXML y FileOther
      sendSolicitudViaticoComprobacionDetalle.map(comprobacion => {
        delete comprobacion.fileXML;
        delete comprobacion.fileOther;
      });

      let data: any = {
        'solicitudViaticoComprobacion': sendSolicitudViaticoComprobacion,
        'solicitudViaticoInforme': sendSolicitudViaticoInforme,
        'solicitudViaticoComprobacionDetalle': sendSolicitudViaticoComprobacionDetalle,
        'solicitudViaticoComprobacionDetalleImpuesto': sendSolicitudViaticoComprobacionDetalleImpuesto,
        'solicitudViaticoComprobacionPasaje': sendSolicitudViaticoComprobacionPasaje,
        'solicitudViaticoComprobacionCargo': sendSolicitudViaticoComprobacionCargo,
        'archivoTipoComprobante': sendArchivoTipoComprobante
      };

      response.isData = true;
      response.data = data;
    }
    return response;
  }

  // Solicitud Viatico Comprobacion Detalle Validacion
  getValidacion() {

    let montoAsignado = 0, solicitudViaticoComprobacionDetalleValidacion: SolicitudViaticoComprobacionDetalleValidacion[] = [];

    // Solicitud Viatico Asignacion Viatico
    this.asignacionViatico.map(viatico => {
      montoAsignado += viatico.montoPorTransferir;
    });

    // Solicitud Viatico Asignacion Pasaje
    this.asignacionPasaje.map(pasaje => {
      montoAsignado += pasaje.costo;
    });

    this.solicitudViaticoComprobacionDetalleFormArray.controls.filter((detalle: FormGroup) => detalle.controls.esComprobadoPorRM.value == true && detalle.controls.estatusId.value == ListadoCMM.EstatusRegistro.ACTIVO && detalle.controls.solicitudViaticoComprobacionId.value != null).map((detalle: FormGroup) => {
      // Viatico
      if (detalle.controls.asignacionViaticoId.value != null) {
        const solicitudViaticoAsignacionViatico = this.asignacionViatico.find(viatico => viatico.id == detalle.controls.asignacionViaticoId.value);
        if (detalle.controls.importe.value == solicitudViaticoAsignacionViatico.montoPorTransferir) {
          let _solicitudViaticoComprobacionDetalleValidacion = new SolicitudViaticoComprobacionDetalleValidacion();
          _solicitudViaticoComprobacionDetalleValidacion.solicitudViaticoComprobacionId = this.solicitudViaticoComprobacion.id;
          _solicitudViaticoComprobacionDetalleValidacion.solicitudViaticoComprobacionDetalleId = detalle.controls.id.value;
          _solicitudViaticoComprobacionDetalleValidacion.textoValidacion = 'Viatico - ' + solicitudViaticoAsignacionViatico.conceptoViatico.concepto + '\n Monto Asignado ' + this.moneyPipe.transform(montoAsignado) + '\n Monto Comprobado ' + this.moneyPipe.transform(detalle.controls.importe.value);
          solicitudViaticoComprobacionDetalleValidacion.push(_solicitudViaticoComprobacionDetalleValidacion);
        }
      }

      // Pasaje
      if (detalle.controls.asignacionPasajeId.value != null) {
        const solicitudViaticoAsignacionPasaje = this.asignacionPasaje.find(pasaje => pasaje.id == detalle.controls.asignacionPasajeId.value);
        if (detalle.controls.importe.value == solicitudViaticoAsignacionPasaje.costo) {
          let _solicitudViaticoComprobacionDetalleValidacion = new SolicitudViaticoComprobacionDetalleValidacion();
          _solicitudViaticoComprobacionDetalleValidacion.solicitudViaticoComprobacionId = this.solicitudViaticoComprobacion.id;
          _solicitudViaticoComprobacionDetalleValidacion.solicitudViaticoComprobacionDetalleId = detalle.controls.id.value;
          _solicitudViaticoComprobacionDetalleValidacion.textoValidacion = 'Pasaje - ' + solicitudViaticoAsignacionPasaje.conceptoViatico.concepto + '\n Monto Asignado ' + this.moneyPipe.transform(montoAsignado) + '\n Monto Comprobado ' + this.moneyPipe.transform(detalle.controls.importe.value);
          solicitudViaticoComprobacionDetalleValidacion.push(_solicitudViaticoComprobacionDetalleValidacion);
        }
      }
    });

    // Porcentaje Excedido: Si el total de los registros comprobados con Tipo de Comprobante diferente a FACTURA NACIONAL por la persona que viajo excede el porcentaje definido en la ficha de configuracion del ente en el campo PORCENTAJE SIN COMPROBANTE
    const detallesWithPorcentajeExcedido = this.solicitudViaticoComprobacionDetalleFormArray.controls.filter((detalle: FormGroup) => detalle.controls.esComprobadoPorRM.value == true && detalle.controls.estatusId.value == ListadoCMM.EstatusRegistro.ACTIVO && detalle.controls.tipoComprobanteId.value != ListadoCMM.TipoComprobante.FACTURA_NACIONAL && detalle.controls.solicitudViaticoComprobacionId.value != null);
    if (detallesWithPorcentajeExcedido.length > 0) {
      let montoTotal: number = 0, montoTotalWithPorcentaje: number = 0;

      detallesWithPorcentajeExcedido.map((detalle: FormGroup) => {
        montoTotal += detalle.controls.importe.value;
      });

      montoTotalWithPorcentaje = (montoTotal - ((montoTotal * this.configuracionEnte.porcentajeSinComprobante) / 100));
      let _solicitudViaticoComprobacionDetalleValidacion = new SolicitudViaticoComprobacionDetalleValidacion();
      _solicitudViaticoComprobacionDetalleValidacion.solicitudViaticoComprobacionId = this.solicitudViaticoComprobacion.id;
      _solicitudViaticoComprobacionDetalleValidacion.textoValidacion = 'Porcentaje Sin Comprobante Excedido \n Monto Asignado ' + this.moneyPipe.transform(montoTotal) + '\n Monto Comprobado ' + this.moneyPipe.transform(montoTotalWithPorcentaje);
      solicitudViaticoComprobacionDetalleValidacion.push(_solicitudViaticoComprobacionDetalleValidacion);
    }

    // Monto Anual Excedido: Si el total de los registros comprobados con Tipo de Comprobante diferente a FACTURA NACIONAL por la persona que viajo realizados no solo en esta comprobacion sino en todas las comprobaciones que haya hecho en el Ejercicio de la Fecha de creacion de la solicitud excede el MONTO ANUAL SIN COMPROBANTE definido en la ficha de configuracion del ente
    const detallesWithMontoAnualExcedido = this.solicitudViaticoComprobacionDetalleFormArray.controls.filter((detalle: FormGroup) => detalle.controls.esComprobadoPorRM.value == true && detalle.controls.estatusId.value == ListadoCMM.EstatusRegistro.ACTIVO && detalle.controls.tipoComprobanteId.value != ListadoCMM.TipoComprobante.FACTURA_NACIONAL && detalle.controls.solicitudViaticoComprobacionId.value != null && moment(detalle.controls.fechaComprobante.value).year() == moment(this.solicitudViatico.fechaCreacion).year() && moment(this.solicitudViatico.fechaCreacion) >= moment(detalle.controls.fechaComprobante.value));
    if (detallesWithMontoAnualExcedido.length > 0) {
      if (this.configuracionEnte) {
        let montoTotal: number = 0;

        detallesWithMontoAnualExcedido.map((detalle: FormGroup) => {
          montoTotal += detalle.controls.importe.value;
        });

        if (this.configuracionEnte.montoAnualSinComprobante >= montoTotal) {
          let _solicitudViaticoComprobacionDetalleValidacion = new SolicitudViaticoComprobacionDetalleValidacion();
          _solicitudViaticoComprobacionDetalleValidacion.solicitudViaticoComprobacionId = this.solicitudViaticoComprobacion.id;
          _solicitudViaticoComprobacionDetalleValidacion.textoValidacion = 'Monto Anual Sin Comprobante Excedido \n Monto Actual ' + this.moneyPipe.transform(montoTotal) + '\n Monto Excedente ' + this.moneyPipe.transform(this.configuracionEnte.montoAnualSinComprobante);
          solicitudViaticoComprobacionDetalleValidacion.push(_solicitudViaticoComprobacionDetalleValidacion);
        }
      }
    }

    return solicitudViaticoComprobacionDetalleValidacion;
  }

  // Save Informe y Comprobacion
  guardarInformeComprobacion() {

    this._spinner.show();

    // Get Is Validation Send And Data
    let _response: any = this.validationData();

    if (_response.isData) {

      let data: any = _response.data;

      this._informeComprobacionService.saveInformeComprobacion(data).then((response: any) => {
        if (response.status == 200) {
          this._spinner.show();

          this.router.navigated = false;
          this.router.navigate([this.router.url]);

          //Mostramos success 
          this._toastr.success('El registro fue guardado con éxito!');

        } else {
          this._toastr.error("Error");
          this._spinner.hide();
        }
      }, error => {
        //Mostramos error 
        this._toastr.error(GenericService.getError(error).message);

        //Ocultamos el spinner
        this._spinner.hide();
      });
    } else {
      this._toastr.info("No existen cambios pendientes por guardar");

      //Ocultamos el spinner
      this._spinner.hide();
    }
  }

  // Save Solicitud Viatico Comprobacion
  finalizarComprobacion() {

    this._spinner.show();

    // Get Is Validation Send And Data
    let _response: any = this.validationData();

    if (_response.isData) {

      this._toastr.warning("Primero guardar los datos.");

      //Ocultamos el spinner
      this._spinner.hide();

    } else {
      // Solicitud Viatico Comprobacion
      let solicitudViaticoComprobacion: SolicitudViaticoComprobacion = this.solicitudViaticoComprobacion;

      // Solicitud Viatico Comprobacion Detalle Validacion
      let solicitudViaticoComprobacionDetalleValidacion: SolicitudViaticoComprobacionDetalleValidacion[] = this.getValidacion();

      this._spinner.show();
            
      // Send
      let send: any = {
        'solicitudViaticoComprobacion': solicitudViaticoComprobacion,
        'solicitudViaticoComprobacionDetalleValidacion': solicitudViaticoComprobacionDetalleValidacion
      }

      this._informeComprobacionService.saveSolicitudViaticoCoprobacion(send).then((response: any) => {
        if (response.status == 200) {

          //Mostramos el spinner 
          this._spinner.show();

          this.router.navigated = false;
          this.router.navigate([this.router.url]);

          //Mostramos success 
          this._toastr.success('El registro fue guardado con éxito!');

        } else {
          this._toastr.error("Error");

          //Ocultamos el spinner
          this._spinner.hide();
        }
      }, error => {
        //Mostramos error 
        this._toastr.error(GenericService.getError(error).message);

        //Ocultamos el spinner
        this._spinner.hide();
      });
    }
  }

  // Calculator Importe x Tipo Cambio = Importe Pesos
  datosComprobacionCalculatorImporte(event) {
    
    let importe: number = parseFloat(this.moneyPipe.transformNotSymbol(event.target.value));
    if (!importe) {
      importe = 0;
    }
  
    this.solicitudViaticoComprobacionDetalleForm.controls.importePesos.setValue(this.moneyPipe.transformNotSymbol(importe * this.solicitudViaticoComprobacionDetalleForm.controls.tipoCambio.value));
  
    
  }

  datosComprobacionCalculatorTipoCambio(event) {
    let tipoCambio: number = parseFloat(this.moneyPipe.transformNotSymbol(event.target.value));
    if (!tipoCambio) {
      tipoCambio = 0;
    }
    this.solicitudViaticoComprobacionDetalleForm.controls.importePesos.setValue(this.moneyPipe.transformNotSymbol(this.solicitudViaticoComprobacionDetalleForm.controls.importe.value * tipoCambio));
  }

  convertStringToFloatMoney(event, formControlName: string) {
   
    let money: number = 0;
    if(formControlName == 'importe' && event.target.value.includes("/")) 
    {
      this.dividirMonto(event,true);       
      money=this.importe;
    }else{
      money=parseFloat(this.moneyPipe.transformNotSymbol(event.target.value));
    }

    // let money: number = 
    if (!money) {
      money = 0;
    }

    let moneyLimit = environment.moneyLimit;
    if (money > moneyLimit) {
      this._toastr.error('El Importe no puede ser mayor a $' + moneyLimit);
      money = moneyLimit;
      this.solicitudViaticoComprobacionDetalleForm.controls.importePesos.setValue(this.moneyPipe.transformNotSymbol(money * this.solicitudViaticoComprobacionDetalleForm.controls.tipoCambio.value));
    }

    // Factura Nacional
    if (this.solicitudViaticoComprobacionDetalleForm.controls.tipoComprobanteId.value == ListadoCMM.TipoComprobante.FACTURA_NACIONAL && formControlName == 'importe') {
      if(this.solicitudViaticoComprobacionDetalleForm.controls.numeroPartida.valid){
        if (money > this.facturaImporteMax) {
          this._toastr.error('La factura concepto de "'+ this.solicitudViaticoComprobacionDetalleForm.controls.conceptoDescripcion.value + '" su importe es maximo de $' + this.moneyPipe.transformNotSymbol(this.facturaImporteMax));
          money = this.facturaImporteMax;
          this.solicitudViaticoComprobacionDetalleForm.controls.importePesos.setValue(this.moneyPipe.transformNotSymbol(money * this.solicitudViaticoComprobacionDetalleForm.controls.tipoCambio.value));
        }
      }else{
        this._toastr.warning('Seleccionar Concepto Detalle, por favor.');
        money = 0;
        this.solicitudViaticoComprobacionDetalleForm.controls.importePesos.setValue(this.moneyPipe.transformNotSymbol(money * this.solicitudViaticoComprobacionDetalleForm.controls.tipoCambio.value));
      }
    }

    this.solicitudViaticoComprobacionDetalleForm.controls[formControlName].setValue(this.moneyPipe.transformNotSymbol(money));
  }

  convertStringToFloatMoneyCargo(event, formControlName: string) {
    let money: number = parseFloat(this.moneyPipe.transformNotSymbol(event.target.value));
    if (!money) {
      money = 0;
    }

    let moneyLimit = environment.moneyLimit;
    if (money > moneyLimit) {
      this._toastr.error('El Importe no puede ser mayor a $' + moneyLimit);
      money = moneyLimit;
    }

    this.solicitudViaticoComprobacionCargoForm.controls[formControlName].setValue(this.moneyPipe.transformNotSymbol(money));
  }

  // Modal With Bootstrap Wizard
  bootstrapWizardPixvsRender(){
    this._bootstrapWizardPixvs = jQuery(this.bootstrapWizardPixvs.nativeElement);

    this._bootstrapWizardPixvs.bootstrapWizard({ 
      onTabShow: ($activeTab, $navigation, index): void => {
        const $total = $navigation.find('li').length;
        const $current = index + 1;
        const $percent = ($current / $total) * 100;
        const $wizard = this._bootstrapWizardPixvs;
        $wizard.find('#bar').css({width: $percent + '%'});

        if ($current >= $total) {
          // Registrar Comprobante 
          this.registrarComprobante();

          $wizard.find('.pager .previous').hide();
          $wizard.find('.pager .next').hide();
          $wizard.find('.pager .finish').show();
          $wizard.find('.pager .finish').removeClass('disabled');
        } else {

          // Page 1 first not mostrar button back (atras).
          if($current == 1){
            $wizard.find('.pager .previous').hide();
          }else{
            $wizard.find('.pager .previous').show();
          }
          
          $wizard.find('.pager .next').show();
          $wizard.find('.pager .finish').hide();
          
        }

        // setting done class
        $navigation.find('li').removeClass('done');
        $activeTab.prevAll().addClass('done');
      },

      // validate on tab change
      onNext: function($activeTab, $navigation, nextIndex): boolean {
        const $activeTabPane = jQuery($activeTab.find('a[data-toggle=tab]').attr('href')),
        $form = $activeTabPane.find('form');

        if($activeTabPane[0].id == 'datos-generales'){
          if (this.solicitudViaticoComprobacionDetalleForm.controls.categoriaId.value == null) {
            this.solicitudViaticoComprobacionDetalleValid = false;
            return false;
          }
  
          // Viatico
          if (this.solicitudViaticoComprobacionDetalleForm.controls.categoriaId.value == ListadoCMM.CategoriaViatico.VIATICO) {
            if (this.solicitudViaticoComprobacionDetalleForm.controls.categoriaId.invalid || this.solicitudViaticoComprobacionDetalleForm.controls.conceptoViaticoId.invalid || this.solicitudViaticoComprobacionDetalleForm.controls.tipoComprobanteId.invalid) {
              this.solicitudViaticoComprobacionDetalleValid = false;
              return false;
            }
          }
  
          // Pasaje And Cargo
          if (this.solicitudViaticoComprobacionDetalleForm.controls.categoriaId.value == ListadoCMM.CategoriaViatico.PASAJE || this.solicitudViaticoComprobacionDetalleForm.controls.categoriaId.value == ListadoCMM.CategoriaViatico.CARGO_SERVICIO) {
            if (this.solicitudViaticoComprobacionDetalleForm.controls.categoriaId.invalid || this.solicitudViaticoComprobacionDetalleForm.controls.conceptoViaticoId.invalid || this.solicitudViaticoComprobacionDetalleForm.controls.tipoComprobanteId.invalid) {
              this.solicitudViaticoComprobacionDetalleValid = false;
              return false;
            }
          }
  
          // Reintegro
          if (this.solicitudViaticoComprobacionDetalleForm.controls.categoriaId.value == ListadoCMM.CategoriaViatico.REINTEGRO) {
            if (this.solicitudViaticoComprobacionDetalleForm.controls.categoriaId.invalid || this.solicitudViaticoComprobacionDetalleForm.controls.importePesos.invalid) {
              this.solicitudViaticoComprobacionDetalleValid = false;
              return false;
            }
          }
          
          // File XML
          if (this.solicitudViaticoComprobacionDetalleForm.controls.tipoComprobanteId.value == ListadoCMM.TipoComprobante.FACTURA_NACIONAL && this.solicitudViaticoComprobacionDetalleForm.controls.formaComprobacionId.invalid || this.solicitudViaticoComprobacionDetalleForm.controls.fileXML.invalid) {
            this.solicitudViaticoComprobacionDetalleValid = false;
            return false;
          }

          // RM
          if(this.solicitudViaticoComprobacionDetalleForm.controls.esComprobadoPorRM.value){
            if (this.solicitudViaticoComprobacionDetalleForm.controls.cuentaPagoGastoId.invalid) {
              this.solicitudViaticoComprobacionDetalleValid = false;
              return false;
            }
          }
        }

        if($activeTabPane[0].id == 'datos-proveedor'){
          // Viatico And Pasaje And Cargo
          if (this.solicitudViaticoComprobacionDetalleForm.controls.tipoComprobanteId.value == ListadoCMM.TipoComprobante.FACTURA_NACIONAL || this.solicitudViaticoComprobacionDetalleForm.controls.tipoComprobanteId.value == ListadoCMM.TipoComprobante.COMPROBANTE_EXTRANJERO) {
            if(!this.solicitudViaticoComprobacionDetalleForm.controls.proveedorId.value){
              this._toastr.error('Seleccione un proveedor (Razón Social)');
              return false;
            }
          }
        }

        if($activeTabPane[0].id == 'datos-comprobante'){
          // Viatico And Pasaje And Cargo
          if (this.solicitudViaticoComprobacionDetalleForm.controls.categoriaId.value == ListadoCMM.CategoriaViatico.VIATICO || this.solicitudViaticoComprobacionDetalleForm.controls.categoriaId.value == ListadoCMM.CategoriaViatico.PASAJE || this.solicitudViaticoComprobacionDetalleForm.controls.categoriaId.value == ListadoCMM.CategoriaViatico.CARGO_SERVICIO) {
            if (this.solicitudViaticoComprobacionDetalleForm.controls.fechaComprobante.invalid || this.solicitudViaticoComprobacionDetalleForm.controls.monedaId.invalid || this.solicitudViaticoComprobacionDetalleForm.controls.formaPagoId.invalid || this.solicitudViaticoComprobacionDetalleForm.controls.importe.invalid || this.solicitudViaticoComprobacionDetalleForm.controls.importePesos.invalid) {
              this.solicitudViaticoComprobacionDetalleValid = false;
              return false;
            }

            // Factura XML Concepto con forma de comprobación
            if(this.solicitudViaticoComprobacionDetalleForm.controls.formaComprobacionId.value == ListadoCMM.FormaComprobacion.POR_DETALLES)
              if(this.solicitudViaticoComprobacionDetalleForm.controls.tipoComprobanteId.value == ListadoCMM.TipoComprobante.FACTURA_NACIONAL && this.solicitudViaticoComprobacionDetalleForm.controls.numeroPartida.invalid){
                this.solicitudViaticoComprobacionDetalleValid = false;
                return false;
              }
          }
        }

        if($activeTabPane[0].id == 'datos-pasaje'){
          // Pasaje
          if (this.solicitudViaticoComprobacionDetalleForm.controls.categoriaId.value == ListadoCMM.CategoriaViatico.PASAJE) {
            if (this.solicitudViaticoComprobacionPasajeForm.controls.fechaCompra.invalid || this.solicitudViaticoComprobacionPasajeForm.controls.nombreLinea.invalid || this.solicitudViaticoComprobacionPasajeForm.controls.fechaSalida.invalid || this.solicitudViaticoComprobacionPasajeForm.controls.numeroBoletoIda.invalid) {
              this.solicitudViaticoComprobacionDetalleValid = false;
              return false;
            }
            if (this.solicitudViaticoComprobacionPasajeForm.controls.viajeRedondo.value) {
              if (this.solicitudViaticoComprobacionPasajeForm.controls.fechaRegreso.invalid || this.solicitudViaticoComprobacionPasajeForm.controls.numeroBoletoRegreso.invalid) {
                this.solicitudViaticoComprobacionDetalleValid = false;
                return false;
              }
            }
          }
          // Cargo
          if (this.solicitudViaticoComprobacionDetalleForm.controls.categoriaId.value == ListadoCMM.CategoriaViatico.CARGO_SERVICIO) {
            if (this.solicitudViaticoComprobacionPasajeForm.controls.fechaCompra.invalid || this.solicitudViaticoComprobacionPasajeForm.controls.codigoReservacion.invalid || this.solicitudViaticoComprobacionPasajeForm.controls.nombreLinea.invalid || this.solicitudViaticoComprobacionPasajeForm.controls.fechaSalida.invalid || this.solicitudViaticoComprobacionPasajeForm.controls.fechaRegreso.invalid || this.solicitudViaticoComprobacionCargoForm.controls.fechaCargoSalida.invalid || this.solicitudViaticoComprobacionCargoForm.controls.montoCargoSalida.invalid || this.solicitudViaticoComprobacionCargoForm.controls.fechaCargoRegreso.invalid || this.solicitudViaticoComprobacionCargoForm.controls.montoCargoRegreso.invalid) {
              this.solicitudViaticoComprobacionDetalleValid = false;

              return false;
            }
          }
        }

        this.solicitudViaticoComprobacionDetalleValid = true;

        // validate form in casa there is form
        // if ($form.length) {
        //     return $form.parsley().validate();
        // }

      }.bind(this),
      // diable tab clicking
      onTabClick: function($activeTab, $navigation, currentIndex, clickedIndex): boolean {
        return $navigation.find('li:eq(' + clickedIndex + ')').is('.done');
      },
      onFinish: function($activeTab, $navigation, Index): void{
        jQuery('.bd-example-modal-lg').modal('hide');
      }
    });
    if (this._bootstrapWizardPixvs.data('height')) {
      // setting fixed height so wizard won't jump
      this._bootstrapWizardPixvs.find('.tab-pane').css({height: this._bootstrapWizardPixvs.data('height')});
    }
  }

  onClickOpenModalBootstrapWizard(isRM: boolean) {
    // Cambiamos el valor de visible el archivo en el elemento INPUT
    this.esVisibleArchivo = true;
    // Cambiamos el valor de modo de eliminar XML
    this.esModoEliminarXML = false;

    // Modo Button Edit
    this.modoButtonEdit = false;
    setTimeout(() => {
      this._bootstrapWizardPixvs.bootstrapWizard('resetWizard');
      this.habilitarModoComprobanteOrGasto(false);
      this.modoComprobar(false);
    }, 0);

    // Valid = false
    this.solicitudViaticoComprobacionDetalleValid = true;

    // Create Comprobacion Form And esComprobanteRM False or True
    this.createComprobacionDetalleForm(null, isRM);

    // Clean Archivo
    this.cleanFiles();

    // Cargar comprobante
    this.cargarComprobacion();

    // Verify date start viaje
    if (isRM) {
      this.dateStartViaje = null; 
     
     
      //this.minDatosComprobante=new Date(this.solicitudViaticoComprobacionPasaje.fechaCompra);
      // this.solicitudViaticoComprobacionDetalleForm.controls.fechaComprobante.setValue(this.minDatosComprobante);
      // this.maxDatosComprobante=new Date(new Date(this.solicitudViatico.fechaRegreso).getFullYear(),11,31);

      // Cuenta Pago Gasto
      this.cuentasGastoList = [];
      this._informeComprobacionService.getListadoCuentaConTableRM(this.solicitudViatico.ejercicio).then(response => {
        if (response.data.status != 30200) {
          // Get Listado de Cuenta
          var cuentasGasto: CuentaGasto[] = response.data.data;

          // Set Cuentas Gasto List
          cuentasGasto.map(cuenta => {
            this.cuentasGastoList.push({ id: cuenta.CatalogoCuentaId, cuenta: cuenta.Cuenta, nombre: cuenta.Nombre });
          });
          this.cuentasGastoList = [...this.cuentasGastoList];
        }
      }).catch(() =>{
        this._toastr.error("La cuenta de gasto no esta disponible, inténtelo mas tarde.");
      });

    } else {
      this.dateStartViaje = new Date(this.solicitudViatico.fechaSalida);
      this.dateStartViaje.setHours(0);
      
    }
    this.ajustarFechas(isRM);
  }

  onClickNewComprobanteOrGasto(){
    // Cambiamos el valor de visible el archivo en el elemento INPUT
    this.esVisibleArchivo = true;
    // Cambiamos el valor de modo de eliminar XML
    this.esModoEliminarXML = false;

    setTimeout(() => {
      this._bootstrapWizardPixvs.bootstrapWizard('resetWizard');
    }, 0);

    // Clean Archivo
    this.cleanFiles();

    // Refresh solicitudViaticoComprobacionDetalleForm
    this.createComprobacionDetalleForm(null, this.solicitudViaticoComprobacionDetalleForm.controls.esComprobadoPorRM.value);
  }

  // Data Edit Where Button
  onClickEditComprobanteOrGasto(solicitudViaticoComprobacionDetalle: SolicitudViaticoComprobacionDetalle, isRM: boolean): void {
    // Cambiamos el valor de visible el archivo en el elemento INPUT
    this.esVisibleArchivo = false;
    // Cambiamos el valor de modo de eliminar XML
    this.esModoEliminarXML = false;
    
    // Modo Button Edit
    this.modoButtonEdit = true;
    setTimeout(() => {
      this._bootstrapWizardPixvs.bootstrapWizard('resetWizard');
      this.habilitarModoComprobanteOrGasto(true);

      // Vertify is comprobar for asignacion viatico or pasaje
      if (this.solicitudViaticoComprobacionDetalleForm.controls.asignacionViaticoId.value != null || this.solicitudViaticoComprobacionDetalleForm.controls.asignacionPasajeId.value != null) {
        // Modo Comprobar
        this.modoComprobar(true);
        
      }else{
        // Modo Comprobar
        this.modoComprobar(false);
      }

    }, 0);

    // Create Comprobacion Form And esComprobanteRM False Or True
    this.createComprobacionDetalleForm(solicitudViaticoComprobacionDetalle, isRM);

    // Pasaje
    let solicitudViaticoComprobacionPasaje: SolicitudViaticoComprobacionPasaje = this.solicitudViaticoComprobacionPasajeFormArray.value.find((pasaje: SolicitudViaticoComprobacionPasaje) => pasaje.solicitudViaticoComprobacionDetalleId == solicitudViaticoComprobacionDetalle.id && pasaje.estatusId == ListadoCMM.EstatusRegistro.ACTIVO);
    if(solicitudViaticoComprobacionPasaje){
      this.createComprobacionPasajeForm(solicitudViaticoComprobacionPasaje);
    }

    // Cargo
    let solicitudViaticoComprobacionCargo: SolicitudViaticoComprobacionCargo = this.solicitudViaticoComprobacionCargoFormArray.value.find((cargo: SolicitudViaticoComprobacionCargo) => cargo.solicitudViaticoComprobacionPasajeId == solicitudViaticoComprobacionPasaje.id && cargo.estatusId == ListadoCMM.EstatusRegistro.ACTIVO);
    if(solicitudViaticoComprobacionCargo){
      this.createComprobacionCargoForm(solicitudViaticoComprobacionCargo);
    }

    // Cargar comprobante
    this.cargarComprobacion();

    // Archivo
    this.archivoTipoComprobante = new ArchivoTipoComporbante();
    this.archivoTipoComprobanteOther = new ArchivoTipoComporbante();
    this.archivoTipoComprobanteFormArray.value.filter((_file: ArchivoTipoComporbante) => _file.referenciaId == solicitudViaticoComprobacionDetalle.id && _file.vigente == true).map((_file: ArchivoTipoComporbante) => {
      if (_file.tipoArchivoId == ListadoCMM.Archivo.XML) {
        
        this.archivoTipoComprobante = _file;
        this.solicitudViaticoComprobacionDetalleForm.controls.fileXML.setValue(_file);
      } else {
        this.archivoTipoComprobanteOther = _file;
      }
    });

    // Verify date start viaje
    if(isRM){
     
      this.dateStartViaje = null;
      
      // Cuenta Pago Gasto
      this.cuentasGastoList = [];
      this._informeComprobacionService.getListadoCuentaConTableRM(this.solicitudViatico.ejercicio).then(response => {
        if(response.data.status != 30200){
          // Get Listado de Cuenta
          var cuentasGasto: CuentaGasto[] = response.data.data;

          // Set Cuentas Gasto List
          cuentasGasto.map(cuenta => {
            this.cuentasGastoList.push({id: cuenta.CatalogoCuentaId, cuenta: cuenta.Cuenta, nombre: cuenta.Nombre});
          });
          this.cuentasGastoList = [...this.cuentasGastoList];
        }
      }).catch(() =>{
        this._toastr.error("La cuenta de gasto no esta disponible, inténtelo mas tarde.");
      });
    }else{
      this.dateStartViaje = new Date(this.solicitudViatico.fechaSalida);
      this.dateStartViaje.setHours(0); 
      this.ajustarFechas(!isRM);     
    }

    // Set Factura Importe Max With Factura Nacional (Tipo Comporbante)
    if (solicitudViaticoComprobacionDetalle.tipoComprobanteId == ListadoCMM.TipoComprobante.FACTURA_NACIONAL) {
      this.facturaImporteMax = solicitudViaticoComprobacionDetalle.importe;
      // Download and Load File XML
      this.archivoService.descargarArchivo(this.archivoTipoComprobante.id).then((response: any) => {
        if(response.size > 0){
          this.onFileXMLModoEdit(response);
        }else{
          this.archivoService.descargarArchivoTmp(this.archivoTipoComprobante.nombreArchivoTemporal).then((response2: any) => {
            this.onFileXMLModoEdit(response2);
          }), error => {
            this._toastr.error(GenericService.getError(error).message, 'Error');
          };
        }
      }, error => {
        this._toastr.error(GenericService.getError(error).message, 'Error');
      });

      // Proveedor //
      this.proveedoresList = [];
      this.paisesList = [];
       //By:AGG
       this.jsonProveedor.rfc=this.solicitudViaticoComprobacionDetalleForm.controls.rfc.value;
       this.jsonProveedor.ejercicio=this.solicitudViatico.ejercicio;
       //End By:AGG
      this._informeComprobacionService.searchProveedor(this.jsonProveedor).then(response => {
        if(response.data.proveedor.status != 30200){
          // Get Proveedor and Paises
          var proveedor: Proveedor = response.data.proveedor.data[0];
          var paises: PaisSAACG[] = response.data.paises.data;

          // Set Proveedor ID in Solicitud Viatico Comprobacion Detalle And ProveedoresList
          this.proveedoresList.push({id: proveedor.ProveedorId, razonSocial: proveedor.RazonSocial, rfc: proveedor.RFC, paisId: proveedor.PaisId});
          this.proveedoresList = [...this.proveedoresList];
          
          // Set PaisesList
          paises.map(pais => {
            this.paisesList.push({id: pais.PaisId, nombre: pais.Nombre});
          });
          this.paisesList = [...this.paisesList];
        }
      });
      ///////////////
    }

    // Comprobante Extranjero para el proveedor
    if (solicitudViaticoComprobacionDetalle.tipoComprobanteId == ListadoCMM.TipoComprobante.COMPROBANTE_EXTRANJERO) {
      this.proveedoresList = [];
      this.paisesList = [];
      this._informeComprobacionService.getListadoProveedoresAndPaises(this.solicitudViatico.ejercicio).then(response => {
       
        
        if(response.data.proveedores.status != 30200){
          // Get Proveedores and Paises
          var proveedores: Proveedor[] = response.data.proveedores.data;
          var paises: PaisSAACG[] = response.data.paises.data;

          // Set ProveedoresList
          proveedores.filter(proveedor => proveedor.TipoProveedorId == '05').map(proveedor => {
            this.proveedoresList.push({id: proveedor.ProveedorId, razonSocial: proveedor.RazonSocial, rfc: proveedor.RFC, paisId: proveedor.PaisId});
          });
          this.proveedoresList = [...this.proveedoresList];

          // Set PaisesList
          paises.map(pais => {
            this.paisesList.push({id: pais.PaisId, nombre: pais.Nombre});
          });
          this.paisesList = [...this.paisesList];
        }
      });
    }

    jQuery('.bd-example-modal-lg').modal('show');
    
    setTimeout(() => {
      this.esVisibleArchivo = true
    }, 0);
  }

  habilitarModoComprobanteOrGasto(esEditar: boolean): void{
    if(esEditar){
      // Datos Generales
      this.solicitudViaticoComprobacionDetalleForm.controls.categoriaId.disable();
      this.solicitudViaticoComprobacionDetalleForm.controls.conceptoViaticoId.disable();

      // Datos Comprobante
      this.solicitudViaticoComprobacionDetalleForm.controls.importePesos.disable();
      
      // Factura Nacional
      if(this.solicitudViaticoComprobacionDetalleForm.controls.tipoComprobanteId.value == ListadoCMM.TipoComprobante.FACTURA_NACIONAL){
        // Datos Proveedor
        this.solicitudViaticoComprobacionDetalleForm.controls.proveedorId.disable();
        this.solicitudViaticoComprobacionDetalleForm.controls.proveedorPaisId.disable();
        this.solicitudViaticoComprobacionDetalleForm.controls.razonSocial.disable();
        this.solicitudViaticoComprobacionDetalleForm.controls.rfc.disable();

        // Datos Comprobante
        this.solicitudViaticoComprobacionDetalleForm.controls.fechaComprobante.disable();
        this.solicitudViaticoComprobacionDetalleForm.controls.folio.disable();
        //this.solicitudViaticoComprobacionDetalleForm.controls.numeroPartida.disable();
        this.solicitudViaticoComprobacionDetalleForm.controls.formaPagoId.disable();
        this.solicitudViaticoComprobacionDetalleForm.controls.monedaId.disable();
        this.solicitudViaticoComprobacionDetalleForm.controls.tipoCambio.disable();
        //this.solicitudViaticoComprobacionDetalleForm.controls.importePesos.disable();
      }

      // Comprobante Extranjero
      if(this.solicitudViaticoComprobacionDetalleForm.controls.tipoComprobanteId.value == ListadoCMM.TipoComprobante.COMPROBANTE_EXTRANJERO){
        // Datos Proveedor
        this.solicitudViaticoComprobacionDetalleForm.controls.proveedorId.enable();
        this.solicitudViaticoComprobacionDetalleForm.controls.proveedorPaisId.disable();
        this.solicitudViaticoComprobacionDetalleForm.controls.razonSocial.disable();
        this.solicitudViaticoComprobacionDetalleForm.controls.rfc.disable();
      }
    }else{
       // Datos Generales
      this.solicitudViaticoComprobacionDetalleForm.controls.categoriaId.enable();
      this.solicitudViaticoComprobacionDetalleForm.controls.conceptoViaticoId.enable();

      // Datos Comprobante
      this.solicitudViaticoComprobacionDetalleForm.controls.importe.enable();
      this.solicitudViaticoComprobacionDetalleForm.controls.importePesos.disable();

      if(this.solicitudViaticoComprobacionDetalleForm.controls.tipoComprobanteId.value == ListadoCMM.TipoComprobante.FACTURA_NACIONAL){
        // Datos Proveedor
        this.solicitudViaticoComprobacionDetalleForm.controls.proveedorId.enable();
        this.solicitudViaticoComprobacionDetalleForm.controls.proveedorPaisId.enable();
        this.solicitudViaticoComprobacionDetalleForm.controls.razonSocial.enable();
        this.solicitudViaticoComprobacionDetalleForm.controls.rfc.enable();

        // Datos Comprobante
        this.solicitudViaticoComprobacionDetalleForm.controls.fechaComprobante.enable();
        this.solicitudViaticoComprobacionDetalleForm.controls.folio.enable();
        //this.solicitudViaticoComprobacionDetalleForm.controls.numeroPartida.enable();
        this.solicitudViaticoComprobacionDetalleForm.controls.formaPagoId.enable();
        this.solicitudViaticoComprobacionDetalleForm.controls.monedaId.enable();
        this.solicitudViaticoComprobacionDetalleForm.controls.tipoCambio.enable();
        this.solicitudViaticoComprobacionDetalleForm.controls.importePesos.enable();
      }
    }
  }

  modoComprobar(isComprobar: boolean){
    if(isComprobar){
      this.solicitudViaticoComprobacionPasajeForm.controls.fechaCompra.disable();
      this.solicitudViaticoComprobacionPasajeForm.controls.nombreLinea.disable();
      this.solicitudViaticoComprobacionPasajeForm.controls.viajeRedondo.disable();
      this.solicitudViaticoComprobacionPasajeForm.controls.codigoReservacion.disable();
      this.solicitudViaticoComprobacionPasajeForm.controls.fechaRegreso.disable();
      this.solicitudViaticoComprobacionPasajeForm.controls.fechaSalida.disable();
    }else{
      this.solicitudViaticoComprobacionPasajeForm.controls.fechaCompra.enable();
      this.solicitudViaticoComprobacionPasajeForm.controls.nombreLinea.enable();
      this.solicitudViaticoComprobacionPasajeForm.controls.viajeRedondo.enable();
      this.solicitudViaticoComprobacionPasajeForm.controls.codigoReservacion.enable();
      this.solicitudViaticoComprobacionPasajeForm.controls.fechaRegreso.enable();
      this.solicitudViaticoComprobacionPasajeForm.controls.fechaSalida.enable();
    }
  }

  filterDateSetValue = (date: Date) => {
    return date.setMinutes(5);
  }

  // Event OnChange //
  onChangeConceptoDescripcion(facturaConcepto: FacturaConcepto){
    if(facturaConcepto){
      let _facturaCompartida = this.facturaCompartida.filter(fc => fc.folio == this.solicitudViaticoComprobacionDetalleForm.controls.folio.value && fc.rfc == this.solicitudViaticoComprobacionDetalleForm.controls.rfc.value && fc.numeroPartida == facturaConcepto.id);
      if(_facturaCompartida.length > 0){
        this._toastr.info("Este concepto ya ha sido utilizado en otra comprobación, por lo que el importe del concepto sera compartido.");

        // Rest importe for share
        let _facturaImporteMax: number = parseFloat(facturaConcepto.importeTotal);
        _facturaCompartida.map(fc => {
          _facturaImporteMax -= fc.importePesos;
        });

        // Set Values
        this.facturaImporteMax = parseFloat(_facturaImporteMax.toFixed(2));

      }else{
        // Set Values
        this.facturaImporteMax = parseFloat(parseFloat(facturaConcepto.importeTotal).toFixed(2));
      }
      
      // Set Values
      this.solicitudViaticoComprobacionDetalleForm.controls.importe.setValue(this.moneyPipe.transformNotSymbol(this.facturaImporteMax));
      this.solicitudViaticoComprobacionDetalleForm.controls.importePesos.setValue(this.moneyPipe.transformNotSymbol(this.facturaImporteMax * this.solicitudViaticoComprobacionDetalleForm.controls.tipoCambio.value));
      this.solicitudViaticoComprobacionDetalleForm.controls.conceptoDescripcion.setValue(facturaConcepto.concepto.$.Descripcion);
      this.solicitudViaticoComprobacionDetalleForm.controls.claveProdServ.setValue(facturaConcepto.concepto.$.ClaveProdServ);
      this.solicitudViaticoComprobacionDetalleForm.controls.numeroPartida.setValue(facturaConcepto.id);
      this.solicitudViaticoComprobacionDetalleForm.controls.conceptoImporte.setValue(parseFloat(parseFloat(facturaConcepto.concepto.$.Importe).toFixed(2)));
      this.solicitudViaticoComprobacionDetalleForm.controls.conceptoDescuento.setValue(facturaConcepto.concepto.$.Descuento ? parseFloat(parseFloat(facturaConcepto.concepto.$.Descuento).toFixed(2)) : 0);
      this.solicitudViaticoComprobacionDetalleForm.controls.descuentoComprobacion.setValue(facturaConcepto.concepto.$.Descuento ? parseFloat(parseFloat(facturaConcepto.concepto.$.Descuento).toFixed(2)) : 0);
    }
  }

  onChangeProveedor(event){
    if(event){
      this.solicitudViaticoComprobacionDetalleForm.controls.proveedorId.setValue(event.id);
      this.solicitudViaticoComprobacionDetalleForm.controls.proveedorPaisId.setValue(event.paisId);
      this.solicitudViaticoComprobacionDetalleForm.controls.proveedorPaisId.disable();
      this.solicitudViaticoComprobacionDetalleForm.controls.rfc.setValue(event.rfc);
      this.solicitudViaticoComprobacionDetalleForm.controls.rfc.disable();
      this.solicitudViaticoComprobacionDetalleForm.controls.razonSocial.setValue(event.razonSocial);
      this.solicitudViaticoComprobacionDetalleForm.controls.razonSocial.disable();
    }else{
      this.solicitudViaticoComprobacionDetalleForm.controls.proveedorPaisId.setValue("");
      this.solicitudViaticoComprobacionDetalleForm.controls.proveedorPaisId.enable();
      this.solicitudViaticoComprobacionDetalleForm.controls.rfc.setValue("");
      this.solicitudViaticoComprobacionDetalleForm.controls.rfc.enable();
      this.solicitudViaticoComprobacionDetalleForm.controls.razonSocial.setValue("");
      this.solicitudViaticoComprobacionDetalleForm.controls.razonSocial.enable();
      this.solicitudViaticoComprobacionDetalleForm.controls.proveedorId.setValue(null);
    }
  }

  onChangeFormaComprobacion(event){
    if(event){
      this.cleanFileXML(true);
    }
  }
  /////////////////////

  // Event OnClick //
  onClickNewProveedor(){
    if(this.solicitudViaticoComprobacionDetalleForm.controls.rfc.value && this.solicitudViaticoComprobacionDetalleForm.controls.razonSocial.value && this.solicitudViaticoComprobacionDetalleForm.controls.proveedorPaisId.value){

      this.solicitudViaticoComprobacionDetalleValid = true;

      // Mostrar spinner
      this._spinner.show();
      jQuery('.modal').addClass("pixvs-spinner-modal");

      var newProveedor = new NewProveedor();
      newProveedor.TipoProveedorId = "05";
      newProveedor.PaisId = this.solicitudViaticoComprobacionDetalleForm.controls.proveedorPaisId.value;
      newProveedor.RazonSocial = this.solicitudViaticoComprobacionDetalleForm.controls.razonSocial.value;
      newProveedor.Estatus = "A";
      newProveedor.RFC = this.solicitudViaticoComprobacionDetalleForm.controls.rfc.value;
      newProveedor.TipoOperacionId = "85";
      newProveedor.TipoComprobanteFiscalId = 4;

      this._informeComprobacionService.registerProveedor(newProveedor,this.solicitudViatico.ejercicio).then(response => {
        if(response.data.proveedor.status != 30200){
          // Get and Set Proveedor
          var proveedor: Proveedor = response.data.proveedor.data[0];

          // Set Proveedor ID in Solicitud Viatico Comprobacion Detalle And ProveedoresList
          this.solicitudViaticoComprobacionDetalleForm.controls.proveedorId.setValue(proveedor.ProveedorId);
          this.proveedoresList.push({id: proveedor.ProveedorId, razonSocial: newProveedor.RazonSocial, rfc: newProveedor.RFC, paisId: newProveedor.PaisId});
          this.proveedoresList = [...this.proveedoresList];

          // Disable
          this.solicitudViaticoComprobacionDetalleForm.controls.proveedorPaisId.disable();
          this.solicitudViaticoComprobacionDetalleForm.controls.razonSocial.disable();
          this.solicitudViaticoComprobacionDetalleForm.controls.rfc.disable();
        }else{
          this._toastr.warning('El proveedor ya esta registrado',"Atención");
        }
        // Ocultar spinner
        this._spinner.hide();
        jQuery('.modal').removeClass("pixvs-spinner-modal");
      }, error => {

        // Ocultar spinner
        this._spinner.hide();
        jQuery('.modal').removeClass("pixvs-spinner-modal");
      });

    }else{
      this.solicitudViaticoComprobacionDetalleValid = false;
      this._toastr.info("LLena todos los campos requeridos","Atención");
    }
  }
  ////////////////////

  // Event OnOpen //
  onOpenProveedor(){
    if(this.proveedoresList.length == 0){
      this._toastr.warning('No  existe proveedor, agrega uno nuevo dando click al botón "Nuevo"', 'Atención');
    }
  }
  ///////////////////

  // Funciones //
  redondeos2decimales(value: string | number): number{
    switch (typeof value) {
			case 'number':
				value = value.toString();
			  break;
		}
    return parseFloat(parseFloat(value).toFixed(2));
  }

  dividirMonto(event,calcular)
  {
    try {
      let code = (event.which) ? event.which : event.keyCode;     
     
      if(calcular==false){
        if(isNaN(parseFloat(event.key)) && (event.key!="Enter" && code!=9 && code!=8 && code!=37 && code!=38 && code!=39 && code!=40 && code!=46 && code!=190 && code!=55)){                 
          return false; 
        }
      }
     
      if (event.key === "Enter" || calcular) 
      {
        let re = /(^[1-9]\d*\.(\d{1,1})?)(.\/)[1-9]$/;
        let numerosOperar:string[];
        if(event.target.value.includes("/")){
          numerosOperar=event.target.value.replace("$","").replace(",","").split("/");
          if(!numerosOperar[0].includes(".")){
            numerosOperar[0]=numerosOperar[0]+".00";
          }
        
          if(numerosOperar[1]==""){
            numerosOperar[1]="1";
          }
          if((numerosOperar[0]+"/"+numerosOperar[1]).match(re)){
            let montDiv:number=(parseFloat(numerosOperar[0])/parseFloat(numerosOperar[1]));
            let importe:number=this.solicitudViaticoComprobacionDetalleForm.controls.tipoCambio.value * montDiv;
        
            this.solicitudViaticoComprobacionDetalleForm.controls.importe.setValue(this.moneyPipe.transform(montDiv));            
            this.solicitudViaticoComprobacionDetalleForm.controls.importePesos.setValue(this.moneyPipe.transformNotSymbol(importe * this.solicitudViaticoComprobacionDetalleForm.controls.tipoCambio.value));
            this.importe= this.solicitudViaticoComprobacionDetalleForm.controls.importe.value;
          }
        }       
      }
    } catch (error) {
      this._toastr.error(GenericService.getError(error).message);
    }         
  }
  //////////
}


