import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from '@angular/router';
import { ModalConfirmaHayCambiosComponent } from 'app/components/modal/modal-confirma-hay-cambios/modal-confirma-hay-cambios.component';
import { GenericComponent } from 'app/modules/base/generic.component';
import { BsModalService } from 'ngx-bootstrap';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs/Observable';

export interface CanComponentDeactivate {
    canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable()
export class CanDeactivateGuard implements CanDeactivate<GenericComponent> {

    constructor(private bsModalService: BsModalService){}

    canDeactivate(
        component: GenericComponent,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState?: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
          if(JSON.parse(localStorage.getItem('haycambios'))){
            const esAceptaSubject = new Subject<boolean>(),
              modal = this.bsModalService.show(ModalConfirmaHayCambiosComponent, { backdrop: 'static' });
            modal.content.esAceptaSubject = esAceptaSubject;
            return esAceptaSubject.asObservable();
          }
          return true;
        }


}