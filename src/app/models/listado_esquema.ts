export class ListadoEsquema {
    public id?: number;
    public nodoMenuId?: number;
    public listadoId?: number;
    public etiqueta?: string;
    public nombreTabla?: string;
    public condicionInicial?: string;
    public tablaControl?: boolean;
    public nombreControl?: string;
    public permiteAgregarRegistros?: boolean;
    public permiteEliminarRegistros?: boolean;
    public timestamp?: string;

    constructor(listadoEsquema?)
    {
        listadoEsquema = listadoEsquema || {};
        this.id = listadoEsquema.id || null;
        this.nodoMenuId = listadoEsquema.nodoMenuId || null;
        this.listadoId = listadoEsquema.listadoId || null;
        this.etiqueta = listadoEsquema.etiqueta || '';
        this.nombreTabla = listadoEsquema.nombreTabla || '';
        this.condicionInicial = listadoEsquema.condicionInicial || '';
        this.tablaControl = listadoEsquema.tablaControl || false;
        this.nombreControl = listadoEsquema.nombreControl || '';
        this.permiteAgregarRegistros = listadoEsquema.permiteAgregarRegistros || false;
        this.permiteEliminarRegistros = listadoEsquema.permiteEliminarRegistros || false;
        this.timestamp = listadoEsquema.timestamp || '';     
    }
}