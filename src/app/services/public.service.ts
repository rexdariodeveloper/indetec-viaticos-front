import { GenericService } from './generic.service';
import { HttpService } from './http.service';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PublicService {

    URL_FICHA = '/public';
    URL_LOGO = '/getLogo'
    
    constructor(private _httpService: HttpService) { 
        
    }

    getLogo(): Promise<any> {
        return this._httpService.get(this.URL_FICHA + this.URL_LOGO, false);
    }

}