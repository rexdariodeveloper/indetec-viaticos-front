import {Component, HostBinding} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.template.html'
})
export class HomeComponent {
  @HostBinding('class') classes = 'auth-page app';


  constructor(private route: ActivatedRoute) {
  }


}
