import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitudResumenComponent } from './solicitudes/solicitud_resumen/solicitud_resumen.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ModalModule } from 'ngx-bootstrap';
import { FormsModule } from '@angular/forms';
import { UtilsModule } from 'app/layout/utils/utils.module';

@NgModule({
  declarations: [SolicitudResumenComponent],
  imports: [
    CommonModule,
    NgxSpinnerModule,
    ModalModule.forRoot(),
    FormsModule,
    UtilsModule
  ],
  exports:[SolicitudResumenComponent]
})
export class ComponentsModule { 
}