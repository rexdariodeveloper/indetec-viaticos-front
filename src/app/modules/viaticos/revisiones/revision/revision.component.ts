import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { SolicitudResumenComponent } from '../../solicitudes/solicitud_resumen/solicitud_resumen.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { RevisionComponentService } from './revision.service';
import { SolicitudViatico } from '@models/solicitud_viatico';
import { GenericService } from '@services/generic.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AsignacionViatico } from '@models/asignacionViatico';
import { AsignacionPasaje } from '@models/asignacionPasaje';
import { SolicitudViaticoComprobacion } from '@models/solicitud_viatico_comprobacion';
import { SolicitudViaticoComprobacionDetalle } from '@models/solicitud_viatico_comprobacion_detalle';
import { SolicitudViaticoComprobacionPasaje } from '@models/solicitud_viatico_comprobacion_pasaje';
import { SolicitudViaticoComprobacionCargo } from '@models/solicitud_viatico_comprobacion_cargo';
import { ListadoCMM } from '@models/mapeos/listadoCMM';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { Archivo, ArchivoTipoComporbante } from '@models/archivo';
import { ArchivoService } from '@services/archivo.service';
import { SolicitudViaticoComprobacionDetalleValidacion } from '@models/solicitud_viatico_comprobacion_detalle_validacion';
import  * as PolizaComprobacion from '@models/saacg/poliza_comprobacion';
import { SolicitudViaticoComprobacionDetalleImpuesto } from '@models/solicitud_viatico_comprobacion_detalle_impuesto';
import { Moneda } from '@models/moneda';
import { Listado_CMM } from '@models/listado_cmm';
import { FechaPipe } from 'app/pipes/fecha.pipe';
import { ConceptoViatico } from '@models/concepto_viatico';
import { ControlesMaestrosMultiples } from '@models/mapeos/controles_maestros_multiples';
import { JsonpClientBackend } from '@angular/common/http';
import { MoneyPipe } from 'app/pipes/money.pipe'; //Changes Memo
moment.locale('es');

@Component({
  selector: 'app-revision',
  templateUrl: './revision.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./revision.component.scss']
})
export class RevisionComponent implements OnInit, OnDestroy, AfterViewInit {

  // View Solicitud Viatico
  @ViewChild(SolicitudResumenComponent, { static: false }) solicitudResumenComponent;


  //////////////////////////////////////
  ///// Variable Model
  //////////////////////////////////////
  // Solicitud Viatico
  solicitudViatico: SolicitudViatico;

  // Solicitud Viatico Asignacion Viatico
  solicitudViaticoAsignacionViatico: AsignacionViatico[];

  // Solicitud Viatico Asignacion Pasaje
  solicitudViaticoAsignacionPasaje: AsignacionPasaje[];

  // Solicitud Viatico Comprobacion
  solicitudViaticoComprobacion: SolicitudViaticoComprobacion;

  // Solicitud Viatico Comprobacion Detalle
  solicitudViaticoComprobacionDetalle: SolicitudViaticoComprobacionDetalle[];
  solicitudViaticoComprobacionDetalleComprobacionDataTable: SolicitudViaticoComprobacionDetalle[];
  solicitudViaticoComprobacionDetalleRMDataTable: SolicitudViaticoComprobacionDetalle[];

  // Solicitud Viatico Comprobacion Detalle Impuesto
  solicitudViaticoComprobacionDetalleImpuesto: SolicitudViaticoComprobacionDetalleImpuesto[];

  // Solicitud Viatico Comprobacion Pasaje
  solicitudViaticoComprobacionPasaje: SolicitudViaticoComprobacionPasaje[];

  // Solicitud Viatico Comprobacion Cargo
  solicitudViaticoComprobacionCargo: SolicitudViaticoComprobacionCargo[];

  // Listado CMM EstatusSolicitud
  estatusSolicitud = ListadoCMM.EstatusSolicitud;

  // Solicitud Viatico Comprobacion Detalle Validacion
  solicitudViaticoComprobacionDetalleValidacion: SolicitudViaticoComprobacionDetalleValidacion[];

  // Archivo //
  archivo: Archivo[];

  // Moneda //
  moneda: Moneda[];

  // Forma Pago //
  formaPago: Listado_CMM[];

  // Concepto Viatico //
  conceptoViatico: ConceptoViatico[];

  //Changes Memo
  arrayDelService: any[] = [];
  public comprobacionesConBalance = new Array();
  private comprobaciones = new Array();


  private alertaId: number;
  public motivo: string = null;
  public mostrarAcciones: boolean;
  public esCancelacion: boolean=false;
  public minFechaPolizaComprobacion:Date=null;
  public maxFechaPolizaComprobacion:Date=null;
  public startAt:Date=null;
  public fechaPolizaVaida:boolean=true;
  private fechaPolizaComprobaicon:Date=null;

  //////////////////////////////////////

  //////////////////////////////////////
  ///// Variable
  //////////////////////////////////////

  // Viatico
  viatico: {
    montoComision: number,
    montoTransferido: number,
    gastoComprobado: number,
    reintegro: number
  } = {
      montoComision: 0,
      montoTransferido: 0,
      gastoComprobado: 0,
      reintegro: 0
    }

