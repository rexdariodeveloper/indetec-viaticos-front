export class Proveedor {
    public ProveedorId?: number;
    public RazonSocial?: string;
    public RFC?: string;
    public PaisId?: string;
    public TipoProveedorId?: string;
    public Status?: string;
    public TipoOperacionId?: string;
    public DescripcionOperacion?: string;
    public TipoComprobanteFiscalId?: number;

    constructor(proveedor?)
    {
        proveedor = proveedor || {
            ProveedorId: null,
            RazonSocial: '',
            RFC: '',
            PaisId: '',
            TipoProveedorId: '',
            Status: '',
            TipoOperacionId: '',
            DescripcionOperacion: '',
            TipoComprobanteFiscalId: ''
        };
        this.ProveedorId = proveedor.ProveedorId;
        this.RazonSocial = proveedor.RazonSocial;
        this.RFC = proveedor.RFC;
        this.PaisId = proveedor.PaisId;
        this.TipoProveedorId = proveedor.TipoProveedorId;
        this.Status = proveedor.Status;
        this.TipoOperacionId = proveedor.TipoOperacionId;
        this.DescripcionOperacion = proveedor.DescripcionOperacion;
        this.TipoComprobanteFiscalId = proveedor.TipoComprobanteFiscalId;         
    }

}

export class NewProveedor {
    public ProveedorId?: number;
    public RazonSocial?: string;
    public RFC?: string;
    public PaisId?: string;
    public TipoProveedorId?: string;
    public Estatus?: string;
    public TipoOperacionId?: string;
    public DescripcionOperacion?: string;
    public TipoComprobanteFiscalId?: number;

    constructor(proveedor?)
    {
        proveedor = proveedor || {
            ProveedorId: null,
            RazonSocial: '',
            RFC: '',
            PaisId: '',
            TipoProveedorId: '',
            Estatus: '',
            TipoOperacionId: '',
            DescripcionOperacion: '',
            TipoComprobanteFiscalId: ''
        };
        this.ProveedorId = proveedor.ProveedorId;
        this.RazonSocial = proveedor.RazonSocial;
        this.RFC = proveedor.RFC;
        this.PaisId = proveedor.PaisId;
        this.TipoProveedorId = proveedor.TipoProveedorId;
        this.Estatus = proveedor.Estatus;
        this.TipoOperacionId = proveedor.TipoOperacionId;
        this.DescripcionOperacion = proveedor.DescripcionOperacion;
        this.TipoComprobanteFiscalId = proveedor.TipoComprobanteFiscalId;         
    }

}