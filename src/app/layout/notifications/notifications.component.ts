import { Component, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { AppConfig } from '../../app.config';
import { AlertaListadoProjection } from '@models/alerta';
import { Subscription } from 'rxjs';
import { AlertaService } from '@services/alerta.service';
declare let jQuery: any;

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.template.html',
  styleUrls: ['./notifications.style.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy{
  $el: any;
  config: any;

  public mostrar: string = 'autorizaciones';
  public totalAlertas : number;
  public fechaActualizado : Date = new Date();
  public listAutorizaciones: AlertaListadoProjection [];
  public listNotificaciones: AlertaListadoProjection [];
  

  constructor(el: ElementRef, 
              config: AppConfig,
              private alertaService : AlertaService              
              ) {
    this.$el = jQuery(el.nativeElement);
    this.config = config;
  }

  ngOnInit(){
    this.alertaService.nuevasAlertasBehaivor.subscribe(autorizaciones => {
      setTimeout(() => {
        this.totalAlertas = this.alertaService.listNuevasAlertas.length;
        if(this.alertaService.listNuevasAlertas.length > 0){
          this.listAutorizaciones =  this.alertaService.listNuevasAlertas.filter(alerta => alerta.tipoAlertaId == 1000041);
          this.listNotificaciones =  this.alertaService.listNuevasAlertas.filter(alerta => alerta.tipoAlertaId == 1000042);
        }
        else{
          this.listAutorizaciones = [];
          this.listNotificaciones = [];
        }
        this.fechaActualizado = new Date();
      });
    });
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void
  {
      // Unsubscribe from all subscriptions
      //this._unsubscribeAll.unsubscribe();
  }

  cambiarVista(vista: string){
		this.mostrar = vista;
	}

  onRefresh(){
    this.alertaService.getListadoNuevasAlertas();
  }
  
}
