import { Injectable } from '@angular/core';

import { CiudadService } from '@services/ciudad.service';
import { Ciudad } from '@models/ciudad';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CiudadesService {

    ciudades: Ciudad[];
    onChanged: BehaviorSubject<any>;

    constructor(
        private ciudadService: CiudadService
    ) {
        this.onChanged = new BehaviorSubject({});
    }

    getDatosFicha() {
        return this.ciudadService.getDatosFicha();
    }

    getCiudades() {
        return this.ciudadService.getListadoFicha();
    }

    guardaCambios(ciudades: Array<Ciudad>) {
        return this.ciudadService.guarda(ciudades);
    }
}