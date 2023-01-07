import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { GenericService } from './generic.service';

@Injectable({ providedIn: 'root' })
export class UsuarioService implements GenericService{

    URL_FICHA: string = '/usuario';

    constructor(
        private _httpService: HttpService
    ) {

    }

    getDatosFicha(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    getListadoFicha(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    guarda(objeto: any): Promise<any> {
        throw new Error("Method not implemented.");
    }

    eliminaPorId(registroId: number): Promise<any> {
        throw new Error("Method not implemented.");
    }

    login(usuario: String, contrasenia: String) : Promise<any>{
        let data = JSON.stringify({usuario, contrasenia});
        return this._httpService.post(this.URL_FICHA + '/login', data, false);
    }

}