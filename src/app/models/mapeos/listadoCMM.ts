export class ListadoCMM{

    static EstatusRegistro = {
        ACTIVO : 1000000,
        INACTIVO : 1000001,
        BORRADO : 1000002,
        AUTORIZADO : 1000022,
        RECHAZADO : 1000023,
        REVISION : 1000024,
        EN_ESPERA_AUTORIZACION: 1000025
    }

    static Listados = {
        LISTADO_PUESTO: 1000010,
        LISTADO_CARGO: 1000011,
        LISTADO_MONEDA: 1000109
    }

    static TipoPasaje = {
        AEREO: 1000022,
        MARITIMO: 1000023,
        TERRESTRE: 1000024
    }

    static TipoNotificacion = {
        AUTORIZACION: 1000041,
        NOTIFICACION: 1000042
    }

    static CategoriaViatico = {
        VIATICO: 1000058,
        PASAJE: 1000059,
        REINTEGRO: 1000060,
        CARGO_SERVICIO: 1000061,
    }

    static TipoComprobante = {
        FACTURA_NACIONAL: 1000050,
        COMPROBANTE_EXTRANJERO: 1000051,
        SIN_COMPROBANTE: 1000052
    }

    static EstatusSolicitud = {
        ACTIVA: 1000100,
        BORRADA: 1000101,
        CANCELADA: 1000102,
        AUTORIZADA: 1000103,
        EN_REVISION: 1000104,
        RECHAZADA: 1000105,
        EN_PROCESO: 1000106,
        EN_REVISION_COMPROBACION: 1000107,
        REVISADA: 1000108,
        FINALIZADA: 1000108,
        RECURSOS_ASIGNADOS: 1000161,
        ENVIADA_FINANZAS: 1000098,
        COMPROBACION_FINALIZADA: 1000099,
        EN_PROCESO_AUTORIZACION_REVISION: 1000096,
        AUTORIZACION_REVISION_APROBADA: 1000097
    }

    static FormaPago = {
        EFECTIVO: 1000053,
        CHEQUE: 1000054,
        TRANSFERENCIA: 1000055,
        TARJETA_CREDITO: 1000056,
        TARJETA_DEBITO: 1000057,
        POR_DEFINIR: 1000062
    }

    static FormaPagoSat = [
        // EFECTIVO
        {
            clave: 1,
            estatusId: ListadoCMM.FormaPago.EFECTIVO
        },
        // CHEQUE
        {
            clave: 2,
            estatusId: ListadoCMM.FormaPago.CHEQUE
        },
        // TRANSFERENCIA
        {
            clave: 3,
            estatusId: ListadoCMM.FormaPago.TRANSFERENCIA
        },
        // TARJEA DE CREDITO
        {
            clave: 4,
            estatusId: ListadoCMM.FormaPago.TARJETA_CREDITO
        },
        // TARJETA DE DEBITO
        {
            clave: 28,
            estatusId: ListadoCMM.FormaPago.TARJETA_DEBITO
        },
        // POR DEFINIR
        {
            clave: 99,
            estatusId: ListadoCMM.FormaPago.POR_DEFINIR
        }
    ]

    static Archivo ={
        PDF: 1000153,
        XML: 1000154,
        IMAGEN: 1000155,
        OTRO: 1000156
    }

    static TipoPermisoAcceso = {
        CREAR_SOLICITUDES_TERCEROS: 1000012,
        VISUALIZAR_SOLICITUDES_TERCEROS: 1000013
    }

    static TipoFactor = {
        TASA: 1000191,
        COUTA: 1000192
    }

    static TipoImpuesto = {
        ISR: 1000193,
        IVA: 1000194,
        IEPS: 1000195,
        ISH: 1000196,
        OTRO:1000210
    }

    static TipoImpuestoNombre = {
        ISR: 'ISR',
        IVA: 'IVA',
        IEPS: 'IEPS',
        ISH: 'ISH',
        OTRO: 'OTRO'
    }

    static SwitchTipoImpuesto(impuestoId: string): number{
        switch(impuestoId){
            case '001':
                return this.TipoImpuesto.ISR;
            case '002':
                return this.TipoImpuesto.IVA;
            case '003':
                return this.TipoImpuesto.IEPS;
            case '004':
                return this.TipoImpuesto.ISH;
            default:
                return this.TipoImpuesto.ISR;
        }
    }

    static SwitchTipoImpuestoImpuestosLocales(impuesto: string): number{
        switch(impuesto){
            case 'ISR':
                return this.TipoImpuesto.ISR;
            case 'IVA':
                return this.TipoImpuesto.IVA;
            case 'IEPS':
                return this.TipoImpuesto.IEPS;
            case 'ISH':
                return this.TipoImpuesto.ISH;
            default:
                return this.TipoImpuesto.OTRO;
        }
    }

    static NodoImpuesto = {
        TRASLADO: 1000197,
        RETENCION: 1000198
    }

    static FormaComprobacion = {
        FACTURA_COMPLETA: 1000208,
        POR_DETALLES: 1000209
    }

    static SwitchFormaComprobacion(formaComprobacionId: number){
        switch(formaComprobacionId){
            case this.FormaComprobacion.FACTURA_COMPLETA:
                return "Factura Completa";
            case this.FormaComprobacion.POR_DETALLES:
                return "Por Detalles";
            default:
                return "Factura...";
        }
    }
} 