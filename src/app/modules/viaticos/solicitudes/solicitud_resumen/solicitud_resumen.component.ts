import { GenericComponent } from 'app/modules/base/generic.component';
import { Component, OnInit, OnDestroy, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { SolicitudViaticoResumen } from '@models/solicitud_viatico';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SolicitudResumenComponentService } from './solicitud_resumen.service';
import { takeUntil } from 'rxjs/operators';
import { GenericService } from '@services/generic.service';
import { ListadoCMM } from '@models/mapeos/listadoCMM';
import { ArchivoService } from '@services/archivo.service';
import { Archivo } from '@models/archivo';
declare let jQuery: any;

@Component({
    selector: 'solicitud_resumen',
    templateUrl: './solicitud_resumen.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./solicitud_resumen.component.scss']
})
export class SolicitudResumenComponent extends GenericComponent implements AfterViewInit, OnInit, OnDestroy {

    // Variables 
    public solicitud: SolicitudViaticoResumen = new SolicitudViaticoResumen();
    public tipoBoton: string;
    public mostrarAcciones: boolean;
    public formularioCompleto: boolean;
    private alertaId: number;
    public motivo: string = null;
    public historial: any[];
    private unsubscribeAll: Subject<any>;

    //Arreglo para los archivos de fotografias
    fotografias: { [key: number]: string } = {};

    constructor(private spinner: NgxSpinnerService,
        private service: SolicitudResumenComponentService,
        private archivoService: ArchivoService,
        private toastr: ToastrService,
        private router: Router
    ) {
        super();

        // Set the private defaults
        this.unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        //Mostramos el spinner
        this.spinner.show();

        // Subscribe to update rol on changes
        this.service.onSolicitudChanged.pipe(takeUntil(this.unsubscribeAll))
            .subscribe(response => {
                let jsonDatosFicha = this.service.jsonDatosFicha;
                
                if (jsonDatosFicha) {
                    this.solicitud = jsonDatosFicha.solicitud;

                    if (jsonDatosFicha.empleado.archivoFotografia) {
                        this.descargarArchivoTmp(jsonDatosFicha.empleado.archivoFotografia, jsonDatosFicha.empleado.id);
                    }

                    this.mostrarAcciones = jsonDatosFicha.mostrarAcciones;

                    this.alertaId = jsonDatosFicha.alertaId;

                    this.historial = jsonDatosFicha.historial;
                }
            }, error => {
                this.toastr.error(GenericService.getError(error).message);
            });

        this.formularioCompleto = this.service.isFormularioCompleto();

        //Ocultamos  el spinner  
        this.spinner.hide();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this.unsubscribeAll.next();
        this.unsubscribeAll.complete();
    }

    ngAfterViewInit(): void {
        jQuery('.parsleyjs').parsley();
    }

    validarForm(): boolean {
        return true;
    }
    
    guardar(): boolean {
        return true;
    }

    cancelar(): void {
        this.router.navigate(['app/viaticos/solicitudes/']);
    }

    eliminar(): boolean {
        return true;
    }

    cargaSolicitud(solicitudId : number) {
        return this.service.getDatosFicha(solicitudId);
    }

    imprimir() {
        window.print();
    }

    cambiarEstatus(): boolean {
        let estatusId: number;

        switch (this.tipoBoton) {
            case 'autorizar': estatusId = ListadoCMM.EstatusSolicitud.AUTORIZADA; break;
            case 'revision': estatusId = ListadoCMM.EstatusSolicitud.EN_REVISION; break;
            case 'rechazar': estatusId = ListadoCMM.EstatusSolicitud.RECHAZADA; break;
        }

        //Mostramos el spinner
        this.spinner.show();

        //Guardamos la informacion en BD 
        this.service.cambiarEstatus(this.solicitud.id, estatusId, this.motivo, this.alertaId)
            .then(response => {
                //Ocultamos el spinner
                this.spinner.hide();

                //Si nos regreso estatus 200, mostramos mensaje de exito y regresamos al listado
                if (response.status == 200) {
                    this.toastr.success(response.message);
                    this.cancelar();
                }
            }, error => {
                //Ocultamos el spinner
                this.spinner.hide();

                //Mostramos error 
                this.toastr.error(GenericService.getError(error).message);
            }
        );
        return true;
    }

    descargarArchivoTmp(archivo: Archivo, empleadoId: number) {
        this.archivoService.descargarArchivo(archivo.id).then((response: any) => {
            let extension = archivo.rutaFisica.substr(archivo.rutaFisica.indexOf('.'));
            this.fotografias[empleadoId] = this.archivoService.generarURLTmp(response, extension);
        }, (reject) => {
            // cachar el error de forma normal
        });
    }
}