
export abstract class GenericComponent{

    /**
     * Metodo para Inicializar y cargar datos iniciales necesarios para el 
     * correcto funcionamiento de una ficha.
     */
    abstract ngOnInit() : void;

    /**
     * Metodo para validar que la informacion requerida de un Form este completa.
     * @returns : True si la informacion del Form esta completa y es valida; False de lo contrario.
     */
    abstract validarForm() : boolean;

    /**
     * Metodo para guardar un nuevo registro en base de datos o actualizar alguno ya existente.
     * @returns: <b>True</b> si se completo con exito la operación; <b>False</b> de lo contrario.
     */
    abstract guardar() : boolean;

    /**
     * Metodo que nos regresa a un Form anterior sin alterar en base de datos el registro que se 
     * estuviera creando o editando.
     */
    abstract cancelar() : void;

    /**
     * Metodo para eliminar un registro existe en base de datos.
     * @returns: <b>True</b> si se completo con exito la operación; <b>False</b> de lo contrario.
     */
    abstract eliminar() : boolean;

}