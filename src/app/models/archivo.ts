import { Usuario } from './usuario';


export class Archivo {
    public id?: string;
    public nombreOriginal?: string;
    public nombreFisico?: string;
    public referenciaId?: number;
    public origenArchivoId?: number;
    public rutaFisica?: string;
    public tipoArchivoId?: number;
    public vigente: boolean;
    public fechaCreacion?: Date;
    public creadoPorId?: number;
    public creadoPor: Usuario;
    public fechaUltimaModificacion: Date;
    public modificadoPorId: number;
    public timestamp: string;

    Archivo?(){
        this.nombreOriginal = '';
        this.nombreFisico = '';
        this.referenciaId = null;
        this.origenArchivoId = null;
        this.rutaFisica = '';
        this.tipoArchivoId = null;
        this.vigente = null;
    }

    constructor(archivo?)
    {
        archivo = archivo || {};
        this.id = archivo.id || null;
        this.nombreOriginal = archivo.nombreOriginal || '';
        this.nombreFisico = archivo.nombreFisico || '';
        this.referenciaId = archivo.referenciaId || null;
        this.origenArchivoId = archivo.origenArchivoId || null;
        this.rutaFisica = archivo.rutaFisica || '';
        this.tipoArchivoId = archivo.tipoArchivoId ||  null;
        this.vigente = archivo.vigente || null;
        this.fechaCreacion = archivo.fechaCreacion || '';
        this.creadoPorId = archivo.creadoPorId || null;
        this.fechaUltimaModificacion = archivo.fechaUltimaModificacion || '';
        this.modificadoPorId = archivo.modificadoPorId || null;
        this.timestamp = archivo.timestamp || ''; 
    }

}

// Tipo de comprobante
export class ArchivoTipoComporbante{
    public id?: string;
    public referenciaId?: number;
    public nombreArchivoTemporal?: string;
    public tipoArchivoId?: number;
    public vigente?: boolean;
    public urlTmp?: string;

    constructor(archivoTipoComprobante?){
        archivoTipoComprobante = archivoTipoComprobante || {
            id: '',
            referenciaId: null,
            nombreArchivoTemporal: '',
            tipoArchivoId: null,
            vigente: true,
            urlTmp: ''
        }
        this.id = archivoTipoComprobante.id;
        this.referenciaId = archivoTipoComprobante.referenciaId;
        this.nombreArchivoTemporal = archivoTipoComprobante.nombreArchivoTemporal;
        this.tipoArchivoId = archivoTipoComprobante.tipoArchivoId;
        this.vigente = archivoTipoComprobante.vigente;
        this.urlTmp  = archivoTipoComprobante.urlTmp;
    }
}