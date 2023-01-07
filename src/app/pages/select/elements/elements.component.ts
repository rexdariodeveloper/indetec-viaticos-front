import {
  Component, ViewEncapsulation, Injector, OnInit,
  OnDestroy
} from '@angular/core';
import { Select2OptionData } from 'ng2-select2';
import * as data from './elements.data';
declare const jQuery: any;

@Component({
  selector: '[elements]',
  templateUrl: './elements.template.html',
  styleUrls: [ './elements.style.scss' ],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: true
})
export class ElementsComponent implements OnInit, OnDestroy {
  date: Date = new Date(2016, 5, 10);
  colorOptions: Object = {color: '#f0b518'};
  injector: Injector;
  domSharedStylesHost: any;
  selected: any;
  select2Options: any = {
    //theme: 'bootstrap'
  };

  constructor(injector: Injector) {
   
  }

  ngOnInit(): void {
    jQuery('#markdown-editor').markdown();
    jQuery('.js-slider').slider();
    jQuery('#colorpicker').colorpicker(this.colorOptions);
    jQuery('.selectpicker').selectpicker();
  }
  
  getSelect2DefaultList(): Select2OptionData[] {
    return data.select2DefaultData;
  }

  getSelect2GroupedList(): Select2OptionData[] {
    return data.select2GroupedData;
  }

  select2Changed(e: any): void {
    this.selected = e.value;
  }

  ngOnDestroy(): void {
    // detach custom hook
    //this.domSharedStylesHost.onStylesAdded = this.domSharedStylesHost.__onStylesAdded__;
  }
}
