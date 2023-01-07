import {
  Component, ViewEncapsulation, Injector, OnInit,
  OnDestroy
} from '@angular/core';
import { Select2OptionData } from 'ng2-select2';
import { ɵDomSharedStylesHost } from '@angular/platform-browser';
import * as data from './elements.data';
import { HttpService } from '@services/http.service';
import { Http, RequestOptions, Headers } from '@angular/http';
import { ArchivoService } from '@services/archivo.service';
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
    theme: 'bootstrap'
  };

  phoneMask = {
    mask: ['(', /[1-9]/, /\d/, /\d/, ')',
      ' ', /\d/, /\d/, /\d/,
      '-', /\d/, /\d/, /\d/, /\d/]
  };

  interPhoneMask = {
    mask: ['+', /[1-9]/, /\d/, /\d/,
      ' ', /\d/, /\d/, /\d/,
      ' ', /\d/, /\d/, /\d/, /\d/,
      ' ', /\d/, /\d/, /\d/, /\d/]
  };

  dateMask = {
    mask: [/\d/, /\d/,
      '-', /\d/, /\d/,
      '-', /[1-9]/, /\d/, /\d/, /\d/]
  };

  timeMask = {
    mask: [/\d/, /\d/,
      ':', /\d/, /\d/]
  };

  phoneValue = '';
  interPhoneValue = '';
  dateValue = '';
  timeValue = '';

  urlTmp: string = null;

  constructor(injector: Injector, private archivoService: ArchivoService) {
    //
    // This is a hack on angular style loader to prevent ng2-select2 from adding its styles.
    // They are hard-coded into the component, so there are no other way to get rid of them
    //
    this.domSharedStylesHost = injector.get(ɵDomSharedStylesHost);
    this.domSharedStylesHost.__onStylesAdded__ = this.domSharedStylesHost.onStylesAdded;
    this.domSharedStylesHost.onStylesAdded = (additions) => {
      const style = additions[0];
      if (!style || !style.trim().startsWith('.select2-container')) {
        this.domSharedStylesHost.__onStylesAdded__(additions);
      }
    };
  }

  ngOnInit(): void {
    jQuery('#markdown-editor').markdown();
    jQuery('.js-slider').slider();
    jQuery('#colorpicker').colorpicker(this.colorOptions);
    jQuery('.selectpicker').selectpicker();
  //   let fileInput: any = document.getElementById("fii");
  //   let http = this.http;
  //   document.getElementById("fii").onchange = function(a) {
  //     let fd = new FormData();
  //     fd.append('file',fileInput.files[0]);
  //     let token = 'eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ2aWF0aWNvcyIsInN1YiI6ImFuZ2VsIiwiaWQiOjUsInVzdWFyaW8iOiJhbmdlbCIsImlkUm9sIjoxLCJpYXQiOjE1ODQyMDg4MTZ9.EDysybBIkYqSjkL9I7mF2rC66LZ98GMEBt_n0oFBkCY';
  //     // fetch('http://localhost:8000/api/archivo/subir', {method: 'POST', body: fd, headers: {'Authorization': 'Bearer ' + token,'Content-Type': 'application/x-www-form-urlencoded'}})
  //     console.log('http - ',http);
  // };
  }

  onArchivo(event){
    let fileList: FileList = event.target.files;
    if(fileList.length > 0) {
        let file: File = fileList[0];
        this.archivoService.subirArchivo(file).then((response: any) => {
          let nombreArchivoTmp = response.data;
          this.descargarArchivoTmp(nombreArchivoTmp);
        }, (reject) => {
          // cachar el error de forma normal
        });
    }
  }

  descargarArchivoTmp(nombreArchivoTmp: string){
    this.archivoService.descargarArchivoTmp(nombreArchivoTmp).then((response: any) => {
      console.log('response',response);
      let extension = nombreArchivoTmp.substr(nombreArchivoTmp.indexOf('.'));
      console.log('archivo - ',nombreArchivoTmp, ' - ', extension)
      this.archivoService.descargarBlob(response, nombreArchivoTmp, extension);
      this.urlTmp = this.archivoService.generarURLTmp(response, extension);
    }, (reject) => {
      // cachar el error de forma normal
    });
  }

  unmask(event) {
    return event.replace(/\D+/g, '');
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
    this.domSharedStylesHost.onStylesAdded = this.domSharedStylesHost.__onStylesAdded__;
  }

  
}
