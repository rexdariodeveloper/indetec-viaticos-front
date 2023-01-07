import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EnvironmentService } from './environment.service';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppInitService {

    private config$: Observable<any>;

    constructor(private environmentService: EnvironmentService) { }

    loadAppConfig() {   

        //Carga Environment Local
        if(this.verifyIsLocal()){
            this.config$ = from(
                fetch('assets/config/appconfig_local.json').then(function(response) {
                return response.json();
                })
            );
        }
        //Carga Environment Public
        else{
            this.config$ = from(
                fetch('assets/config/appconfig_public.json').then(function(response) {
                return response.json();
                })
            );
        }
        
        this.environmentService.setEnvironment(this.config$);
        return this.config$.toPromise();
    }

    verifyIsLocal(){
        let isLocal : Boolean = false;
        let baseUrl : string = this.getLocationName();

        if (baseUrl === 'localhost'){
            //localhost
            isLocal = true;
        }
        else if (/^(10)\.(.*)\.(.*)\.(.*)$/.test(baseUrl)){
            //10.x.x.x
            isLocal = true;
        }else if (/^(172)\.(1[6-9]|2[0-9]|3[0-1])\.(.*)\.(.*)$/.test(baseUrl)){
            //172.16.x.x - 172.31.255.255
            isLocal = true;
        }else if (/^(192)\.(168)\.(.*)\.(.*)$/.test(baseUrl)){
            //192.168.x.x
            isLocal = true;
        }
        return isLocal;
    }

    getLocationName(): string {
        if (window
                && "location" in window
                && "protocol" in window.location
                && "pathname" in window.location
                && "host" in window.location) {
            return window.location.hostname
        }
        return null;
      }  
}