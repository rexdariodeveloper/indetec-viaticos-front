import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-modal-confirma-hay-cambios',
  templateUrl: './modal-confirma-hay-cambios.component.html',
  styleUrls: ['./modal-confirma-hay-cambios.component.scss']
})
export class ModalConfirmaHayCambiosComponent implements OnInit {

  esAceptaSubject: Subject<boolean>;

  constructor(private bsModalRef: BsModalRef) { }

  ngOnInit(): void {
    this.esAceptaSubject = new Subject();
}

  onClickAcepta(value: boolean): void{
    this.esAceptaSubject.next(value);
    this.esAceptaSubject.complete();
    this.bsModalRef.hide();
  }
}
