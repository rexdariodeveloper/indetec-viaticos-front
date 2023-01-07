import { CfdiConcepto, Impuesto2, ImpuestosLocale } from "./factura_xml_model";

export interface FacturaConcepto{
  id?: number,
  name?: string,
  importeTotal?: string,
  concepto?: CfdiConcepto,
  impuestos?: Impuesto2,
  impuestosLocale?: ImpuestosLocale,
  disabled?: boolean
}

export interface FacturaConceptoDetalle{
  importe?: number,
  importeOriginal?: number,
  subTotalComprobacion?: number,
  totalComprobacion?: number,
  esUltimaComprobacion?: boolean,
  impuestoComprobacion?: number,
  totalTasaOCouta?: number,
  totalDescuento?: number,
  ISRTasaOCuota?: number,
  IVATasaOCuota?: number,
  IEPSTasaOCuota?: number,
  ISHTasaOCuota?: number,
  OTROTasaOCuota?: number,
}