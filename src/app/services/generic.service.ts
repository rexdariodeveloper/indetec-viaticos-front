
import { JsonResponseError } from '@models/json_response_error';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export abstract class GenericService{

    /**
     * Variables Estaticas con las rutas para las diferentes 
     * acciones en la API
     */
    static URL_DATOS_FICHA : string = '/datosficha';
    static URL_LISTADO : string = '/listado';
    static URL_BUSCAR_POR_ID : string = '/buscaporid';
    static URL_GUARDAR : string = '/guarda';
    static URL_ELIMINAR_POR_ID : string = '/eliminaporid';

    /**
     * Variable para establecer la URL de la API que corresponde con 
     * el Servicio que estemos trabajando.
     */
    abstract URL_FICHA : string = '';
    
    /**
     * Metodo para cargar datos iniciales necesarios para el 
     * correcto funcionamiento de una ficha.
     */
    abstract getDatosFicha(registroId : any) : Promise<any>;

    /**
     * Metodo para cargar uel listado inicial de una Ficha
     */
    abstract getListadoFicha() : Promise<any>;

    /**
     * Metodo para guardar un registro nuevo o actualizar alguno 
     * en base de datos.
     */
    abstract guarda(objeto : any) : Promise<any>;

    /**
     * Metodo que permite eliminar un registro por su Id numerico.
     * @param registroId ID del registro a eliminar.
     */
    abstract eliminaPorId(registroId : number) : Promise<any>;

    /**
     * Metodo para obtener un JsonResponseError a partir de una petición que
     * arrojo una excepción.
     * @param err 
     */
    static getError(err: any) : JsonResponseError{
        console.log(err);
        let jsonResponseError: JsonResponseError = new JsonResponseError();    
        if(err && err._body){
            try{
                switch(err.status){
                    case 0 : jsonResponseError.message = 'Servidor no responde.';
                             jsonResponseError.status = 0;
                             break;
                    default : jsonResponseError = JSON.parse(err._body);            
                }
            }
            catch(err){
                jsonResponseError.message = 'Error desconocido.';
                jsonResponseError.status = 500;
            }            
        }
        else{

        }
        return jsonResponseError;
    }
}