import { Injectable } from "@angular/core";
import {Http, Response, Headers, RequestOptions, ResponseContentType} from "@angular/http";
import "rxjs/add/operator/map";
import { environment } from "../../environments/environment";
import { Usuario } from "@models/usuario";
import { Sesion } from 'app/utils/sesion';
import { EnvironmentService } from './environment.service';

@Injectable({ providedIn: 'root' })
export class HttpService{
    constructor(protected _http:Http, protected _environment : EnvironmentService){
    }

    private request(path : string, data : any, auth:boolean, method: string, isUploadFile: boolean = false, isDownloadFile: boolean = false){
        
        let url = this._environment.dynamicEnv.apiURL;
        let headers : Headers = new Headers;

        headers.set('Content-Type' , 'application/json');
        headers.set('Accept' , '*/*');

        if(isUploadFile){
             headers = new Headers({'Accept': '*/*'}); // ... Set content type to JSON
        }
        //Ejercicio de la solicitud para regresar las cuentas contables activas de Recursos Materiales correspondientes
        if(data!=null && data.ejercicio){           
            headers.set('ejercicio' , data.ejercicio);
        }       

        let options; // Create a request option
        if(isDownloadFile){
            options = new RequestOptions({ headers : headers, responseType: ResponseContentType.Blob }); // Create a request option
        }else{
            options = new RequestOptions({ headers : headers }); // Create a request option
        }

        //Si es necesario el Token, agregarlo al Header
        if(auth){
            let usuario : Usuario = Sesion.getUsuario();
            headers.set('Authorization' , 'Bearer ' + usuario.token);
            headers.set('Athid', Sesion.getAthid());
            url = url + '/api' + path;
        }
        //Si no, Solo agregamos el path a la url
        else{
            url += path;
        }

        switch(method){
            case 'post':
                return this._http.post(url, data, options)
                                 .map((response: Response)=>response.json());

            case 'put':
                return this._http.put(url, data, options)
                                    .map((response: Response)=>response.json());
           
            case 'get':
                return this._http.get(url, options)
                                 .map((response: Response)=>{return response.json()});
        }    
    }

	post(path: string, data: any, auth: boolean) : Promise<any>{
		return this.request(path, data, auth, 'post').toPromise();
    }

    postRegisterProveedor(path: string, data: any,ejercicio: Number, auth: boolean) : Promise<any>{
		return this.request(path, data, auth, 'post').toPromise();
    }

    postUploadFile(path: string, data: any, auth: boolean) : Promise<any>{
		return this.request(path, data, auth, 'post', true).toPromise();
    }

    postDownloadFile(path: string, data: any, auth: boolean) : Promise<any>{
		return this.request(path, data, auth, 'post', false, true).toPromise();
    }
    
    put(path: string, data: any, auth: boolean) : Promise<any>{
		return this.request(path, data, auth, 'put').toPromise();
	}

	get(path: string, auth: boolean) : Promise<any> {
		return this.request(path, null, auth, 'get').toPromise();
	}
    getRFC(path: string,ejercicio:any, auth: boolean) : Promise<any> {
		return this.request(path, ejercicio, auth, 'get').toPromise();
	}

    getCtasActivasRM(path: string, ejercicio:any ,auth: boolean) : Promise<any> {       
		return this.request(path, ejercicio, auth, 'get').toPromise();
	}
}