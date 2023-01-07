import { NgModule } from '@angular/core';
import { AlertaPipe } from 'app/pipes/alerta.pipe';

@NgModule({
  declarations: [AlertaPipe],
  exports:[AlertaPipe]
})
export class SharedAlertasModule { 
}