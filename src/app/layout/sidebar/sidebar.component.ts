import {Component, OnInit, ElementRef, AfterViewInit} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { AppConfig } from '../../app.config';
import { MenuPrincipal } from '@models/menu_principal';
import { PublicService } from '@services/public.service';
import { ArchivoService } from '@services/archivo.service';
import { Sesion } from 'app/utils/sesion';
import { Archivo } from '@models/archivo';
declare let jQuery: any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.template.html'
})

export class SidebarComponent implements OnInit, AfterViewInit {
  $el: any;
  config: any;
  configFn: any;
  router: Router;
  location: Location;
  menuPrincipal: NodoMenu[];
  //Variables para el logo del ente
  logo: Archivo;
  urlTmp: any;
  cargandoLogo: boolean = true;

  constructor(config: AppConfig, el: ElementRef, router: Router, location: Location,private archivoService: ArchivoService,private publicService: PublicService) {
    this.$el = jQuery(el.nativeElement);
    this.config = config.getConfig();
    this.configFn = config;
    this.router = router;
    this.location = location;
  }

  initSidebarScroll(): void {
    const $sidebarContent = this.$el.find('.js-sidebar-content');
    if (this.$el.find('.slimScrollDiv').length !== 0) {
      $sidebarContent.slimscroll({
        destroy: true
      });
    }
    $sidebarContent.slimscroll({
      height: window.innerHeight,
      size: '12px',
      color: '#e5e7f1',
    });
  }

  changeActiveNavigationItem(location): void {
    const $newActiveLink = this.$el.find('a[href="#' + location.path().split('?')[0] + '"]');

    // collapse .collapse only if new and old active links belong to different .collapse
    if (!$newActiveLink.is('.active > .collapse > li > a')) {
      this.$el.find('.active .active').closest('.collapse').collapse('hide');
    }

    // uncollapse parent
    $newActiveLink.closest('.collapse').addClass('in').css('height', '')
      .siblings('a[data-toggle=collapse]').removeClass('collapsed');
  }

  ngAfterViewInit(): void {
    this.changeActiveNavigationItem(this.location);
  }

  toggleSidebarOverflow($event) {
    jQuery('#sidebar').css('z-index', $event ? '2' : '0' );
    jQuery('.js-sidebar-content, .slimScrollDiv').css('overflow', $event ? 'visible' : 'hidden');
  }

  ngOnInit(): void {
    //Cargamos el logo del ente
    this.getLogo();
    this.construyeMenu();
    jQuery(window).on('sn:resize', this.initSidebarScroll.bind(this));
    this.initSidebarScroll();

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.changeActiveNavigationItem(this.location);
      }
    });
  }

  logout() {
    this.router.navigate(['/login']);
  }

  construyeMenu(){

    let menuPrincipal = Sesion.getMenu();
    let nodos : NodoMenu[] = [];

    menuPrincipal.filter(menu => menu.nodoPadreId === null).forEach(nodoPadre =>{
        let nodo : NodoMenu = new NodoMenu();
        nodo.padre = nodoPadre;
        nodo.hijos = menuPrincipal.filter(menu => menu.nodoPadreId === nodoPadre.id);
        nodos.push(nodo);
    });

    this.menuPrincipal = nodos;

    

  }

  getLogo() {
    this.publicService.getLogo().then((response: any) => {
          this.logo = response.data.logo;
          if(this.logo){
            this.descargarArchivoTmp(this.logo);
          }
          else{
            this.cargandoLogo = false;
          }
        }, (reject) => {
          // cachar el error de forma normal
        });
  }

  descargarArchivoTmp(archivo: Archivo){
    this.archivoService.descargarArchivo(archivo.id).then((response: any) => {
      let extension = archivo.rutaFisica.substr(archivo.rutaFisica.indexOf('.'));
      this.urlTmp = this.archivoService.generarURLTmp(response, extension);
      this.cargandoLogo = false;
    }, (reject) => {
      // cachar el error de forma normal
    });
  }

}

class NodoMenu{
  padre : MenuPrincipal;
  hijos : MenuPrincipal[];
}