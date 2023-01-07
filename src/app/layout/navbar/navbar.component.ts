import { Component, EventEmitter, OnInit, ElementRef, Output, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from '../../app.config';
import {LoginService} from '../../pages/login/login.service';
import { Sesion } from 'app/utils/sesion';
import { AlertaService } from '@services/alerta.service';
import { Subject, Subscription } from 'rxjs';
import { BsDropdownDirective } from 'ngx-bootstrap';
import { Archivo } from '@models/archivo';
import { ArchivoService } from '@services/archivo.service';
declare let jQuery: any;

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.template.html'
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Output() toggleSidebarEvent: EventEmitter<any> = new EventEmitter();
  // @Output() toggleChatEvent: EventEmitter<any> = new EventEmitter();
  $el: any;
  config: any;
  user: any = JSON.parse(localStorage.getItem('user')) || {};

  // Private
  totalAlertas : number;

  //Arreglo para la fotografia
  fotografia: { [key: number]: string } = {};

  constructor(
    el: ElementRef,
    config: AppConfig,
    private router: Router,
    private loginService: LoginService,
    private alertaService : AlertaService,
    private archivoService: ArchivoService
  ) {
    this.$el = jQuery(el.nativeElement);
    this.config = config.getConfig();
		this.alertaService.nuevasAlertasBehaivor.subscribe(autorizaciones => {
                        setTimeout(() => {
                          this.totalAlertas = this.alertaService.listNuevasAlertas.length;
                        });
                      });
  }

  toggleSidebar(state): void {
    this.toggleSidebarEvent.emit(state);
  }

  // toggleChat(): void {
  //   this.toggleChatEvent.emit(null);
  // }

  // onDashboardSearch(f): void {
  //   this.router.navigate(['/app', 'extra', 'search'], { queryParams: { search: f.value.search } });
  // }

  logout() {
    this.loginService.logoutUser();
  }

  firstUserLetter() {
    return (this.user.name || this.user.email || 'P')[0].toUpperCase();
  }

  ngOnInit(): void {
    this.user.name = Sesion.getNombreEmpleado();
    
    if (Sesion.getFotografia()) {
      this.descargarArchivoTmp(Sesion.getFotografia());
    }
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void
  {
      // Unsubscribe from all subscriptions
      //this._unsubscribeAll.unsubscribe();
  }

  descargarArchivoTmp(archivo: Archivo) {
    this.archivoService.descargarArchivo(archivo.id).then((response: any) => {
      let extension = archivo.rutaFisica.substr(archivo.rutaFisica.indexOf('.'));
      this.fotografia[0] = this.archivoService.generarURLTmp(response, extension);
    }, (reject) => {
      // cachar el error de forma normal
    });
  }
}