  // Pasaje
  pasaje: {
    montoComision: number,
    montoTransferido: number,
    gastoComprobado: number,
    reintegro: number
  } = {
      montoComision: 0,
      montoTransferido: 0,
      gastoComprobado: 0,
      reintegro: 0
    }

  // Total Comision
  totalComision: {
    totalComision: number,
    viatico: number,
    pasaje: number,
  } = {
      totalComision: 0,
      viatico: 0,
      pasaje: 0,
    }

  // Solicitante
  solicitante: {
    solicitante: number,
    viatico: number,
    pasaje: number,
  } = {
      solicitante: 0,
      viatico: 0,
      pasaje: 0,
    }

  // Recursos Materiales
  recursosMateriales: {
    recursosMateriales: number,
    viatico: number,
    pasaje: number,
    sinComprobante: number,
    conComprobante: number,
    totalComision: number
  } = {
      recursosMateriales: 0,
      viatico: 0,
      pasaje: 0,
      sinComprobante: 0,
      conComprobante: 0,
      totalComision: 0
    }

  // Gasto Solicitante
  gastoSolicitante: {
    gastoSolicitante: number,
    conComprobante: number,
    sinComprobante: number,
    reintegro: number
  } = {
      gastoSolicitante: 0,
      conComprobante: 0,
      sinComprobante: 0,
      reintegro: 0,
    }

  // Gasto RM
  gastoRM: {
    gastoRM: number,
    conComprobante: number,
    sinComprobante: number,
  } = {
      gastoRM: 0,
      conComprobante: 0,
      sinComprobante: 0,
    }

  // Total Comprobado
  totalComprobado: {
    totalComprobado: number,
    solicitante: number,
    rm: number
  } = {
      totalComprobado: 0,
      solicitante: 0,
      rm: 0
    }

