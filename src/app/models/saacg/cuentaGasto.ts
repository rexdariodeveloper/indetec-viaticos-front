export class CuentaGasto{

    CatalogoCuentaId: number;
    Cuenta?: string;
    Nombre?: string;

    constructor(cuenta?){
        cuenta = cuenta || {
            CatalogoCuentaId: null,
            Cuenta: '',
            Nombre: ''
        };
        this.CatalogoCuentaId = cuenta.CatalogoCuentaId;
        this.Cuenta = cuenta.Cuenta;
        this.Nombre = cuenta.Nombre;
    }
}