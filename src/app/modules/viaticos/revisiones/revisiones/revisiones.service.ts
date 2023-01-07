import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { RevisionService } from '@services/revision.service';
import { ListadoRevisionSolicitudViatico } from '@models/solicitud_viatico';
import { GenericService } from '@services/generic.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})

export class RevisionesComponentService implements Resolve<any> {

    listadoRevisionSolicitudViatico: ListadoRevisionSolicitudViatico[] = [];

    onRevisionesChanged: BehaviorSubject<any>;
    
    constructor(private _revisionService: RevisionService,
        private toastr: ToastrService,
        private router: Router) {
        this.onRevisionesChanged = new BehaviorSubject({});
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.getListadoFicha()
            ]).then(
                () => {
                    resolve();
                },
                error => {
                    if (GenericService.getError(error).status == 6303) {
                        this.router.navigate(['/forbidden']);
                    } else {
                        this.toastr.error(GenericService.getError(error).message);
                    }
                    reject();
                }
            );
        });
    }

    /**
     * Get listado de Revision
     *
     * @returns {Promise<any>}
     */
    getListadoFicha(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._revisionService.getListadoFicha().then((response: any) => {
                this.listadoRevisionSolicitudViatico = response.data;
                this.onRevisionesChanged.next(response);
                resolve(response);
            }, reject);
        });
    }
}
