import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {LoginService} from './pages/login/login.service';
import {Injectable} from '@angular/core';
import { Sesion } from './utils/sesion';
import { MenuPrincipal } from '@models/menu_principal';

@Injectable()
export class RolGuard implements CanActivate {
  constructor(
    private router: Router,
    private loginService: LoginService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {

    //Obtenemos la ruta a la que quiere acceder el usuario
    let path: string = route.pathFromRoot.map(v => v.url.map(segment => segment.toString()).join('/')).join('/').replace('/app//','');
    let menuPermisos: MenuPrincipal[] = Sesion.getMenu();

    //Verificamos si el usuario tiene permiso al nodo, de no tenerlo, lo redireccionamos a error forbidden
    if(menuPermisos.filter( nodo => nodo.url === path).length === 0){
      this.router.navigate(['/forbidden']);
      return false;
    }
    return true;
  }
}
