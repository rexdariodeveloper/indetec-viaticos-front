import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { AsignacionComponentService } from './asignacion.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Router, NavigationEnd } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { GenericService } from '@services/generic.service';
import { SolicitudViatico } from '@models/solicitud_viatico';
import { Asignacion } from '@models/asignacion';
import { AsignacionViatico } from '@models/AsignacionViatico';
import { ConceptoViatico } from '@models/concepto_viatico';
import { MatrizViatico } from '@models/matriz_viatico';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import * as moment from 'moment';
import { ListadoCMM } from '@models/mapeos/listadoCMM';
import { Select2OptionData } from 'ng2-select2';
import { SolicitudResumenComponent } from '../../solicitudes/solicitud_resumen/solicitud_resumen.component';
import { Listado_CMM } from '@models/listado_cmm';
import { AsignacionPasaje, AsignacionPasajeTotal } from '@models/asignacionPasaje';
declare let jQuery: any;
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { DateTimeAdapter } from 'ng-pick-datetime';
import { BsModalService, ModalDirective } from 'ngx-bootstrap';
import { environment } from 'environments/environment';
import { MoneyPipe } from 'app/pipes/money.pipe';
import { ConceptoViaticoMapeo } from '@models/mapeos/concepto_viatico_mapeo';
import { GeneralComponent } from 'app/pages/ecommerce/product-detail/components/general/general.component';
import { localStorageHayCambios } from 'app/components/local-storage/hay-cambios/hay-cambios';
import { DATE } from 'ngx-bootstrap/chronos/units/constants';
moment.locale('es');

@Component({
  selector: 'app-asignacion',
  templateUrl: './asignacion.component.html',
  styleUrls: ['./asignacion.component.scss']
})
export class AsignacionComponent extends GeneralComponent implements OnInit, OnDestroy, AfterViewInit {

  //Modal
  @ViewChild('modalAsignacionPasaje', { static: true }) modalAsignacionPasaje: ModalDirective;

  //View Solicitud Viatico
  @ViewChild(SolicitudResumenComponent, { static: false }) solicitudResumenComponent;

  // View Modal Deshacer
  @ViewChild('deshacerModal', null) deshacerModal;

  // URL
  private URL_ASIGNACIONES: string = 'app/viaticos/asignaciones/';

  // is Edit
  isEdit: boolean = true;

  // Tabs
  isTabs: number = 0;

  //Select2
  select2Options: any = {
    theme: 'bootstrap',
    multiple: true,
  };
  select2OptionsPasaje: any = {
    theme: 'bootstrap',
  };

  // Listado CMM
  listadoCMM;

  //Motivo Revision
  motivo: string;

  //////////////////////////////////////
  ///// Mask Money
  //////////////////////////////////////
  //Input Mask Money
  maskMoney = { 
    mask: createNumberMask({
      prefix: '$',
      includeThousandsSeparator: true,
      allowDecimal: true,
    }),
  }

  //Mask Pasaje
  maskMoneyPasaje = { 
    mask: createNumberMask({
      prefix: '',
      includeThousandsSeparator: true,
      allowDecimal: true,
    }),
  }

  //////////////////////////////////////

  //////////////////////////////////////
  ///// Recomendacion de viatico
  //////////////////////////////////////
  //Pernocta Con/Sin
  pernoctaCon: number = 0;
  pernoctaSin: number = 0;

  //Solicitud Viatico
  solicitudViatico: SolicitudViatico;
  public existPolizaGC:boolean=false;

  //Asignacion
  public asignacion: Asignacion;
  private minFechaAsignacion: Date;
  private maxFechaAsignacion:Date;
  private mostrarErroresForm: boolean = false;
  private minFechaCompra: Date;
  private maxFechaCompra: Date;
  private minFechaSalida: Date;
  private maxFechaSalida: Date;
  private minFechaRegreso: Date;
  private maxFechaRegreso: Date;
  private dtpSalidaActivo: boolean = true;
  private dtpRegresoActivo: boolean = true;

  //Asignacion Viatico
  asignacionViatico: AsignacionViatico[];
  asignacionViaticoSelected: AsignacionViatico[];
  asignacionViaticoResult: {
    montoConPernocta: number,
    montoSinPernocta: number,
    montoViaticoTotal: number,
    montoPorTransferir: number
  }
  asignacionViaticoFormArray: FormArray = new FormArray([]);

  //Concepto Viatico
  conceptoViatico: ConceptoViatico[];
  conceptoViaticoSelect2: Select2OptionData[];
  conceptoViaticoSelected: ConceptoViatico[];

  //Matriz Viatico
  matrizViatico: MatrizViatico[] = [];
  //////////////////////////////////////

  //////////////////////////////////////
  ///// Registro de pasajes
  //////////////////////////////////////
  //Asignacion Pasaje
  asignacionPasajeId: number = 1000000000;
  asignacionPasaje: AsignacionPasaje[];
  asignacionPasajeSelected: AsignacionPasaje[];
  asignacionPasajeForm: FormGroup;
  asignacionPasajeSelect2: Select2OptionData[];
  conceptoViaticoSelect2Valid: boolean = true;
  asignacionPasajeFormArray: FormArray = new FormArray([]);
  cambios: boolean = false;

  //Asignacion Pasaje Total
  asignacionPasajeTotal: AsignacionPasajeTotal;

  // Listado CMM Tipo Pasaje
  tipoPasaje: Listado_CMM[];
  //////////////////////////////////////

  //UnsubscribeAll
  private unsubscribeAll: Subject<any>;
  private mySubscription: any;
  // Un valor para hacer validar si hay cambios o no para que puede ir a otra ficha o url
  esValidaHayCambios: boolean = true;

