import {Component, HostBinding} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'forbidden-error',
  styleUrls: [ './forbidden.style.scss' ],
  templateUrl: './forbidden.template.html',
})
export class ForbiddenComponent {
  @HostBinding('class') classes = 'error-page app';

  router: Router;

  constructor(router: Router) {
    this.router = router;
  }
}
