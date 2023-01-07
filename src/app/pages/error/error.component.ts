import {Component, HostBinding} from '@angular/core';
import { Router } from '@angular/router';
import {AppConfig} from '../../app.config';

@Component({
  selector: 'app-error',
  styleUrls: [ './error.style.scss' ],
  templateUrl: './error.template.html',
})
export class ErrorComponent {
  @HostBinding('class') classes = 'error-page app';

  config: any;
  router: Router;

  constructor(config: AppConfig,router: Router) {
    this.config=config.getConfig();
    this.router = router;
  }

  searchResult(): void {
    this.router.navigate(['/app', 'dashboard']);
  }
}
