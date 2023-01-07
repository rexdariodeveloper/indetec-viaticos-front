import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { HttpService } from './http.service';

@Injectable({ providedIn: 'root' })
export class ArchivoService extends GenericService {

    URL_FICHA: string = '/archivos';
    URL_FICHA_PUBLIC: string = '/public'

    URL_SUBIR: string = '/subir';
    URL_DESCARGAR_RAIZ: string = '/descargar/raiz';
    URL_DESCARGAR_TMP: string = '/descargar/tmp';

    constructor(private httpService: HttpService) {
		super();
    }
    
    getDatosFicha(): Promise<any> {
        console.error('ArchivoService.getDatosFicha - No implementado');
		return null;
	}
	
	getListadoFicha(): Promise<any> {
		console.error('ArchivoService.getListadoFicha - No implementado');
		return null;
	}
	
	guarda(archivo: any): Promise<any> {
		console.error('ArchivoService.guarda - No implementado');
		return null;
	}
	
	eliminaPorId(id: number): Promise<any> {
		console.error('ArchivoService.eliminaPorId - No implementado');
		return null;
    }
    
    subirArchivo(archivo: File){
        let formData = new FormData();
        formData.append('file',archivo);
        return this.httpService.postUploadFile(this.URL_FICHA + this.URL_SUBIR, formData, true);
    }

    descargarArchivoTmp(nombreArchivoTmp: string){
		return this.httpService.postDownloadFile(this.URL_FICHA + this.URL_DESCARGAR_TMP, nombreArchivoTmp, true);
    }

    descargarArchivoPublic(archivoId: string){
        let body = {
            archivoId
        };
        return this.httpService.postDownloadFile(this.URL_FICHA_PUBLIC + this.URL_DESCARGAR_RAIZ, body, false);
    }

    descargarArchivo(archivoId: string){
        let body = {
            archivoId
        };
        return this.httpService.postDownloadFile(this.URL_FICHA + this.URL_DESCARGAR_RAIZ, body, true);
    }

    obtenerContentType(archivoExtension: string): string{
		switch(archivoExtension){
			case ".xml":
				return "application/xml";
			case ".pdf":
				return "application/pdf";
			case ".jpg":
				return "image/jpg";
			case ".jpeg":
				return "image/jpeg";
			case ".pjpeg":
				return "image/pjpeg";
			case ".png":
				return "image/png";
			case ".gif":
				return "image/gif";
			case ".jfif":
				return "image/jpeg";
			default:
				return "image/*";
		}
	}

	descargarBlob(blob: Blob, archivoNombre?: string, archivoExtension?: string): boolean{
		try{
			if(archivoExtension){
				blob = new Blob([blob], {type: this.obtenerContentType(archivoExtension)});
			}
            let fileURL: string = window.URL.createObjectURL(blob);
			let a: any = document.createElement("a");
		    document.body.appendChild(a);
		    a.style = "display: none";
			a.href = fileURL;
			a.download = archivoNombre || ("temp" + (archivoExtension || ""));
			a.click();
			window.URL.revokeObjectURL(fileURL);
			document.body.removeChild(a);
			return true;
		}catch(e){
			console.log(e);
			return false;
		}
	}

	generarURLTmp(blob: Blob, archivoExtension?: string): string{
		try{
			if(archivoExtension){
				blob = new Blob([blob], {type: this.obtenerContentType(archivoExtension)});
			}
			return window.URL.createObjectURL(blob);
		}catch(e){
			console.log(e);
			return null;
		}
	}

}