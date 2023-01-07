export class PaisSAACG {
    public PaisId?: string;
    public Nombre?: string;

    constructor(pais?)
    {
        pais = pais || {
            PaisId: '',
            Nombre: ''
        };
        this.PaisId = pais.PaisId;
        this.Nombre = pais.Nombre;        
    }
}