import { Injectable } from '@angular/core';

import { PaisService } from '@services/pais.service';
import { Pais } from '@models/pais';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PaisesService {

    paises: Pais[];
    onChanged: BehaviorSubject<any>;

    constructor(
        private paisService: PaisService
    ) {
        this.onChanged = new BehaviorSubject({});
    }

    getPaises() {
        return this.paisService.getListadoFicha();
    }

    guardaCambios(paises: Array<Pais>) {
        return this.paisService.guarda(paises);
    }
}