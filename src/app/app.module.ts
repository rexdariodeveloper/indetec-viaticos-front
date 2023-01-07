import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule, PreloadAllModules } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { HttpModule } from '@angular/http';

import { ROUTES } from './app.routes';
import { AppComponent } from './app.component';
import { AppConfig } from './app.config';
import { ErrorComponent } from './pages/error/error.component';
import { ForbiddenComponent } from './pages/forbidden/forbidden.component';
import { AppInterceptor } from './app.interceptor';
import { LoginService } from './pages/login/login.service';
import { AppGuard } from './app.guard';
import { HttpService } from '../app/services/http.service';
import { RolGuard } from './rol.guard';
import { AlertaService } from '@services/alerta.service';
import { AppInitService } from '@services/app-init.service';

import { CanDeactivateGuard } from './services/can-deactivate-guard.service';
import { BsModalService, ComponentLoaderFactory,  ModalModule, PositioningService } from 'ngx-bootstrap';
import { ModalConfirmaHayCambiosComponent } from './components/modal/modal-confirma-hay-cambios/modal-confirma-hay-cambios.component';

const APP_PROVIDERS = [
  AppConfig,
  LoginService,
  AppGuard,
  RolGuard
];

@NgModule({
  bootstrap: [ AppComponent ],
  declarations: [
    AppComponent,
    ErrorComponent,
    ForbiddenComponent,
    ModalConfirmaHayCambiosComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ModalModule,
    HttpModule,
    ToastrModule.forRoot(
      {
        timeOut: 5000,
        positionClass: 'toast-bottom-right',
        preventDuplicates: true,
        closeButton: true
      },
    ),
    RouterModule.forRoot(ROUTES, {
      preloadingStrategy: PreloadAllModules,
      onSameUrlNavigation: 'reload'
    })
  ],
  providers: [
    APP_PROVIDERS,
    AppInitService,
    {
      provide: HTTP_INTERCEPTORS, useClass: AppInterceptor, multi: true
    },
    {
      // This is where the magic happens. NOTE we are returning an Observable and converting it to Promise
      // IMPORTANT It has to be a Promise 
      provide: APP_INITIALIZER,
      useFactory: (appInit: AppInitService) => () => appInit.loadAppConfig(),
      deps: [AppInitService],
      multi: true
    },
    HttpService,
    AlertaService,
    CanDeactivateGuard,
    BsModalService,
    ComponentLoaderFactory,
    PositioningService
  ],
  entryComponents: [
    ModalConfirmaHayCambiosComponent
  ]
})

export class AppModule {}
