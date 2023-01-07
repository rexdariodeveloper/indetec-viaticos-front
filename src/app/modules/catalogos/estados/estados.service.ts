import { Injectable } from '@angular/core';

import { EstadoService } from '@services/estado.service';
import { Estado } from '@models/estado';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EstadosService {

    estados: Estado[];
    onChanged: BehaviorSubject<any>;

    constructor(
        private estadoService: EstadoService
    ) {
        this.onChanged = new BehaviorSubject({});
    }

    getDatosFicha() {
        return this.estadoService.getDatosFicha();
    }

    getEstados() {
        return this.estadoService.getListadoFicha();
    }

    guardaCambios(estados: Array<Estado>) {
        return this.estadoService.guarda(estados);
    }
}