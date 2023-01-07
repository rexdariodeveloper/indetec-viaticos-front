import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { HttpService } from './http.service';
import { AlertaListadoProjection } from '@models/alerta';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { Sesion } from 'app/utils/sesion';

@Injectable({ providedIn: 'root' })
export class AlertaService extends GenericService{

    URL_FICHA: string = '/alertas';    
    URL_LISTADO_ALERTAS = '/listadoalertas';
    URL_ALERTA_AUTORIZAR = '/autorizar';
    URL_ALERTA_REVISION = '/revision';
    URL_ALERTA_RECHAZAR = '/rechazar';
    URL_ALERTA_OCULTAR = '/ocultar';

    public nuevasAlertasBehaivor: BehaviorSubject<Array<AlertaListadoProjection>> = new BehaviorSubject([]);
    public listNuevasAlertas : AlertaListadoProjection[] = [];
    private timeOutAlertas: any = null;

    constructor(private httpService: HttpService) {
        super();
    }

    getListadoNuevasAlertas(){
        if(Sesion.getUsuario() != null){
            clearTimeout(this.timeOutAlertas);
            new Promise((resolve, reject) => {
                this.getListadoAlertas().then((response:any) =>{
                this.listNuevasAlertas = response.data;
                this.nuevasAlertasBehaivor.next(response);
                },reject);
            });
        }
    }

    getListadoAlertas(): Promise<any>{
        return this.httpService.get(this.URL_FICHA + this.URL_LISTADO_ALERTAS, true); 
    }

    iniciarServicio(){
        //this.getListadoNuevasAlertas();
        this.nuevasAlertasBehaivor.subscribe(notificaciones => {
                                    if(!notificaciones){
                                        this.listNuevasAlertas = [];
                                    }
                                    this.timeOutAlertas = setTimeout(() => {
                                        this.getListadoNuevasAlertas();
                                    },30000);
                                });
    }

    detenerServicio(){
        clearTimeout(this.timeOutAlertas);
        this.timeOutAlertas = 0;
    }

    autorizar(alertaId: number): Promise<any> {
        return this.httpService.post(this.URL_FICHA + this.URL_ALERTA_AUTORIZAR, {alertaId: alertaId}, true);
    }

    revision(alertaId: number, motivo: string): Promise<any> {
        return this.httpService.post(this.URL_FICHA + this.URL_ALERTA_REVISION, {alertaId: alertaId, motivo:motivo}, true);
    }

    rechazar(alertaId: number, motivo: string): Promise<any> {
        return this.httpService.post(this.URL_FICHA + this.URL_ALERTA_RECHAZAR, {alertaId: alertaId, motivo:motivo}, true);
    }

    ocultarNotificaciones(listAlertasId: any[]): Promise<any> {
        return this.httpService.post(this.URL_FICHA + this.URL_ALERTA_OCULTAR, {alertasId: JSON.stringify(listAlertasId)}, true);
    }
   
    getDatosFicha(registroId: any): Promise<any> {
        throw new Error("Method not implemented.");
    }

    getListadoFicha(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    guarda(objeto: any): Promise<any> {
        throw new Error("Method not implemented.");
    }

    eliminaPorId(registroId: number): Promise<any> {
        throw new Error("Method not implemented.");
    }
}