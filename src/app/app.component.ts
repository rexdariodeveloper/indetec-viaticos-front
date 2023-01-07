import { Component } from '@angular/core';
import { AlertaService } from '@services/alerta.service';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {
  constructor(_alertaService: AlertaService){
    _alertaService.iniciarServicio();
  }
}
