import {Injectable} from '@angular/core';
import {UsuarioService} from '@services/usuario.service';
import { Router } from '@angular/router';
import { Usuario } from '@models/usuario';
import { MenuPrincipal } from '@models/menu_principal';
import { AlertaService } from '@services/alerta.service';

@Injectable({ providedIn: 'root' })
export class LoginService {

  constructor( private _usuarioService : UsuarioService,
               private _alertasService : AlertaService,
               private router : Router) { 
  }

  loginUser(usuario : String, contrasenia : String) : Promise<any>{
    return this._usuarioService.login(usuario, contrasenia);
  }

  logoutUser() {
    localStorage.removeItem('token');    
    localStorage.removeItem('athid');
    localStorage.removeItem('usuario');
    localStorage.removeItem('menu');
    localStorage.removeItem('haycambios');
    this._alertasService.detenerServicio();
    this.router.navigate(['/login']);    
  } 

  isAuthenticated(){
    return localStorage.getItem('token') !== null;
  }

  receiveToken(usuario : Usuario, menu : MenuPrincipal[]) {    
    localStorage.setItem('token', usuario.token);
    localStorage.setItem('athid', usuario.athid);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    localStorage.setItem('menu', JSON.stringify(menu));
    localStorage.setItem('haycambios', 'false');
    this._alertasService.getListadoNuevasAlertas();
    this.receiveLogin();
  }

  receiveLogin() {
    this.router.navigate(['/app/home']);
  }
}