export interface FacturaXMLModel {
  "cfdi:Comprobante"?: CfdiComprobante
}

export interface CfdiComprobante {
  $?: GeneratedType
  "cfdi:Emisor"?: CfdiEmisor[]
  "cfdi:Receptor"?: CfdiReceptor[]
  "cfdi:Conceptos"?: Concepto[]
  "cfdi:Impuestos"?: Impuesto2[]
  "cfdi:Complemento"?: CfdiComplemento[]
}

export interface GeneratedType {
  "xmlns:cfdi"?: string
  "xmlns:xsi"?: string
  "xsi:schemaLocation"?: string
  Version?: string
  Serie?: string
  Folio?: string
  Fecha?: string
  Sello?: string
  FormaPago?: string
  NoCertificado?: string
  Certificado?: string
  SubTotal?: string
  TipoCambio?: string
  Moneda?: string
  Total?: string
  Descuento?: string
  TipoDeComprobante?: string
  MetodoPago?: string
  LugarExpedicion?: string
}

export interface CfdiEmisor {
  $?: GeneratedType2
}

export interface GeneratedType2 {
  Rfc?: string
  Nombre?: string
  RegimenFiscal?: string
}

export interface CfdiReceptor {
  $?: GeneratedType3
}

export interface GeneratedType3 {
  Rfc?: string
  Nombre?: string
  UsoCFDI?: string
}

export interface Concepto {
  "cfdi:Concepto"?: CfdiConcepto[]
}

export interface CfdiConcepto {
  $?: GeneratedType4
  "cfdi:Impuestos"?: Impuesto[]
}

export interface GeneratedType4 {
  ClaveProdServ?: string
  Cantidad?: string
  ClaveUnidad?: string
  Descripcion?: string
  Descuento?: string
  ValorUnitario?: string
  Importe?: string
}

export interface Impuesto {
  "cfdi:Retenciones"?: Retencion[]
  "cfdi:Traslados"?: Traslado[]
}

export interface Retencion {
  "cfdi:Retencion"?: CfdiRetencion[]
}

export interface CfdiRetencion {
  $?: GeneratedType11
}

export interface GeneratedType11 {
  Base?: string
  Impuesto?: string
  TipoFactor?: string
  TasaOCuota?: string
  Importe?: string
}

export interface Traslado {
  "cfdi:Traslado"?: CfdiTraslado[]
}

export interface CfdiTraslado {
  $?: GeneratedType5
}

export interface GeneratedType5 {
  Base?: string
  Impuesto?: string
  TipoFactor?: string
  TasaOCuota?: string
  Importe?: string
}

export interface Impuesto2 {
  $?: GeneratedType6
  "cfdi:Retenciones"?: Retencion2[]
  "cfdi:Traslados"?: Traslado2[]
}

export interface GeneratedType6 {
  TotalImpuestosRetenidos?: string
  TotalImpuestosTrasladados?: string
}

export interface Retencion2 {
  "cfdi:Retencion"?: CfdiRetencion2[]
}

export interface CfdiRetencion2 {
  $?: GeneratedType13
}

export interface GeneratedType13 {
  Impuesto?: string
  Importe?: string
}

export interface Traslado2 {
  "cfdi:Traslado"?: CfdiTraslado2[]
}

export interface CfdiTraslado2 {
  $?: GeneratedType7
}

export interface GeneratedType7 {
  Impuesto?: string
  TipoFactor?: string
  TasaOCuota?: string
  Importe?: string
}

export interface CfdiComplemento {
  "implocal:ImpuestosLocales"?: ImpuestosLocale[]
  "tfd:TimbreFiscalDigital"?: TfdTimbreFiscalDigital[]
}

export interface ImpuestosLocale {
  $?: GeneratedType8
  "implocal:TrasladosLocales"?: TrasladosLocale[]
  "implocal:RetencionesLocales"?: RetencionesLocale[]
}

export interface GeneratedType8 {
  "xmlns:implocal"?: string
  "xsi:schemaLocation"?: string
  version?: string
  TotaldeRetenciones?: string
  TotaldeTraslados?: string
}

export interface RetencionesLocale {
  $?: GeneratedType12
}

export interface GeneratedType12 {
  ImpLocRetenido?: string
  TasadeRetencion?: string
  Importe?: string
}

export interface TrasladosLocale {
  $?: GeneratedType9
}

export interface GeneratedType9 {
  ImpLocTrasladado?: string
  TasadeTraslado?: string
  Importe?: string
}

export interface TfdTimbreFiscalDigital {
  $?: GeneratedType10
}

export interface GeneratedType10 {
  "xmlns:tfd"?: string
  "xsi:schemaLocation"?: string
  Version?: string
  UUID?: string
  FechaTimbrado?: string
  SelloCFD?: string
  NoCertificadoSAT?: string
  SelloSAT?: string
  RfcProvCertif?: string
}