  constructor(
    private _asignacionService: AsignacionComponentService,
    private _spinner: NgxSpinnerService,
    private _toastr: ToastrService,
    private router: Router,
    private _formBuilder: FormBuilder,
    private _dateTimeAdapter: DateTimeAdapter<any>,
    private moneyPipe: MoneyPipe,
    private bsModalService: BsModalService
  ) {

    super();

    this.listadoCMM = ListadoCMM;
    this._dateTimeAdapter.setLocale('es-MX');

    // Set the private defaults
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
    this.loadAsignacion();
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
    if (this.mySubscription) {
      this.mySubscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    this.solicitudResumenComponent.cargaSolicitud(parseInt(this._asignacionService.routeParams.id));

    jQuery('.parsleyjsModalPasaje').parsley();
   
  }

  // //Validar para saber hay cambios o no cuando quiero cambiar la ficha
  // canDeactivate() {
  //   if(JSON.parse(localStorage.getItem('haycambios'))){
  //     const esAceptaSubject = new Subject<boolean>(),
  //       modal = this.bsModalService.show(ModalConfirmaHayCambiosComponent, { backdrop: 'static' });
  //     modal.content.esAceptaSubject = esAceptaSubject;
  //     return esAceptaSubject.asObservable();
  //   }
  //   return true;
  // }

  hayCambios(): void{
    setTimeout(() => {
      let esHayCambios: boolean = false;
      this.asignacion.id != null ? !this.asignacionViaticoFormArray.dirty && !this.asignacionPasajeFormArray.dirty ? esHayCambios = false : esHayCambios = true : esHayCambios = true;
      if(esHayCambios){
        // Cambiamos el valor de localstorange para "hay cambios" para no tener problema con pantalla cuando cambiar la ficha
        localStorageHayCambios(true);
      }
    }, 100);
  }

  limpiarParsleyjsModalPasaje() {
    jQuery('.parsleyjsModalPasaje').parsley().destroy();
    jQuery('.parsleyjsModalPasaje').parsley();
  }

  cleanAsignacion(): void {
    //Asingacion
    this.asignacion = new Asignacion();

    //Asignacion Viatico
    this.asignacionViatico = [];
    this.asignacionViaticoSelected = [];
    this.asignacionViaticoResult = {
      montoConPernocta: 0,
      montoSinPernocta: 0,
      montoViaticoTotal: 0,
      montoPorTransferir: 0,
    }
    this.asignacionViaticoFormArray.clear();

    //Concepto Viatico
    this.conceptoViatico = [];
    this.conceptoViaticoSelect2 = [];
    this.conceptoViaticoSelected = [];

    //Matriz Viatico
    this.matrizViatico = [];

    //Asignacion Pasaje
    this.asignacionPasaje = [];
    this.asignacionPasajeTotal = new AsignacionPasajeTotal();
    this.asignacionPasajeSelect2 = [];
    this.asignacionPasajeSelected = [];
    this.createAsignacionPasajeForm(null);
    this.asignacionPasajeFormArray.clear();

    //Tipo Pasaje
    this.tipoPasaje = [];

  }

  loadAsignacion() {
    this._spinner.show();
    this._asignacionService.onAsignacionChanged.pipe(takeUntil(this.unsubscribeAll)).subscribe(response => {
      if (response.status == 200) {
        //Clean
        this.cleanAsignacion();

        // Solicitud Viatico
        this.solicitudViatico = this._asignacionService.solicitudViatico;
        // if (this.solicitudViatico != null) {
        //   this.isEdit = this.solicitudViatico.estatusId != ListadoCMM.EstatusSolicitud.RECURSOS_ASIGNADOS && this.solicitudViatico.estatusId != ListadoCMM.EstatusSolicitud.ENVIADA_FINANZAS
        // }

        if (this.solicitudViatico != null) {
          
             this.isEdit = this.solicitudViatico.estatusId != ListadoCMM.EstatusSolicitud.RECURSOS_ASIGNADOS && this.solicitudViatico.estatusId != ListadoCMM.EstatusSolicitud.ENVIADA_FINANZAS && this.solicitudViatico.estatusId!=ListadoCMM.EstatusSolicitud.EN_REVISION_COMPROBACION            
          
        }
        this.minFechaCompra = new Date(this.solicitudViatico.ejercicio,0,1);
        this.maxFechaCompra = this.maxFechaSalida = new Date(this.solicitudViatico.fechaInicioEvento);
        
        //Calculator many pernocta con y sin
        this.viaticoCalculatorPernoctaConAndSin();

        //Concepto Viatico
        this.conceptoViatico = this._asignacionService.conceptoViatico;

        //Matriz Viatico
        this.matrizViatico = this._asignacionService.matrizViatico;

        //Tipo Pasaje
        this.tipoPasaje = this._asignacionService.tipoPasaje;

        if (this._asignacionService.asignacion) {
          this.asignacion = this._asignacionService.asignacion;
          //Limitar fecha de asignacion con respecto al ejercicio BY: AGG
          this.minFechaAsignacion=new Date(this.solicitudViatico.ejercicio,0,1) ;
          this.maxFechaAsignacion = new Date(this._asignacionService.asignacion.solicitudViatico.fechaSalida);
          this.existPolizaGC=this.asignacion.polizaComprometidoId!=null && this.asignacion.polizaGastoPorComprobarId==null;         

          if(this.existPolizaGC){
            this.minFechaAsignacion=new Date(this.asignacion.fechaComprometido);   
            this.maxFechaAsignacion=new Date(this.solicitudViatico.ejercicio,11,31)         
          }

          //Asignacion Viatico
          this.asignacionViatico = this._asignacionService.asignacionViatico;
          this.asignacionViatico.map(av => {
            this.asignacionViaticoFormArray.push(this._formBuilder.group(av));
          });
          this.viaticoGetConceptoViatico();
          this.viaticoCalculatorAsignacionViatico();

          //Asignacion Pasaje
          this.asignacionPasaje = this._asignacionService.asignacionPasaje;

          // this.asignacionPasajeModifier = this.asignacionPasaje;
          this.asignacionPasaje.map(ap => {
            if (ap.fechaCompra !== null) {
              ap.fechaCompra = new Date(ap.fechaCompra);              
            }
            if (ap.fechaSalida !== null) {
              ap.fechaSalida = new Date(ap.fechaSalida);
            }
            if (ap.fechaRegreso !== null) {
              ap.fechaRegreso = new Date(ap.fechaRegreso);
            }
            this.asignacionPasajeFormArray.push(this._formBuilder.group(ap));
          });

          this.pasajeCalculatorAsignacionPasaje();

          this.asignacion.fechaComprometido = this.asignacion.fechaComprometido != null ? new Date(this.asignacion.fechaComprometido) : null;
        } else {
          this.viaticoRecomendacionConceptoViatico();
          // Cambiamos el valor de localstorange para "hay cambios" para no tener problema con pantalla cuando cambiar la ficha
          localStorageHayCambios(true);
        }

        //Tipo Pasaje
        this.pasajeGetConceptoViatico();

        this._spinner.hide();
      }
    }, error => {
      //Ocultamos el spinner
      this._spinner.hide();

      //Mostramos error 
      this._toastr.error(GenericService.getError(error).message, 'Error.');
    });
  }

  //////////////////////////////////////
  ///// Recomendacion de viatico
  //////////////////////////////////////

  // Viatico Data To Data Table
  viaticoDataToDataTable(): any{
    return (this.asignacionViaticoFormArray.value as any).filter(viatico => viatico.estatusId == ListadoCMM.EstatusRegistro.ACTIVO);
  }

  viaticoCalculatorPernoctaConAndSin() {
    var dateOut = moment(this.solicitudViatico.fechaSalida);
    var dateBack = moment(this.solicitudViatico.fechaRegreso);
    this.pernoctaCon = dateBack.diff(dateOut, 'days');
    this.pernoctaSin = (this.pernoctaCon + 1) - this.pernoctaCon;
  }

  viaticoRecomendacionConceptoViatico() {
    if (this.matrizViatico.length > 0) {
      this.matrizViatico.map(matriz => {
        if (matriz.conceptoViatico.categoriaId == ListadoCMM.CategoriaViatico.VIATICO) {
          let montoConPernocta = matriz.monto * this.pernoctaCon,
            montoSinPernocta = matriz.monto * this.pernoctaSin,
            montoPorTransferir = montoConPernocta + montoSinPernocta;
          let asignacionViatico: AsignacionViatico = new AsignacionViatico();
          asignacionViatico.conceptoViaticoId = matriz.conceptoViaticoId;
          asignacionViatico.conceptoViatico = this.conceptoViatico.filter(cv => cv.id == matriz.conceptoViaticoId)[0];
          asignacionViatico.conceptoViaticoCodigo = matriz.conceptoViatico.codigo;
          asignacionViatico.conceptoViaticoNombre = matriz.conceptoViatico.concepto;
          asignacionViatico.montoConPernocta = montoConPernocta;
          asignacionViatico.montoSinPernocta = montoSinPernocta;
          asignacionViatico.montoPorTransferir = montoPorTransferir;

          this.asignacionViaticoFormArray.push(this._formBuilder.group(asignacionViatico));
        }
      });

      this.asignacionViaticoFormArray.controls.map(viatico => {
        viatico.markAsDirty();
      });

      this.viaticoGetConceptoViatico();
      this.viaticoCalculatorAsignacionViatico();
    }
  }

  // Viatico Update Money
  viaticoUpdateMoney(event, cell, rowIndex, row, isTransferir: boolean) {
    let money: number = this.moneyPipe.convertToNumber(event.target.value);  

    const viaticoFormArray = this.asignacionViaticoFormArray.controls.filter(viatico => viatico.value.estatusId == ListadoCMM.EstatusRegistro.ACTIVO)[rowIndex] as FormGroup;

    if (isTransferir) {
      //let montoPorTransferir: number = this.asignacionViaticoDataTable[rowIndex].montoConPernocta + this.asignacionViaticoDataTable[rowIndex].montoSinPernocta;
      let montoPorTransferir: number = viaticoFormArray.controls.montoConPernocta.value + viaticoFormArray.controls.montoSinPernocta.value;
      if (money > montoPorTransferir) {
        this._toastr.error("El Monto a Transferir no puede ser mayor a la suma de PERNOCTA + SIN PERNOCTA");
        money = montoPorTransferir;
      }else{
        viaticoFormArray.markAsDirty();
      }
      viaticoFormArray.controls.montoPorTransferir.setValue(money);
      //this.asignacionViaticoDataTable[rowIndex].montoPorTransferir = money;

    } else {
      let moneyLimit = environment.moneyLimit;
      if (money > moneyLimit) {
        this._toastr.error('El Monto no puede ser mayor a $' + moneyLimit);
        money = moneyLimit;
      }

      //this.asignacionViaticoDataTable[rowIndex][cell] = money;
      
      viaticoFormArray.controls[cell].setValue(money);
      viaticoFormArray.controls.montoPorTransferir.setValue(viaticoFormArray.controls.montoConPernocta.value + viaticoFormArray.controls.montoSinPernocta.value);
      viaticoFormArray.markAsDirty();

      //this.asignacionViaticoDataTable[rowIndex].montoPorTransferir = this.asignacionViaticoDataTable[rowIndex].montoConPernocta + this.asignacionViaticoDataTable[rowIndex].montoSinPernocta;
    }

    // Set Value in INPUT
    event.target.value = this.moneyPipe.transform(money);

    this.viaticoCalculatorAsignacionViatico();
    this.cambios = true;
  }

  //Select asignacionViatico
  viaticoSelectAsignacionViatico({ selected }): void {
    this.asignacionViaticoSelected.splice(0, this.asignacionViaticoSelected.length);
    this.asignacionViaticoSelected.push(...selected);
  }

  //Remove Asignacion Viatico
  viaticoRemoveAsignacionViatico(): void {
    this.asignacionViaticoSelected.map(avs => {
      const viaticoFormArray = this.asignacionViaticoFormArray.controls.find(viatico => viatico.value == avs) as FormGroup;
      viaticoFormArray.controls.estatusId.setValue(ListadoCMM.EstatusRegistro.BORRADO);
      viaticoFormArray.markAsDirty();
    });

    this.asignacionViaticoSelected = [];

    this.viaticoGetConceptoViatico();
    this.viaticoCalculatorAsignacionViatico();
    this.cambios = true;
    // Cambiamos el valor de localstorange para "hay cambios" para no tener problema con pantalla cuando cambiar la ficha
    localStorageHayCambios(true);
  }

  viaticoCalculatorAsignacionViatico(): void {
    this.asignacionViaticoResult = {
      montoConPernocta: 0,
      montoSinPernocta: 0,
      montoViaticoTotal: 0,
      montoPorTransferir: 0,
    }

    this.asignacionViaticoFormArray.controls.forEach(av => {
      let form: any = this.getFormControl(av);
      if (form.estatusId.value !== ListadoCMM.EstatusRegistro.BORRADO && form.conceptoViatico.value.noPermitirSinPernocta) {
        form.montoConPernocta.setValue(form.montoConPernocta.value + form.montoSinPernocta.value);
        form.montoSinPernocta.setValue(0);
      }
    });
    
    this.asignacionViaticoFormArray.value.filter(av => av.estatusId !== ListadoCMM.EstatusRegistro.BORRADO).map(av => {
      this.asignacionViaticoResult.montoConPernocta += av.montoConPernocta;
      this.asignacionViaticoResult.montoSinPernocta += av.montoSinPernocta;
      this.asignacionViaticoResult.montoPorTransferir += av.montoPorTransferir;
    });

    this.asignacionViaticoResult.montoViaticoTotal = this.asignacionViaticoResult.montoConPernocta + this.asignacionViaticoResult.montoSinPernocta;
  }

  getFormControl(value) {
    return this._formBuilder.group(value).value.controls;
  }

  //////////////////////////////////////

  //////////////////////////////////////
  ///// MODAL Concepto Viatico
  //////////////////////////////////////

  //Get Concepto Viatico for not same in Asignacion Viatico with Select2
  viaticoGetConceptoViatico(): void {
    this.conceptoViaticoSelect2 = [];
    this.conceptoViatico.filter(concepto => concepto.categoriaId == ListadoCMM.CategoriaViatico.VIATICO).map(cv => {
      if (!this.asignacionViaticoFormArray.value.filter(av => av.estatusId !== ListadoCMM.EstatusRegistro.BORRADO).find(av => av.conceptoViaticoId === cv.id)) {
        this.conceptoViaticoSelect2.push({ id: cv.id.toString(), text: cv.concepto });
      }
    });
  }

  viaticoIsSelectedConceptoViatico(event) {
    this.conceptoViaticoSelected = [];
    event.value.map(id => {
      let conceptoViatico = this.conceptoViatico.find(cv => cv.id === parseInt(id));
      this.conceptoViaticoSelected.push(conceptoViatico);
    })
  }

  viaticoAddConceptoViatico(): void {
    this.conceptoViaticoSelected.map(cv => {
      let montoConPernocta = 0,
        montoSinPernocta = 0,
        montoPorTransferir = 0;

      const conceptoViatico = this.conceptoViatico.find(cv2 => cv2.id === cv.id);
      let asignacionViatico: AsignacionViatico = new AsignacionViatico();

      //Search or not exist in Matriz Viatico
      const matrizViatico = this.matrizViatico.find(mv => mv.conceptoViaticoId === cv.id);
      if (matrizViatico) {
        montoConPernocta = matrizViatico.monto * this.pernoctaCon,
          montoSinPernocta = matrizViatico.monto * this.pernoctaSin,
          montoPorTransferir = montoConPernocta + montoSinPernocta;
      }
      asignacionViatico.conceptoViaticoId = conceptoViatico.id;
      asignacionViatico.conceptoViatico = conceptoViatico;
      asignacionViatico.conceptoViaticoCodigo = conceptoViatico.codigo;
      asignacionViatico.conceptoViaticoNombre = conceptoViatico.concepto;
      asignacionViatico.montoConPernocta = montoConPernocta;
      asignacionViatico.montoSinPernocta = montoSinPernocta;
      asignacionViatico.montoPorTransferir = montoPorTransferir;

      this.asignacionViaticoFormArray.push(this._formBuilder.group(asignacionViatico));
      this.asignacionViaticoFormArray.at(this.asignacionViaticoFormArray.value.findIndex(viatico => viatico.conceptoViaticoId == cv.id && viatico.estatusId == ListadoCMM.EstatusRegistro.ACTIVO)).markAsDirty();
      // Cambiamos el valor de localstorange para "hay cambios" para no tener problema con pantalla cuando cambiar la ficha
      localStorageHayCambios(true);
    });

    //this.asignacionViaticoDataTable = [...this.asignacionViatico.filter(viatico => viatico.estatusId != ListadoCMM.EstatusRegistro.BORRADO)];
    this.conceptoViaticoSelected = [];
    this.viaticoCalculatorAsignacionViatico();
    this.viaticoGetConceptoViatico();
    this.cambios = true;
  }

  //////////////////////////////////////

  //////////////////////////////////////
  ///// Registro de pasajes
  //////////////////////////////////////

  // Viatico Data To Data Table
  pasajeDataToDataTable(): any{
    return (this.asignacionPasajeFormArray.value as any).filter(pasaje => pasaje.estatusId == ListadoCMM.EstatusRegistro.ACTIVO);
  }
private a:boolean;
  createAsignacionPasajeForm(asignacionPasaje: AsignacionPasaje) {
    this.mostrarErroresForm = false;  

    asignacionPasaje = asignacionPasaje ? asignacionPasaje : new AsignacionPasaje();
 
    this.asignacionPasajeForm = this._formBuilder.group({
      id: [asignacionPasaje.id],
      conceptoViaticoId: [asignacionPasaje.conceptoViaticoId, Validators.required],
      conceptoViatico: [asignacionPasaje.conceptoViatico, Validators.required],
      viajeRedondo: [asignacionPasaje.viajeRedondo],
      fechaCompra: [asignacionPasaje.fechaCompra, Validators.required],
      codigoReservacion: [asignacionPasaje.codigoReservacion, Validators.required],
      nombreLinea: [asignacionPasaje.nombreLinea, Validators.required],
      fechaSalida: [asignacionPasaje.fechaSalida,Validators.required],
      fechaRegreso: [asignacionPasaje.fechaRegreso, Validators.required],
      costo: [this.moneyPipe.transform(asignacionPasaje.costo, '')],
      asignadoAFuncionario: [asignacionPasaje.asignadoAFuncionario],
      estatusId: [asignacionPasaje.estatusId],
      estatus: [asignacionPasaje.estatus],
    });    

    if(asignacionPasaje.id==null){
      this.dtpSalidaActivo=true;      
      this.dtpRegresoActivo=true;      
    }else{
      this.dtpSalidaActivo=false;     
      this.dtpRegresoActivo=false;      
    }    
  }

  //Select Asignacion Pasaje
  pasajeSelectAsignacionPasaje({ selected }): void {
    this.asignacionPasajeSelected.splice(0, this.asignacionPasajeSelected.length);
    this.asignacionPasajeSelected.push(...selected);
  }

  //Remove asignacionViatico
  pasajeRemoveAsignacionPasaje(): void {
    this.asignacionPasajeSelected.map(aps => {
      const pasaje = this.asignacionPasajeFormArray.controls.find(pasaje => pasaje.value == aps) as FormGroup;
      pasaje.controls.estatusId.setValue(ListadoCMM.EstatusRegistro.BORRADO);
      pasaje.markAsDirty();
    })
    this.asignacionPasajeSelected = [];
    this.pasajeCalculatorAsignacionPasaje();
    this.cambios = true;
    // Cambiamos el valor de localstorange para "hay cambios" para no tener problema con pantalla cuando cambiar la ficha
    localStorageHayCambios(true);
  }

  //Get data Concepto Viatico
  pasajeGetConceptoViatico(): void {
    this.asignacionPasajeSelect2 = [];
    this.asignacionPasajeSelect2.push({ id: '', text: 'Seleccione una Opción' });
    this.conceptoViatico.filter(concepto => concepto.categoriaId == ListadoCMM.CategoriaViatico.PASAJE).map(concepto => {
      this.asignacionPasajeSelect2.push({ id: concepto.id.toString(), text: concepto.concepto });
    });
  }

  //Calculator total
  pasajeCalculatorAsignacionPasaje(): void {
    this.asignacionPasajeTotal = new AsignacionPasajeTotal();
    this.asignacionPasajeFormArray.value.filter(pasaje => pasaje.estatusId == ListadoCMM.EstatusRegistro.ACTIVO).map((pasaje: AsignacionPasaje) => {
      let costo: number = this.moneyPipe.convertToNumber(pasaje.costo.toString());

      // Aéreo
      let tipoPasaje: any = this.conceptoViatico.find(concepto => concepto.categoriaId == ListadoCMM.CategoriaViatico.PASAJE && concepto.id == ConceptoViaticoMapeo.TipoPasaje.AEREO);
      if (tipoPasaje && pasaje.conceptoViaticoId == tipoPasaje.id) {
        this.asignacionPasajeTotal.aereoTotal += costo;
      }
      // Marítimo
      tipoPasaje = this.conceptoViatico.find(concepto => concepto.categoriaId == ListadoCMM.CategoriaViatico.PASAJE && concepto.id == ConceptoViaticoMapeo.TipoPasaje.MARITIMO);
      if (tipoPasaje && pasaje.conceptoViaticoId == tipoPasaje.id) {
        this.asignacionPasajeTotal.maritimoTotal += costo;
      }
      // Terrestre
      tipoPasaje = this.conceptoViatico.find(concepto => concepto.categoriaId == ListadoCMM.CategoriaViatico.PASAJE && concepto.id == ConceptoViaticoMapeo.TipoPasaje.TERRESTRE);
      if (tipoPasaje && pasaje.conceptoViaticoId == tipoPasaje.id) {
        this.asignacionPasajeTotal.terrestreTotal += costo;
      }

      // Total Transferir (Asignar a Funcionario)
      if(pasaje.asignadoAFuncionario){
        this.asignacionPasajeTotal.transferirTotal += costo;
      }

    });
    this.asignacionPasajeTotal.pasajeTotal = (this.asignacionPasajeTotal.aereoTotal + this.asignacionPasajeTotal.maritimoTotal + this.asignacionPasajeTotal.terrestreTotal);
  }

  // Validate Date
  pasajeValidateDate(name: string): void {
    jQuery("input[id=" + name + "]").parsley().reset();
    this.validacionFechas(false);
  }

  pasajeValidateForm(): boolean {
    this.validacionFechas(false);

    if (this.asignacionPasajeForm.controls.asignadoAFuncionario.value) {
      this.asignacionPasajeForm.controls.conceptoViatico.clearValidators();
      this.asignacionPasajeForm.controls.fechaCompra.clearValidators();
      this.asignacionPasajeForm.controls.codigoReservacion.clearValidators();
      this.asignacionPasajeForm.controls.nombreLinea.clearValidators();
      this.asignacionPasajeForm.controls.fechaSalida.clearValidators();
      this.asignacionPasajeForm.controls.fechaRegreso.clearValidators();
    } else {
      this.mostrarErroresForm = true;
      this.asignacionPasajeForm.controls.conceptoViatico.setValidators(Validators.required);
      this.asignacionPasajeForm.controls.fechaCompra.setValidators(Validators.required);
      this.asignacionPasajeForm.controls.codigoReservacion.setValidators(Validators.required);
      this.asignacionPasajeForm.controls.nombreLinea.setValidators(Validators.required);
      this.asignacionPasajeForm.controls.fechaSalida.setValidators(Validators.required);
      
      if (this.asignacionPasajeForm.controls.viajeRedondo.value) {
        this.asignacionPasajeForm.controls.fechaRegreso.setValidators(Validators.required);
      } else {
        this.asignacionPasajeForm.controls.fechaRegreso.clearValidators();
      }
    }

    this.asignacionPasajeForm.controls.conceptoViatico.updateValueAndValidity();
    this.asignacionPasajeForm.controls.fechaCompra.updateValueAndValidity();
    this.asignacionPasajeForm.controls.codigoReservacion.updateValueAndValidity();
    this.asignacionPasajeForm.controls.nombreLinea.updateValueAndValidity();
    this.asignacionPasajeForm.controls.fechaSalida.updateValueAndValidity();
    this.asignacionPasajeForm.controls.fechaRegreso.updateValueAndValidity();

    if (this.asignacionPasajeForm.invalid) {
      for (var i in this.asignacionPasajeForm.controls) {
        this.asignacionPasajeForm.controls[i].markAsTouched();
      }
    }

    this.conceptoViaticoSelect2Valid = this.asignacionPasajeForm.controls.conceptoViaticoId.valid;

    if (this.asignacionPasajeForm.controls.costo.value == 0 || this.asignacionPasajeForm.controls.costo.value == '$0.00') {
      this._toastr.error('El costo no puede ser 0');
      return false;
    }

    let moneyLimit = environment.moneyLimit;
    if (this.asignacionPasajeForm.controls.costo.value > moneyLimit) {
      this._toastr.error('El Costo no puede ser mayor a $' + moneyLimit);
      return false;
    }

    return this.asignacionPasajeForm.valid;
  }

  validacionFechas(minMaxFechas:boolean) {       

    if(minMaxFechas==true)
    {  
      //Rango de fecha valido FechaCompra
      this.minFechaCompra=new Date(this.solicitudViatico.ejercicio,0,1);
      this.maxFechaCompra=new Date(this.solicitudViatico.fechaSalida);

      //Rango de fecha valido FechaSalida
      this.minFechaSalida=new Date(this.asignacionPasajeForm.controls.fechaCompra.value);
      this.maxFechaSalida=new Date(this.solicitudViatico.fechaSalida);
      
      //Rango de fecha valido FechaSalida
      this.minFechaRegreso=new Date(this.solicitudViatico.fechaFinEvento);
      this.maxFechaRegreso=new Date(this.solicitudViatico.fechaRegreso);   
    }
    // this.maxFechaCompra = this.asignacionPasajeForm.controls.fechaCompra.value ? null : new Date(this.solicitudViatico.fechaInicioEvento);
    // this.minFechaSalida = this.asignacionPasajeForm.controls.fechaSalida.value ? null : this.asignacionPasajeForm.controls.fechaCompra.value;
    // this.maxFechaSalida = this.asignacionPasajeForm.controls.fechaSalida.value ? null : new Date(this.solicitudViatico.fechaInicioEvento);
    // this.minFechaRegreso = this.asignacionPasajeForm.controls.fechaRegreso.value ? null : this.asignacionPasajeForm.controls.fechaSalida.value;
  }

  pasajeAddAsignacionPasaje(): boolean {
    // Validamos que se hayan llenado los datos requeridos
    if (!this.pasajeValidateForm()) {
      return false;
    }

    let dataAsignacionPasaje: AsignacionPasaje = this.asignacionPasajeForm.getRawValue();
    dataAsignacionPasaje.costo = this.moneyPipe.convertToNumber(dataAsignacionPasaje.costo.toString());

    if (dataAsignacionPasaje.asignadoAFuncionario) {
      dataAsignacionPasaje.viajeRedondo = true;
      dataAsignacionPasaje.fechaCompra = null;
      dataAsignacionPasaje.codigoReservacion = '';
      dataAsignacionPasaje.nombreLinea = '';
      dataAsignacionPasaje.fechaSalida = null;
      dataAsignacionPasaje.fechaRegreso = null;
    } else {
      if (!dataAsignacionPasaje.viajeRedondo) {
        dataAsignacionPasaje.fechaRegreso = null;
      }
    }

    if (dataAsignacionPasaje.id === null) {
      dataAsignacionPasaje.id = this.asignacionPasajeId;
      this.asignacionPasajeId++;
      this.asignacionPasajeFormArray.push(this._formBuilder.group(dataAsignacionPasaje));
      this.asignacionPasajeFormArray.controls.find(pasaje => pasaje.value.id == dataAsignacionPasaje.id).markAsDirty();
    } else {
      const pasaje = this.asignacionPasajeFormArray.controls.find(pasaje => pasaje.value.id == dataAsignacionPasaje.id) as FormGroup
      pasaje.controls.conceptoViaticoId.setValue(dataAsignacionPasaje.conceptoViaticoId);
      pasaje.controls.conceptoViatico.setValue(this.conceptoViatico.find(concepto => concepto.id == dataAsignacionPasaje.conceptoViaticoId));
      pasaje.controls.asignadoAFuncionario.setValue(dataAsignacionPasaje.asignadoAFuncionario);
      pasaje.controls.viajeRedondo.setValue(dataAsignacionPasaje.viajeRedondo);
      pasaje.controls.fechaCompra.setValue(dataAsignacionPasaje.fechaCompra);
      pasaje.controls.codigoReservacion.setValue(dataAsignacionPasaje.codigoReservacion);
      pasaje.controls.nombreLinea.setValue(dataAsignacionPasaje.nombreLinea);
      pasaje.controls.fechaSalida.setValue(dataAsignacionPasaje.fechaSalida);
      pasaje.controls.fechaRegreso.setValue(dataAsignacionPasaje.fechaRegreso);
      pasaje.controls.costo.setValue(dataAsignacionPasaje.costo);
      pasaje.markAsDirty();
    }
    this.pasajeCalculatorAsignacionPasaje();
    this.modalAsignacionPasaje.hide();
    this.cambios = true;
  }

  //Pasaje update money input
  pasajeUpdateMonto(event): void {
    let money: number = this.moneyPipe.convertToNumber(event.target.value);

    // Set Value
    this.asignacionPasajeForm.controls.costo.setValue(this.moneyPipe.convertToNumber(this.moneyPipe.transform(money, '')));
  }

  //Is selected tipo viaje
  pasajeIsSelectedConceptoViatico(event): void {
    if (!this.conceptoViaticoSelect2Valid) {
      this.conceptoViaticoSelect2Valid = true
    }
    this.asignacionPasajeForm.controls.conceptoViaticoId.setValue(parseInt(event.value));
    this.asignacionPasajeForm.controls.conceptoViatico.setValue(this.conceptoViatico.find(concepto => concepto.id == parseInt(event.value)));
  }

  pasajeActivateAsignacionPasaje(event): void {
    if (this.isEdit && event.type === "dblclick") {
      // Reset Parsley
      this.limpiarParsleyjsModalPasaje();

      this.createAsignacionPasajeForm(this.asignacionPasajeFormArray.value.find(pasaje => pasaje.id === event.row.id));
      this.modalAsignacionPasaje.show();
      this.validacionFechas(true);
    }
  }

  pasajeShowModalAddAsignacionPasaje(){
    // Reset Parsley
    this.limpiarParsleyjsModalPasaje();
    
    this.createAsignacionPasajeForm(null); 
    // Cambiamos el valor de localstorange para "hay cambios" para no tener problema con pantalla cuando cambiar la ficha
    localStorageHayCambios(true);
    this.modalAsignacionPasaje.show();
  }
  //////////////////////////////////////

  //////////////////////////////////////
  ///// Validation Data
  //////////////////////////////////////

  // Validation Data is change for send
  validationData(isAsignacion: boolean): any {

    // Send = response
    let response: {
      isData: boolean,
      data: any
    } = {
      isData: false,
      data: {}
    }

    if (!isAsignacion) {

      //Asignacion Viatico
      const sendAsignacionViatico: AsignacionViatico[] = [];
      this.asignacionViaticoFormArray.controls.map(viatico => {
        if(viatico.dirty){
          sendAsignacionViatico.push(viatico.value);
        }
      });

      //Asignacion Pasaje
      const sendAsignacionPasaje: AsignacionPasaje[] = [];
      this.asignacionPasajeFormArray.controls.map(pasaje => {
        if(pasaje.dirty){
          sendAsignacionPasaje.push(pasaje.value);
        }
      });

      //Vertify exist modifier 
      if (sendAsignacionViatico.length > 0 || sendAsignacionPasaje.length > 0) {

        let sendSolicitudViatico: SolicitudViatico = this.solicitudViatico;
        //sendSolicitudViatico.estatusId = ListadoCMM.EstatusSolicitud.RECURSOS_ASIGNADOS;

        this.asignacion.fechaComprometido = null;

        let data: any = {
          //'solicitudId': parseInt(this._asignacionService.routeParams.id),
          'isAsignacion': isAsignacion,
          'solicitudViatico': sendSolicitudViatico,
          'asignacion': this.asignacion,
          'asignacionViatico': sendAsignacionViatico,
          'asignacionPasaje': sendAsignacionPasaje
        };

        response.isData = true;
        response.data = data;
      }
    } else {

      if (this.asignacion.fechaComprometido == null) {
        this._toastr.error('Debe seleccionar una Fecha de Comprometido.');
        return;
      }

      let sendSolicitudViatico: SolicitudViatico = this.solicitudViatico;
      // sendSolicitudViatico.estatusId = ListadoCMM.EstatusSolicitud.RECURSOS_ASIGNADOS;
      let data: any = {
        //'solicitudId': parseInt(this._asignacionService.routeParams.id),
        'isAsignacion': isAsignacion,
        'solicitudViatico': sendSolicitudViatico,
        'asignacion': this.asignacion,
        'datosCancelacionPoliza':{'fechaCancelacion':'','estatusPoliza':'','tipoPoliza':'Gasto Comprometido'}
      };

      response.isData = true;
      response.data = data;
    }

    return response;
  }

  //////////////////////////////////////
  /// Cancelar Póliza Gasto Comprometido
  /////////////////////////////////////
  polizaGastoComprometido(estatus: string) {
    
    // Get Is Validation Send And Data
    let _response: any = this.validationData(true);

    //Vertify exist modifier 
    if (_response.isData) {
      this._spinner.show();
      //Agregar los datos a las propiedades del objeto
     

      let data: any = _response.data;
      data.datosCancelacionPoliza.estatusPoliza=estatus;
      data.datosCancelacionPoliza.fechaCancelacion=this.asignacion.fechaComprometido.toISOString();
    
      
      // console.log(data);
    
      this._asignacionService.saveAsignacion(data).then((response: any) => {
        if (response.status === 200) {
          //Mostramos error 
          this._toastr.success('Asignación guardada con éxito!');
          
          this.esValidaHayCambios = false;
          // Cambiamos el valor de localstorange para "hay cambios" para no tener problema con pantalla cuando cambiar la ficha
          localStorageHayCambios(false);
          // Go Listado de Asignacion
          this.router.navigate([this.URL_ASIGNACIONES]);
        }
      }, error => {
        //Ocultamos el spinner
        this._spinner.hide();

        //Mostramos error 
        this._toastr.error(GenericService.getError(error).message, 'Error al guardar.');
      });
    } else {
      this._spinner.hide();
      this._toastr.info("No existen cambios pendientes por guardar");
    }
  }


  //////////////////////////////////////
  ///// Save Asignacion
  //////////////////////////////////////

  saveAsignacion(isAsignacion: boolean) {
    // Get Is Validation Send And Data
    let _response: any = this.validationData(isAsignacion);

    //Vertify exist modifier 
    if (_response.isData) {
      this._spinner.show();

      let data: any = _response.data;

      this._asignacionService.saveAsignacion(data).then((response: any) => {
        if (response.status === 200) {
          //Mostramos error 
          this._toastr.success('Asignación guardada con éxito!');
          //Asignacion Refresh
          //this.router.navigated = false;
          //this.router.navigate([this.router.url]);
          // Cambiamos el valor para que sin problema redireccionar a otra ficha o url
          this.esValidaHayCambios = false;
          // Cambiamos el valor de localstorange para "hay cambios" para no tener problema con pantalla cuando cambiar la ficha
          localStorageHayCambios(false);
          // Go Listado de Asignacion
          this.router.navigate([this.URL_ASIGNACIONES]);
        }
      }, error => {
        //Ocultamos el spinner
        this._spinner.hide();

        //Mostramos error 
        this._toastr.error(GenericService.getError(error).message, 'Error al guardar.');
      });
    } else {
      this._spinner.hide();
      this._toastr.info("No existen cambios pendientes por guardar");
    }
  }

  enviarRevision(){

    //Mostramos el spinner
    this._spinner.show();

    //Guardamos la informacion en BD 
    this._asignacionService.enviarRevision(this.solicitudViatico.id, this.motivo)
        .then(response => {
            //Ocultamos el spinner
            this._spinner.hide();

            //Si nos regreso estatus 200, mostramos mensaje de exito y regresamos al listado
            if (response.status == 200) {
                this._toastr.success(response.message);
                this.router.navigate([this.URL_ASIGNACIONES]);
            }
        }, error => {
            //Ocultamos el spinner
            this._spinner.hide();

            //Mostramos error 
            this._toastr.error(GenericService.getError(error).message);
        }
    );
    return true;
  }

  //////////////////////////////////////

  //////////////////////////////////////
  ///// Other
  //////////////////////////////////////

  validaDeshacer(isBack: boolean) {
    // Vertify button is back
    this.deshacerModal.isBack = isBack;

    if (this.cambios) {
      this.deshacerModal.show();
    } else {
      this.deshacer();
    }
  }

  deshacer() {
    // Cambiamos el valor para que sin problema redireccionar a otra ficha o url
    this.esValidaHayCambios = false;
    // Cambiamos el valor de localstorange para "hay cambios" para no tener problema con pantalla cuando cambiar la ficha
    localStorageHayCambios(false);
    this.router.navigate([this.deshacerModal.isBack ? this.URL_ASIGNACIONES : this.router.url]);
  }

  //Cancel
  cancel() {
    this._spinner.show();
    //this.router.navigated = false;
    this.router.navigate([this.router.url]);
  }

  //Print
  print() {
    window.print();
  }

  // Event Change Fecha Compra
  onChangeFechaCompra() {
    this.minFechaSalida=this.asignacionPasajeForm.controls.fechaCompra.value;   
    this.asignacionPasajeForm.controls.fechaSalida.setValue(null);
    this.dtpSalidaActivo=false;

    this.asignacionPasajeForm.controls.fechaRegreso.setValue(null);
    this.dtpRegresoActivo=true;   

    let fecha1 = new Date(this.solicitudViatico.fechaInicioEvento);
    let fecha2 = this.asignacionPasajeForm.controls.fechaCompra.value;

    if (fecha2 > fecha1) {
      this._toastr.error('La Fecha de Compra debe ser menor que la Fecha Inicio del Evento.');
      this.asignacionPasajeForm.controls.fechaCompra.setValue(null);
    }
  }

  // Event Change Fecha Salida
  onChangeFechaSalida() {
    this.asignacionPasajeForm.controls.fechaRegreso.setValue(null);
    this.minFechaRegreso=new Date(this.solicitudViatico.fechaFinEvento);
    this.maxFechaRegreso=new Date(this.solicitudViatico.fechaRegreso);
    this.dtpRegresoActivo=false;
    this.asignacionPasajeForm.controls.fechaRegreso.setValue(new Date(this.solicitudViatico.fechaRegreso));    

    let fecha1 = this.asignacionPasajeForm.controls.fechaCompra.value;
    let fecha2 = this.asignacionPasajeForm.controls.fechaSalida.value;    

    if (fecha1 && fecha2 <= fecha1) {
      this._toastr.error('La Fecha de Salida debe ser mayor que la Fecha de Compra.');
      this.asignacionPasajeForm.controls.fechaSalida.setValue(null);
    }
  }

  // Event Change Fecha Regreso
  onChangeFechaRegreso() {
    // let fecha1 = this.asignacionPasajeForm.controls.fechaSalida.value;
    // let fecha2 = this.asignacionPasajeForm.controls.fechaRegreso.value;

    // if (fecha1 && fecha2 <= fecha1) {
    //   this._toastr.error('La Fecha de Regreso debe ser mayor que la Fecha de Salida.');
    //   this.asignacionPasajeForm.controls.fechaRegreso.setValue(null);
    // }
  }

  onFechaComprometidoChange(event): void {
    this.asignacion.fechaComprometido = new Date(event.value);
    // Cambiamos el valor de localstorange para "hay cambios" para no tener problema con pantalla cuando cambiar la ficha
    localStorageHayCambios(true);
  }

  //////////////////////////////////////
}