export class PolizaComprobacion{
    FechaComprobacion: Date;
    SolicitudViaticoId: number;
    Estatus: string;
    Comprobacion: Comprobacion;

    constructor(){
        this.Comprobacion = new Comprobacion();
    }
}

class Comprobacion {
    Nacional: SubComprobacion;
    Extranjero: SubComprobacionOther;
    SinComprobante: SubComprobacionOther;
    ReintegroViaticante: ReintegroViaticante[];

    constructor(){
        this.Nacional = new SubComprobacion();
        this.Extranjero = new SubComprobacionOther();
        this.SinComprobante = new SubComprobacionOther();
        this.ReintegroViaticante = [];
    }
}

class SubComprobacion {
    Viaticante: FacturaViaticanteAndRM[] = [];
    RecursosMateriales: FacturaViaticanteAndRM[] = [];
}

class SubComprobacionOther {
    Viaticante: ViaticanteAndRM[] = [];
    RecursosMateriales: ViaticanteAndRM[] = [];
}

export class FacturaViaticanteAndRM {
    CatalogoCuentaId?: number;
    ConceptoViaticoId: number;
    ConceptoViaticoNombre: string;
    ObjetoGastoId: number;
    ProveedorId: number;
    FolioFactura: string;
    FormaPago: string;
    TotalFactura: number;
    SubTotalComprobacion: number;
    TotalComprobacion: number;
    Descuento?: number;
    Comentarios: string;
    Impuestos: FacturaViaticanteAndRMImporte;
    Retenciones: FacturaViaticanteAndRMRetencion;

    constructor(){
        this.Impuestos = new FacturaViaticanteAndRMImporte();
        this.Retenciones = new FacturaViaticanteAndRMRetencion();
    }
}

export class ViaticanteAndRM{
    CatalogoCuentaId?: number;
    ConceptoViaticoId: number;
    ConceptoViaticoNombre: string;
    ObjetoGastoId: number;
    ProveedorId: number;
    Folio: string;
    FormaPago: string;
    Moneda: string;
    TipoDeCambio: number;
    Importe: number;
    ImporteEnPesos: number;
    Comentarios: string;
}

export class FacturaViaticanteAndRMImporte {
    ISHTasaOCuota: number = 0;
    ISHComprobacion: number = 0;
    IEPSTasaOCuota: number = 0;
    IEPSComprobacion: number = 0;
    IVATasaOCuota?: number = 0;
    IVAComprobacion?: number = 0;
    OTROTasaOCuota?: number = 0;
    OTROComprobacion?: number = 0; 
}

export class FacturaViaticanteAndRMRetencion {
    RetIVAComprobacion: number = 0;
    RetISRComprobacion: number = 0;
}

export class ReintegroViaticante {
    Importe: number = 0;
}