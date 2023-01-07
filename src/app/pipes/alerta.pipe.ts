import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'AlertaPipe' })
export class AlertaPipe implements PipeTransform {

    constructor(private sanitizer:DomSanitizer){

    }

	transform(motivo: string) {

        let motivoTransform : string; 
        
        motivoTransform = motivo.replace("Solicitud:", "<small><strong>Solicitud:</strong></small>");
        motivoTransform = motivoTransform.replace("a Nombre de:", "<br><small><strong>A Nombre de:</strong></small>");
        motivoTransform = motivoTransform.replace("Estatus:", "<br><small><strong>Estatus:</strong></small>");
        motivoTransform = motivoTransform.replace("Motivo:", "<br><small><strong>Motivo:</strong></small>");

        

        //Solicitud: SV2020000015, a Nombre de: Cesar Alonso Soto Guerrero

        //return this.sanitizer.bypassSecurityTrustHtml(motivoTransform).toString();
            return motivoTransform;
	}
}