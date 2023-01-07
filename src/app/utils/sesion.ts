import { Usuario } from '@models/usuario';
import { MenuPrincipal } from '@models/menu_principal';
import { Archivo } from '@models/archivo';

export abstract class Sesion {

    public static getUsuario() : Usuario {
        return JSON.parse(localStorage.getItem('usuario'));
    }

    public static getNombreEmpleado() : string {
        return Sesion.getUsuario().empleado.nombre + ' '+  Sesion.getUsuario().empleado.primerApellido + ' ' + (Sesion.getUsuario().empleado.segundoApellido !== null ? Sesion.getUsuario().empleado.segundoApellido : '');
    }

    public static getToken() : string {
        return localStorage.getItem('token');
    }

    public static getAthid() : string {
        return localStorage.getItem('athid');
    }

    public static getMenu(): MenuPrincipal[]{
        return JSON.parse(localStorage.getItem('menu'));
    }

    public static getFotografia(): Archivo {
        return this.getUsuario().empleado.archivoFotografia;
    }
}