  // Comprobacion
  comprobacion: {
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


  //////////////////////////////////////

  //UnsubscribeAll
  private unsubscribeAll: Subject<any>;

  constructor(
    private _spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private _revisionService: RevisionComponentService,
    private router: Router,
    private archivoService: ArchivoService,
    private moneyPipe: MoneyPipe,//Changes Memo
    private fechaPipe: FechaPipe
    ) {
    this.unsubscribeAll = new Subject();
  }

  ngOnInit() {
    this.loadRevision();    
  }

  ngOnDestroy() {
    // Unsubscribe from all subscriptions
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }

  ngAfterViewInit(): void {
    this.solicitudResumenComponent.cargaSolicitud(parseInt(this._revisionService.routeParams.id));    
  }

  clean() {

    //Changes Memo
    this.comprobacionesConBalance = new Array();
    this.comprobaciones = new Array();

    // Solicitud Viatico
    this.solicitudViatico = null;

    // Solicitud Viatico Asignacion Viatico
    this.solicitudViaticoAsignacionViatico = [];

    // Solicitud Viatico Asignacion Pasaje
    this.solicitudViaticoAsignacionPasaje = [];

    // Solicitud Viatico Comprobacion
    this.solicitudViaticoComprobacion = null;

    // Solicitud Viatico Comprobacion Detalle
    this.solicitudViaticoComprobacionDetalle = [];
    this.solicitudViaticoComprobacionDetalleComprobacionDataTable = [];
    this.solicitudViaticoComprobacionDetalleRMDataTable = [];

    // Solicitud Viatico Comprobacion Detalle Impuesto
    this.solicitudViaticoComprobacionDetalleImpuesto = [];

    // Solicitud Viatico Comprobacion Pasaje
    this.solicitudViaticoComprobacionPasaje = [];

    // Solicitud Viatico Comprobacion Cargo
    this.solicitudViaticoComprobacionCargo = [];

    // Archivo
    this.archivo = [];

    // Solicitud Viatico Comprobacion Detalle Validacion
    this.solicitudViaticoComprobacionDetalleValidacion = [];

    // Moneda
    this.moneda = [];

    // Forma Pago
    this.formaPago = [];

    // Concepto Viatico
    this.conceptoViatico = [];

  }

  loadRevision() {
    this._spinner.show();
    this._revisionService.onRevisionChanged.pipe(takeUntil(this.unsubscribeAll)).subscribe(response => {
      if (response.status == 200) {
        // Clean all
        this.clean();

        // Solicitud Viatico
        this.solicitudViatico = this._revisionService.solicitudViatico;

       //Fecha inicial componente FechaPoliza
       this.startAt=new Date(this._revisionService.solicitudViatico.fechaSalida);

       //Fecha minima para generar la poliza de comrobación
        //Date fechaMin=this._revisionService.solicitudViaticoComprobacion.fechaPolizaComprobacion;
        if(this._revisionService.solicitudViaticoComprobacion.fechaPolizaComprobacion!=null){
          this.minFechaPolizaComprobacion=new Date(this._revisionService.solicitudViaticoComprobacion.fechaPolizaComprobacion);
        }else
        {
          this.minFechaPolizaComprobacion=new Date(this._revisionService.solicitudViatico.fechaSalida);
        }
        this.minFechaPolizaComprobacion=new Date(this.minFechaPolizaComprobacion.toDateString());
        // console.log(this.minFechaPolizaComprobacion);
        // console.log(this.minFechaPolizaComprobacion.toDateString());

        //console.log(this._revisionService.solicitudViaticoComprobacion.fechaPolizaComprobacion);
        
       //Fecha maxima para generar la poliza de comrobación
       this.maxFechaPolizaComprobacion=new Date( new Date(this._revisionService.solicitudViatico.ejercicio,11,31));

        // Solicitud Viatico Asignacion Viatico
        this.solicitudViaticoAsignacionViatico = this._revisionService.solicitudViaticoAsignacionViatico;

        // Solicitud Viatico Asignacion Pasaje
        this.solicitudViaticoAsignacionPasaje = this._revisionService.solicitudViaticoAsignacionPasaje;

        // Solicitud Viatico Comprobacion
        this.solicitudViaticoComprobacion = this._revisionService.solicitudViaticoComprobacion;

        if(this.solicitudViaticoComprobacion.solicitudViatico.estatusId==ListadoCMM.EstatusSolicitud.REVISADA){
          this.esCancelacion=true;
        }
    
        // Solicitud Viatico Comprobacion Detalle
        this.solicitudViaticoComprobacionDetalle = this._revisionService.solicitudViaticoComprobacionDetalle;
        this.solicitudViaticoComprobacionDetalleComprobacionDataTable = this.solicitudViaticoComprobacionDetalle.filter(comprobacion => comprobacion.estatusId == ListadoCMM.EstatusRegistro.ACTIVO && comprobacion.esComprobadoPorRM == false);
        this.solicitudViaticoComprobacionDetalleRMDataTable = this.solicitudViaticoComprobacionDetalle.filter(comprobacion => comprobacion.estatusId == ListadoCMM.EstatusRegistro.ACTIVO && comprobacion.esComprobadoPorRM == true);

        // Solicitud Viatico Comprobacion Detalle Impuesto
        this.solicitudViaticoComprobacionDetalleImpuesto = this._revisionService.solicitudViaticoComprobacionDetalleImpuesto;

        // Solicitud Viatico Comprobacion Pasaje
        this.solicitudViaticoComprobacionPasaje = this._revisionService.solicitudViaticoComprobacionPasaje;

        // Solicitud Viatico Comprobacion Cargo
        this.solicitudViaticoComprobacionCargo = this._revisionService.solicitudViaticoComprobacionCargo;
       
        // Revision Calculator
        this.revisionCalculator();

        // Archivo //
        this.archivo = this._revisionService.archivo;

        // Solicitud Viatico Comprobacion Detalle Validacion
        this.solicitudViaticoComprobacionDetalleValidacion = this._revisionService.solicitudViaticoComprobacionDetalleValidacion;

        // Moneda
        this.moneda = this._revisionService.moneda;

        // Forma Pago
        this.formaPago = this._revisionService.formaPago;

        // Concepto Viatico
        this.conceptoViatico = this._revisionService.conceptoViatico;

        this.mostrarAcciones = this._revisionService.mostrarAcciones;

        this.alertaId = this._revisionService.alertaId;

        this._spinner.hide();
      }
    }, error => {
      //Ocultamos el spinner
      this._spinner.hide();

      //Mostramos error 
      this.toastr.error(GenericService.getError(error).message);
    });
    
  }

  //Changes Memo
  calcularBalanceViaticos(){
   this.solicitudViaticoAsignacionViatico.filter(asignacion => asignacion.montoPorTransferir > 0).map(concepto => {
    this.comprobacionesConBalance.push({
      ConceptoViaticoId:concepto.conceptoViatico.id,
      ConceptoViaticoNombre:concepto.conceptoViaticoNombre,
      MontoAsignado:this.moneyPipe.transformNotSymbol(concepto.montoPorTransferir),
      MontoComprobado:0,
      Balance:concepto.montoPorTransferir
    });      
  });

    this.comprobaciones.forEach( (comprobacion) => {
      if(comprobacion.conceptoViaticoId){
          let concepto=this.comprobacionesConBalance.find(_comprobacion=>_comprobacion.ConceptoViaticoId==comprobacion.conceptoViaticoId);
 
          if(concepto){
              concepto.MontoComprobado +=  parseFloat(this.moneyPipe.transformNotSymbol(comprobacion.importe));  
              concepto.Balance=  (parseFloat(this.moneyPipe.transformNotSymbol(concepto.MontoAsignado))-parseFloat(concepto.MontoComprobado)).toFixed(2);
          }   
      }   
      });

}

  revisionCalculator() {

     //Changes Memo
    this.comprobaciones=[];
    this.comprobacionesConBalance=[];

    // Solicitud Viatico Asignacion Viatico
    this.solicitudViaticoAsignacionViatico.map(viatico => {
      // Viatico -> Monto Comision
      this.viatico.montoComision += viatico.montoPorTransferir;

      // Viatico -> Total Transferido
      this.viatico.montoTransferido += viatico.montoPorTransferir;

      // Total Comision -> Viatico
      this.totalComision.viatico += viatico.montoPorTransferir;

      // Solicitante -> Viatico
      this.solicitante.viatico += viatico.montoPorTransferir;

    });

    // Solicitud Viatico Asignacion Pasaje
    this.solicitudViaticoAsignacionPasaje.map(pasaje => {

      // Pasaje -> Monto Comision
      this.pasaje.montoComision += pasaje.costo;

      // Total Comision -> Viatico
      this.totalComision.pasaje += pasaje.costo;

      // Asignar a funcionario
      if (pasaje.asignadoAFuncionario) {
        // Pasaje -> Total Transferido
        this.pasaje.montoTransferido += pasaje.costo;

        // Solicitante -> Pasaje
        this.solicitante.pasaje += pasaje.costo;
      }

    });

    // Solicitud Viatico Comprobacion Detalle with esComprobadoPorRM = false
    this.solicitudViaticoComprobacionDetalle.filter(comprobacion => comprobacion.esComprobadoPorRM == false && comprobacion.estatusId == ListadoCMM.EstatusRegistro.ACTIVO).map(comprobacion => {

      //Changes Memo
      this.comprobaciones.push(comprobacion);

      // Categoria: Viatico y Pasaje
      if (comprobacion.categoriaId == ListadoCMM.CategoriaViatico.VIATICO || comprobacion.categoriaId == ListadoCMM.CategoriaViatico.PASAJE) {

        // Viatico
        if (comprobacion.categoriaId == ListadoCMM.CategoriaViatico.VIATICO) {
          // Viatico -> Gasto Comprobado
          this.viatico.gastoComprobado += comprobacion.importePesos;

          // Total Comision -> Viatico
          //this.totalComision.viatico += comprobacion.importePesos;
        }

        // Pasaje
        if (comprobacion.categoriaId == ListadoCMM.CategoriaViatico.PASAJE) {
          // Pasaje -> Gasto Comprobado
          this.pasaje.gastoComprobado += comprobacion.importePesos;

          // Total Comision -> Pasaje
          //this.totalComision.pasaje += comprobacion.importePesos;
        }

        if (comprobacion.tipoComprobanteId == ListadoCMM.TipoComprobante.FACTURA_NACIONAL) {
          // Gasto Solicitante -> Gastos Con Comprobante
          this.gastoSolicitante.conComprobante += comprobacion.importePesos;

          // Comprobacion -> Con Comprobante
          this.comprobacion.conComprobante += comprobacion.importePesos;
        }

        // Tipo Comprobante: Sin Comprobante and Comprobante Extranjero
        if (comprobacion.tipoComprobanteId == ListadoCMM.TipoComprobante.SIN_COMPROBANTE || comprobacion.tipoComprobanteId == ListadoCMM.TipoComprobante.COMPROBANTE_EXTRANJERO) {

          // Gasto Solicitante -> Gastos Sin Comprobante
          this.gastoSolicitante.sinComprobante += comprobacion.importePesos;

          // Comprobacion -> Sin Comprobante
          this.comprobacion.sinComprobante += comprobacion.importePesos;

        }
      }

      // Categoria: Reintegro
      if (comprobacion.categoriaId == ListadoCMM.CategoriaViatico.REINTEGRO) {

        // Gasto Solicitante -> Reintegro
        this.gastoSolicitante.reintegro += comprobacion.importePesos;

        // Comprobacion -> Reintegro
        this.comprobacion.reintegro += comprobacion.importePesos;
      }
    });

    // Viatico -> Reintegro
    this.viatico.reintegro = this.viatico.montoTransferido - this.viatico.gastoComprobado;
    // Pasaje -> Reintegro
    this.pasaje.reintegro = this.pasaje.montoTransferido - this.pasaje.gastoComprobado;

    // Solicitud Viatico Comprobacion Detalle with esComprobadoPorRM = true / Recursos Materiales
    this.solicitudViaticoComprobacionDetalle.filter(comprobacion => comprobacion.esComprobadoPorRM == true && comprobacion.estatusId == ListadoCMM.EstatusRegistro.ACTIVO).map(comprobacion => {

      // Viatico
      if (comprobacion.categoriaId == ListadoCMM.CategoriaViatico.VIATICO) {
        // Total Comision -> Viatico
        //this.totalComision.viatico += comprobacion.importePesos;

        // Solicitante -> Viatico
        //this.solicitante.viatico +=  comprobacion.importePesos;

        // Recursos Materiales -> Viatico
        this.recursosMateriales.viatico += comprobacion.importePesos;
      }

      // Pasaje
      if (comprobacion.categoriaId == ListadoCMM.CategoriaViatico.PASAJE) {
        // Total Comision -> Pasaje
       // this.totalComision.pasaje += comprobacion.importePesos;

        // Recursos Materiales -> Pasaje
        this.recursosMateriales.pasaje += comprobacion.importePesos;

      }

      // Tipo Comprobante: Con Comprobante
      if (comprobacion.tipoComprobanteId == ListadoCMM.TipoComprobante.FACTURA_NACIONAL) {

        // Gasto RM -> Con Comprobante
        this.gastoRM.conComprobante += comprobacion.importePesos;

        // Recursos Materiales -> Con Comprobante
        this.recursosMateriales.conComprobante += comprobacion.importePesos;
      }

      // Tipo Comprobante: Sin Comprobante and Comprobante Extranjero
      if (comprobacion.tipoComprobanteId == ListadoCMM.TipoComprobante.SIN_COMPROBANTE || comprobacion.tipoComprobanteId == ListadoCMM.TipoComprobante.COMPROBANTE_EXTRANJERO) {

        // Gasto RM -> Sin Comprobante
        this.gastoRM.sinComprobante += comprobacion.importePesos;

        // Total Comprobado -> RM
        this.totalComprobado.rm += comprobacion.importePesos;

        // Recursos Materiales -> Sin Comprobante
        this.recursosMateriales.sinComprobante += comprobacion.importePesos;
      }

      // Recursos Materiales -> Total Comision
      this.recursosMateriales.totalComision += comprobacion.importePesos;

    });

    // Total Comision -> Total Comision
    this.totalComision.totalComision = this.totalComision.viatico + this.totalComision.pasaje;

    // Solicitante -> Solicitante
    this.solicitante.solicitante = this.solicitante.viatico + this.solicitante.pasaje;

    // Recursos Materiales -> Recursos Materiales
    this.recursosMateriales.recursosMateriales += this.recursosMateriales.viatico + this.recursosMateriales.pasaje;

    // Gasto Solicitante -> Gasto Solicitante
    this.gastoSolicitante.gastoSolicitante = this.gastoSolicitante.conComprobante + this.gastoSolicitante.sinComprobante + this.gastoSolicitante.reintegro;

    // Gasto RM -> Gasto RM
    this.gastoRM.gastoRM = this.gastoRM.conComprobante + this.gastoRM.sinComprobante;

    // Total Comprobado -> Solicitante
    this.totalComprobado.solicitante = this.gastoSolicitante.gastoSolicitante;

    // Total Comprobado -> Solicitante
    this.totalComprobado.rm = this.gastoRM.gastoRM;

    // Total Comprobado -> Total Comprobado
    this.totalComprobado.totalComprobado = this.totalComprobado.solicitante + this.totalComprobado.rm;

    // Comprobacion -> Total Transferido
    this.comprobacion.totalTransferido = this.viatico.montoTransferido + this.pasaje.montoTransferido;

    // Comprobacion -> Total Comision
    this.comprobacion.totalComision = this.comprobacion.conComprobante + this.comprobacion.sinComprobante;

    // Comprobacion -> Balance
    this.comprobacion.balance = this.comprobacion.totalTransferido - this.comprobacion.totalComision - this.comprobacion.reintegro;

    // With Redondeo //
    // Viatico
    this.viatico.montoComision = parseFloat(this.viatico.montoComision.toFixed(2));
    this.viatico.gastoComprobado = parseFloat(this.viatico.gastoComprobado.toFixed(2));
    this.viatico.montoTransferido = parseFloat(this.viatico.montoTransferido.toFixed(2));
    this.viatico.reintegro = parseFloat(this.viatico.reintegro.toFixed(2));

    // Pasaje
    this.pasaje.montoComision = parseFloat(this.pasaje.montoComision.toFixed(2));
    this.pasaje.gastoComprobado = parseFloat(this.pasaje.gastoComprobado.toFixed(2));
    this.pasaje.montoTransferido = parseFloat(this.pasaje.montoTransferido.toFixed(2));
    this.pasaje.reintegro = parseFloat(this.pasaje.reintegro.toFixed(2));

    // Comprobacion
    this.comprobacion.sinComprobante = parseFloat(this.comprobacion.sinComprobante.toFixed(2));
    this.comprobacion.conComprobante = parseFloat(this.comprobacion.conComprobante.toFixed(2));
    this.comprobacion.totalComision = parseFloat(this.comprobacion.totalComision.toFixed(2));
    this.comprobacion.balance = parseFloat(this.comprobacion.balance.toFixed(2));
    this.comprobacion.reintegro = parseFloat(this.comprobacion.reintegro.toFixed(2));
    this.comprobacion.totalTransferido = parseFloat(this.comprobacion.totalTransferido.toFixed(2));

    // Total Comision
    this.totalComision.viatico = parseFloat(this.totalComision.viatico.toFixed(2));
    this.totalComision.pasaje = parseFloat(this.totalComision.pasaje.toFixed(2));
    this.totalComision.totalComision = parseFloat(this.totalComision.totalComision.toFixed(2));

    // Solicitante
    this.solicitante.viatico = parseFloat(this.solicitante.viatico.toFixed(2));
    this.solicitante.pasaje = parseFloat(this.solicitante.pasaje.toFixed(2));
    this.solicitante.solicitante = parseFloat(this.solicitante.solicitante.toFixed(2));

    // Recursos Materiales
    this.recursosMateriales.recursosMateriales = parseFloat(this.recursosMateriales.recursosMateriales.toFixed(2));
    this.recursosMateriales.viatico = parseFloat(this.recursosMateriales.viatico.toFixed(2));
    this.recursosMateriales.pasaje = parseFloat(this.recursosMateriales.pasaje.toFixed(2));
    this.recursosMateriales.sinComprobante = parseFloat(this.recursosMateriales.sinComprobante.toFixed(2));
    this.recursosMateriales.conComprobante = parseFloat(this.recursosMateriales.conComprobante.toFixed(2));
    this.recursosMateriales.totalComision = parseFloat(this.recursosMateriales.totalComision.toFixed(2));

    // Gasto Solicitante
    this.gastoSolicitante.gastoSolicitante = parseFloat(this.gastoSolicitante.gastoSolicitante.toFixed(2));
    this.gastoSolicitante.sinComprobante = parseFloat(this.gastoSolicitante.sinComprobante.toFixed(2));
    this.gastoSolicitante.conComprobante = parseFloat(this.gastoSolicitante.conComprobante.toFixed(2));
    this.gastoSolicitante.reintegro = parseFloat(this.gastoSolicitante.reintegro.toFixed(2));

    // Gasto RM
    this.gastoRM.gastoRM = parseFloat(this.gastoRM.gastoRM.toFixed(2));
    this.gastoRM.sinComprobante = parseFloat(this.gastoRM.sinComprobante.toFixed(2));
    this.gastoRM.conComprobante = parseFloat(this.gastoRM.conComprobante.toFixed(2));

    // Total Comprobado
    this.totalComprobado.solicitante = parseFloat(this.totalComprobado.solicitante.toFixed(2));
    this.totalComprobado.rm = parseFloat(this.totalComprobado.rm.toFixed(2));
    this.totalComprobado.totalComprobado = parseFloat(this.totalComprobado.totalComprobado.toFixed(2));
    ///////////////////

    //Changes Memo
    this.calcularBalanceViaticos();
  }

  //////////////////////////////////////
  ///// Other
  //////////////////////////////////////

  getInfoFile(row: SolicitudViaticoComprobacionDetalle, tipoArchivoId: number): string {
    const file = this.archivo.find(file => file.referenciaId == row.id && file.vigente == true && (tipoArchivoId == ListadoCMM.Archivo.XML ? file.tipoArchivoId == ListadoCMM.Archivo.XML : file.tipoArchivoId != ListadoCMM.Archivo.XML));
    if (file) {
      return file.nombreFisico + file.nombreOriginal;
    }
    return '';
  }

  // Convert Money Decimal $0.00
  convertToDecimal(money: number): String {
    return "$" + money.toFixed(2);
  }

  convertDateFormat(date): string {
    let dateFechaComprobante: string = '';
    if (date != '') {
      //dateFechaComprobante = moment(date).format('MMM D, YYYY');
      dateFechaComprobante = this.fechaPipe.transform(date, true, false);
    }
    return dateFechaComprobante;
  }

  goBack() {
    this.router.navigate(['app/viaticos/revisiones/']);
  }

  downloadFile(row: SolicitudViaticoComprobacionDetalle, tipoArchivoId: number): boolean {
    const file = this.archivo.find(_file => _file.referenciaId == row.id && (tipoArchivoId == ListadoCMM.Archivo.XML ? _file.tipoArchivoId == ListadoCMM.Archivo.XML : _file.tipoArchivoId != ListadoCMM.Archivo.XML));
    if (file) {
      this.archivoService.descargarArchivo(file.id).then((response: any) => {
        let extension = file.rutaFisica.substr(file.rutaFisica.indexOf('.'));
        this.archivoService.descargarBlob(response, file.nombreFisico + file.nombreOriginal, extension);

      }, error => {
        this.toastr.error(GenericService.getError(error).message, 'Error');
      });
      return;
    }
    return true;
  }

  seeFile(row: SolicitudViaticoComprobacionDetalle, tipoArchivoId: number): boolean {
    const file = this.archivo.find(_file => _file.referenciaId == row.id && (tipoArchivoId == ListadoCMM.Archivo.XML ? _file.tipoArchivoId == ListadoCMM.Archivo.XML : _file.tipoArchivoId != ListadoCMM.Archivo.XML));
    if (file) {
      this.archivoService.descargarArchivo(file.id).then((response: any) => {
        let extension = file.rutaFisica.substr(file.rutaFisica.indexOf('.'));
        let url = this.archivoService.generarURLTmp(response, extension);
        window.open(url);
      }, error => {
        this.toastr.error(GenericService.getError(error).message, 'Error');
      });
      return;
    }

    return true;
  }

  validateDate(idElement:string):boolean{  
    let fechaComprobacion=jQuery("input[id=" + idElement + "]").val()  
    if(fechaComprobacion!=""){
      this.fechaPolizaComprobaicon=new Date(fechaComprobacion);
     
      this.fechaPolizaVaida=true;
      return this.fechaPolizaVaida;
    }else{      
      this.fechaPolizaVaida=false;
      return this.fechaPolizaVaida;
    }   
  }

  finalizar(): void {
    this.guardar(this.estatusSolicitud.REVISADA);
  }

  autorizar(): void {
    this._spinner.show();
    this._revisionService.autorizar(this.alertaId).then(
      response => {
        this._spinner.hide();
        if (response.status == 200) {
          this.toastr.success(response.message);
          this.goBack();
        }
      }, error => {
        this._spinner.hide();
        this.toastr.error(GenericService.getError(error).message);
      }
    );
  }

  revision(): void {
    if (this.solicitudViatico.estatusId == this.estatusSolicitud.EN_PROCESO_AUTORIZACION_REVISION) {
      this._revisionService.revision(this.motivo, this.alertaId).then(
        response => {
          this._spinner.hide();
          if (response.status == 200) {
            this.toastr.success(response.message);
            this.goBack();
          }
        }, error => {
          this._spinner.hide();
          this.toastr.error(GenericService.getError(error).message);
        }
      );
    } else {
      this.guardar(this.estatusSolicitud.EN_PROCESO_AUTORIZACION_REVISION);
    }
  }

  guardar(estatus: number): void {
    let estatusTmp = this.solicitudViatico.estatusId;
    this.solicitudViatico.estatusId = estatus;

    // Create JSON to send
    let json: any = { 
      solicitud: this.solicitudViatico, 
      motivo: this.motivo
    };

    // When the status is REVISADA for Poliza Comprobacion
    if(estatus == ListadoCMM.EstatusSolicitud.REVISADA){
      let polizaComprobacion = this.polizaComprobacion();
      json.polizaComprobacion = polizaComprobacion;
      json.ejercicio = this.solicitudViatico.ejercicio;
    }

    // Mostramos
    this._spinner.show();

    this._revisionService.saveRevision(json).then(response => {
      // Ocultamos
      this._spinner.hide();

      if (response.status == 200) {
        this.toastr.success(response.message);
        this.goBack();
      }
    }, error => {
      this.solicitudViatico.estatusId = estatusTmp;
      
      // Ocultamos
      this._spinner.hide();
      this.toastr.error(GenericService.getError(error).message);
    });
  }

  polizaComprobacion(): string{
    // Poliza Comprobacion
      // Create JSON send Poliza Comprobacion and Data
      let polizaComprobacion = new PolizaComprobacion.PolizaComprobacion();
      
      polizaComprobacion.FechaComprobacion = new Date(this.fechaPolizaComprobaicon);
    
      polizaComprobacion.SolicitudViaticoId = this.solicitudViatico.id;
      polizaComprobacion.Estatus = "A";

      // Nacional
      this.solicitudViaticoComprobacionDetalle.filter(comprobacion => comprobacion.tipoComprobanteId == ListadoCMM.TipoComprobante.FACTURA_NACIONAL && comprobacion.estatusId == ListadoCMM.EstatusRegistro.ACTIVO).map(comprobacion =>{
        let nacional = new PolizaComprobacion.FacturaViaticanteAndRM();
        let conceptoViatico = this.conceptoViatico.find(cv => cv.id == comprobacion.conceptoViaticoId);
        nacional.ConceptoViaticoId = comprobacion.conceptoViaticoId;
        nacional.ConceptoViaticoNombre = conceptoViatico.concepto;
        nacional.ObjetoGastoId = conceptoViatico.objetoGastoId;
        nacional.ProveedorId = comprobacion.proveedorId;
        nacional.FolioFactura = comprobacion.folio;
        nacional.FormaPago = this.formaPago.find(fp => fp.id == comprobacion.formaPagoId) ? this.formaPago.find(fp => fp.id == comprobacion.formaPagoId).valor : '';
        nacional.TotalFactura = comprobacion.totalFactura;
        nacional.SubTotalComprobacion = comprobacion.subTotalComprobacion;
        nacional.TotalComprobacion = comprobacion.importePesos;
        nacional.Descuento = comprobacion.descuentoComprobacion ? comprobacion.descuentoComprobacion : 0;
        nacional.Comentarios = comprobacion.comentarios;
        
        // Impuestos
        this.solicitudViaticoComprobacionDetalleImpuesto.filter(impuesto => impuesto.solicitudViaticoComprobacionDetalleId == comprobacion.id && impuesto.estatusId == ListadoCMM.EstatusRegistro.ACTIVO).map(impuesto =>{
          // Traslado
          if(impuesto.tipoImpuestoId == ListadoCMM.NodoImpuesto.TRASLADO){
            // IVA
            if(impuesto.impuestoId == ListadoCMM.TipoImpuesto.IVA){
              nacional.Impuestos.IVATasaOCuota = impuesto.tasaOCuota;
              nacional.Impuestos.IVAComprobacion = impuesto.impuestoComprobado;
            }
            // IEPS
            if(impuesto.impuestoId == ListadoCMM.TipoImpuesto.IEPS){
              nacional.Impuestos.IEPSTasaOCuota = impuesto.tasaOCuota;
              nacional.Impuestos.IEPSComprobacion = impuesto.impuestoComprobado;
            }
            // ISH
            if(impuesto.impuestoId == ListadoCMM.TipoImpuesto.ISH){
              nacional.Impuestos.ISHTasaOCuota = impuesto.tasaOCuota;
              nacional.Impuestos.ISHComprobacion = impuesto.impuestoComprobado;
            }
            // OTRO
            if(impuesto.impuestoId == ListadoCMM.TipoImpuesto.OTRO){
              nacional.Impuestos.OTROTasaOCuota = impuesto.tasaOCuota;
              nacional.Impuestos.OTROComprobacion = impuesto.impuestoComprobado;
            }
          }

          // Retencion
          if(impuesto.tipoImpuestoId == ListadoCMM.NodoImpuesto.RETENCION){
            // IVA
            if(impuesto.impuestoId == ListadoCMM.TipoImpuesto.IVA){
              nacional.Retenciones.RetIVAComprobacion = impuesto.impuestoComprobado;
            }

            // ISR
            if(impuesto.impuestoId == ListadoCMM.TipoImpuesto.ISR){
              nacional.Retenciones.RetISRComprobacion = impuesto.impuestoComprobado;
            }
          }
        });

        // Es Comprobado Por RM
        if(comprobacion.esComprobadoPorRM){
          // RM = true
          nacional.CatalogoCuentaId = comprobacion.cuentaPagoGastoId;
          polizaComprobacion.Comprobacion.Nacional.RecursosMateriales.push(nacional);
        }else{
          // RM = false
          polizaComprobacion.Comprobacion.Nacional.Viaticante.push(nacional)
        }
      });

      // Extranjero
      this.solicitudViaticoComprobacionDetalle.filter(comprobacion => comprobacion.tipoComprobanteId == ListadoCMM.TipoComprobante.COMPROBANTE_EXTRANJERO && comprobacion.estatusId == ListadoCMM.EstatusRegistro.ACTIVO).map(comprobacion =>{
        let extranjero = new PolizaComprobacion.ViaticanteAndRM();
        let conceptoViatico = this.conceptoViatico.find(cv => cv.id == comprobacion.conceptoViaticoId);
        extranjero.ConceptoViaticoId = comprobacion.conceptoViaticoId;
        extranjero.ConceptoViaticoNombre = conceptoViatico.concepto;
        extranjero.ObjetoGastoId = conceptoViatico.objetoGastoId;
        if(comprobacion.proveedorId){
          extranjero.ProveedorId = comprobacion.proveedorId;
        }
        if(comprobacion.folio){
          extranjero.Folio = comprobacion.folio;
        }
        if(comprobacion.formaPagoId){
          extranjero.FormaPago = this.formaPago.find(fp => fp.id == comprobacion.formaPagoId) ? this.formaPago.find(fp => fp.id == comprobacion.formaPagoId).valor : '';
        }
        extranjero.Moneda = this.moneda.find(moneda => moneda.id == comprobacion.monedaId).nombre;
        extranjero.TipoDeCambio = comprobacion.tipoCambio;
        extranjero.Importe = comprobacion.importe;
        extranjero.ImporteEnPesos = comprobacion.importePesos;
        extranjero.Comentarios = comprobacion.comentarios;
      
        // Es Comprobado Por RM
        if(comprobacion.esComprobadoPorRM){
          // RM = true
          if(comprobacion.cuentaPagoGastoId){
            extranjero.CatalogoCuentaId = comprobacion.cuentaPagoGastoId;
          }
          polizaComprobacion.Comprobacion.Extranjero.RecursosMateriales.push(extranjero);
        }else{
          // RM = false
          polizaComprobacion.Comprobacion.Extranjero.Viaticante.push(extranjero);
        }
      });

      // SinComprobante
      this.solicitudViaticoComprobacionDetalle.filter(comprobacion => comprobacion.tipoComprobanteId == ListadoCMM.TipoComprobante.SIN_COMPROBANTE && comprobacion.estatusId == ListadoCMM.EstatusRegistro.ACTIVO).map(comprobacion =>{
        let sinComprobante = new PolizaComprobacion.ViaticanteAndRM();
        let conceptoViatico = this.conceptoViatico.find(cv => cv.id == comprobacion.conceptoViaticoId);
        sinComprobante.ConceptoViaticoId = comprobacion.conceptoViaticoId;
        sinComprobante.ConceptoViaticoNombre = conceptoViatico.concepto;
        sinComprobante.ObjetoGastoId = conceptoViatico.objetoGastoId;
        if(comprobacion.proveedorId){
          sinComprobante.ProveedorId = comprobacion.proveedorId;
        }
        if(comprobacion.folio){
          sinComprobante.Folio = comprobacion.folio;
        }
        if(comprobacion.formaPagoId){
          sinComprobante.FormaPago = this.formaPago.find(fp => fp.id == comprobacion.formaPagoId) ? this.formaPago.find(fp => fp.id == comprobacion.formaPagoId).valor : '' ;
        }
        if(comprobacion.monedaId){
          sinComprobante.Moneda = this.moneda.find(moneda => moneda.id == comprobacion.monedaId).nombre;
        }
        if(comprobacion.tipoCambio){
          sinComprobante.TipoDeCambio = comprobacion.tipoCambio;
        }
        if(comprobacion.importe){
          sinComprobante.Importe = comprobacion.importe;
        }
        sinComprobante.ImporteEnPesos = comprobacion.importePesos;
        sinComprobante.Comentarios = comprobacion.comentarios;

        // Es Comprobado Por RM
        if(comprobacion.esComprobadoPorRM){
          // RM = true
          if(comprobacion.cuentaPagoGastoId){
            sinComprobante.CatalogoCuentaId = comprobacion.cuentaPagoGastoId;
          }
          polizaComprobacion.Comprobacion.SinComprobante.RecursosMateriales.push(sinComprobante);
        }else{
          // RM = false
          polizaComprobacion.Comprobacion.SinComprobante.Viaticante.push(sinComprobante);
        }
      });

      // ReintegroViaticante
      this.solicitudViaticoComprobacionDetalle.filter(comprobacion => comprobacion.categoriaId == ListadoCMM.CategoriaViatico.REINTEGRO && comprobacion.estatusId == ListadoCMM.EstatusRegistro.ACTIVO).map(comprobacion =>{
        let reintegroViaticante = new PolizaComprobacion.ReintegroViaticante();
        reintegroViaticante.Importe = comprobacion.importePesos;
        polizaComprobacion.Comprobacion.ReintegroViaticante.push(reintegroViaticante);
      });
      if(polizaComprobacion.Comprobacion.ReintegroViaticante.length == 0 ){
        polizaComprobacion.Comprobacion.ReintegroViaticante.push(new PolizaComprobacion.ReintegroViaticante());
      }
      ////////////////////////////////////

      return JSON.stringify(polizaComprobacion);
  }
}