import { GenericService } from './generic.service';
import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

@Injectable({ providedIn: 'root' })
export class SolicitudService extends GenericService {

    URL_FICHA: string = '/solicitudviatico';
    URL_RESUMEN_DETALLE: string = '/resumen/detalle';
    URL_RESUMEN_DETALLE_ESTATUS: string = '/resumen/detalle/estatus';
    URL_ENVIAR: string = '/enviar';
    URL_DATOS_PROGRAMA: string = '/datosprograma';
    URL_CANCELAR: string = '/cancelar';
    URL_IMPRIMIR: string = '/imprimir';
    URL_REPORTE_TRANSPARENCIA: string = '/reporte_transparencia';
    URL_REPORTE_TRANSPARENCIA_DESCARGAR: string = '/reporte_transparencia/descargar';
    URL_REPORTE_TRANSPARENCIA_CONCENTRADO_DESCARGAR: string = '/reporte_transparencia_concentrado/descargar';

    constructor(private _httpService: HttpService) {
        super();
    }

    getDatosFicha(registroId: any): Promise<any> {
        throw new Error("Method not implemented.");
    }

    getDatosFichaEmpleado(solicitudId: any, empleadoId: any): Promise<any> {
        let data: any = solicitudId == null ? JSON.stringify({ empleadoId }) : JSON.stringify({ solicitudId });
        return this._httpService.post(this.URL_FICHA + GenericService.URL_DATOS_FICHA, data, true);
    }

    getListadoFicha(): Promise<any> {
        return this._httpService.get(this.URL_FICHA + GenericService.URL_LISTADO, true);
    }

    guarda(data: any): Promise<any> {
        return this._httpService.post(this.URL_FICHA + GenericService.URL_GUARDAR, data, true);
    }

    eliminaPorId(id: number): Promise<any> {
        return this._httpService.post(this.URL_FICHA + GenericService.URL_ELIMINAR_POR_ID, {id: id}, true);
    }

    getSolicitudResumenDetalle(id: number, formularioCompleto: boolean): Promise<any> {
        return this._httpService.post(this.URL_FICHA + this.URL_RESUMEN_DETALLE, { id: id, formularioCompleto: formularioCompleto }, true);
    }

    cambiarEstatusSolicitudPorId(id: number, estatusId: number, motivo: string): Promise<any> {
        return this._httpService.post(this.URL_FICHA + this.URL_RESUMEN_DETALLE_ESTATUS, { id: id, estatusId: estatusId, motivo: motivo }, true);
    }

    enviar(id: number): Promise<any> {
        return this._httpService.post(this.URL_FICHA + this.URL_ENVIAR, id, true);
    }

    getDatosPrograma(ejercicio: number): Promise<any> {
        return this._httpService.post(this.URL_FICHA + this.URL_DATOS_PROGRAMA, ejercicio, true);
    }

    cancelar(id: number): Promise<any> {
        return this._httpService.post(this.URL_FICHA + this.URL_CANCELAR, {id: id}, true);
    }

    imprimir(id: number): Promise<any> {
        return this._httpService.postDownloadFile(this.URL_FICHA + this.URL_IMPRIMIR, id, true);
    }

    reporteTransparencia(fechaInicio: Date, fechaFin: Date): Promise<any> {
        return this._httpService.post(this.URL_FICHA + this.URL_REPORTE_TRANSPARENCIA, { fechaInicio, fechaFin }, true);
    }

    descargarReporteTransparencia(fechaInicio: Date, fechaFin: Date, fechaValidacion: Date, fechaActualizacion: Date, rows: any): Promise<any> {
        return this._httpService.postDownloadFile(this.URL_FICHA + this.URL_REPORTE_TRANSPARENCIA_DESCARGAR, { fechaInicio, fechaFin, fechaValidacion, fechaActualizacion, rows }, true);
    }

    descargarReporteTransparenciaConcentrado(solicitudIds: string): Promise<any> {
        return this._httpService.postDownloadFile(this.URL_FICHA + this.URL_REPORTE_TRANSPARENCIA_CONCENTRADO_DESCARGAR, solicitudIds, true);
    }
}