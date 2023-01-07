import { Component, OnInit, ViewEncapsulation, ViewChild, TemplateRef, ViewContainerRef, OnDestroy, AfterViewInit } from '@angular/core';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { fromEvent, Subscription, Subject } from 'rxjs';
import { take, filter, takeUntil } from 'rxjs/operators';
import { Organigrama } from '@models/organigrama';
import { OrganigramaComponentService } from './organigrama.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { isArray } from 'util';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { GenericService } from '@services/generic.service';
import { Empleado } from '@models/empleado';
import { Router, NavigationEnd } from '@angular/router';
import { ListadoCMM } from '@models/mapeos/listadoCMM';
import { GenericComponent } from 'app/modules/base/generic.component';
import { NgOption, NgSelectComponent } from '@ng-select/ng-select';

declare let jQuery: any;

@Component({
  selector: 'app-organigrama',
  templateUrl: './organigrama.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./organigrama.component.scss']
})
export class OrganigramaComponent extends GenericComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('cboResponsable',null) cboResponsable: NgSelectComponent;
  @ViewChild('organigramaMenu', { static: false }) organigramaMenu: TemplateRef<any>;
  @ViewChild('deshacerModal', null) deshacerModal;

  // IDs Nodo
  nodoId: number = 1000000;

  //Menu Mini
  sub: Subscription;
  overlayRef: OverlayRef | null;

  //Nestable
  nest1Options: Object = { group: 1 };

  //UnsubscribeAll
  private unsubscribeAll: Subject<any>;

  //Data organigrama and empleados for "ResponsableId"
  organigramaData: Organigrama[] = [];
  empleados: Empleado[] = [];
  mySubscription: any;
  listadoEmpleados: NgOption[] = [];

  //Formularios
  organigramaForm: FormGroup;
  organigramaEditar: Organigrama = new Organigrama();

  //Toastr
  isValidateRequiredMsg: string = "Debes llenar los campos obligatorios";
  cambios: boolean = false;

  //Toastr Organigrama Messages
  deleteNodeErrorMsg: string = "El nodo padre no se puede eliminar, porque tiene nodos hijos";

  constructor(
    public overlay: Overlay,
    public viewContainerRef: ViewContainerRef,
    private _organigramaService: OrganigramaComponentService,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private _toastr: ToastrService,
    private router: Router
  ) {
    super();
    
    // Set the private defaults
    this.unsubscribeAll = new Subject();

    // this.router.routeReuseStrategy.shouldReuseRoute = function () {
    //   return false;
    // };

    this.mySubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Trick the Router into believing it's last link wasn't previously loaded
        this.router.navigated = false;
      }
    });
  }

  ngOnInit(): void {
    jQuery('#nestable-organigrama').nestable({
      maxDepth: 15
    }).on('change', (event) => {
      //this.updateOrganigrama();
      this.cambios=true;      
    });
    this.loadOrganigrama();
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }

  ngAfterViewInit(): void {
    // this.sss = jQuery('.parsleyjs').parsley().on('form:success', function() {
    //   this.save();
    // }.bind(this));
    //jQuery('.parsleyjsOrganigrama').parsley();
  }

  loadOrganigrama(): void {
    this.spinner.show();
    this._organigramaService.onOrganigramaChanged.pipe(takeUntil(this.unsubscribeAll)).subscribe(response => {
      this.organigramaData = this._organigramaService.organigrama;
      this.empleados = this._organigramaService.empleados;

      let list: NgOption[] = [];                
      this.empleados.forEach(empleado => {
          list.push({id: empleado.id, name: empleado.nombre});                    
      });
      this.listadoEmpleados = [...list];

      this.organigramaForm = this.createOrganigramaForm();      
      this.jsonToNodo();
    }, error => {
      this._toastr.error(GenericService.getError(error).message);
      this.spinner.hide();
    });
  }

  validarVacio(): boolean {
    return this.organigramaData.filter(registro => registro.estatusId == ListadoCMM.EstatusRegistro.ACTIVO).length > 0;
  }

  createOrganigramaForm(): FormGroup {
    return this.formBuilder.group({
      id: [null],
      clave: [' '],
      descripcion: [' '],
      responsableId: [null],
      permiteAutorizacion: [false],
      estatus: [false]
    });
  }

  jsonToNodo(): void {
    //Funcion para JSON convertir a NODOS.
    var jQueryNodoOrganigrama = jQuery('#nodo-organigrama');
    jQueryNodoOrganigrama.empty();
    const nodoIds = this.organigramaData.filter(od => od.nodoPadreId === null);
    nodoIds.map(nodo => {
      jQueryNodoOrganigrama.append(
        "<li class='dd-item dd3-item pixvs-dd-button' data-id='" + nodo.id + "' data-data='" + JSON.stringify(nodo) + "' id='" + nodo.id + "'>" +
        "<div class='pixvs-dd-menu dd-handle pixvs-dd-hundle' id='menu" + nodo.id + "'></div>" +
        "<div id='datatooltip"+nodo.id+"' class='pixvs-position-relative' data-tooltip='"+ nodo.clave + " - " + nodo.descripcion +"'><div class='pixvs-dd-content' id='descripcion" + nodo.id + "' >" + nodo.clave + " - " + nodo.descripcion + "</div></div>" +
        "</li>"
      ).on('contextmenu', "#" + nodo.id, event => {
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();
        this.openOrganigramaMenu(event.originalEvent, nodo);
      });
      jQuery('#descripcion' + nodo.id).on('click', event => {
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();

        if (!this.organigramaForm.invalid) {
          if (this.organigramaForm.controls.id.value !== null) {
            jQuery('#descripcion' + this.organigramaForm.controls.id.value).removeClass('isSelectedNodo');
            this.organigramaData.filter(od => od.id === this.organigramaForm.controls.id.value).map(od => {
              od.clave = this.organigramaForm.controls.clave.value;
              od.descripcion = this.organigramaForm.controls.descripcion.value;
              od.responsableId = this.organigramaForm.controls.responsableId.value;
              od.permiteAutorizacion = this.organigramaForm.controls.permiteAutorizacion.value ? true : false;
              od.estatusId = this.organigramaForm.controls.estatus.value ? ListadoCMM.EstatusRegistro.ACTIVO : ListadoCMM.EstatusRegistro.INACTIVO;
            });
          }

          jQuery('#descripcion' + nodo.id).addClass('isSelectedNodo');
          const editar = this.organigramaData.find(od => od.id === nodo.id);
          this.organigramaForm.controls.id.setValue(editar.id);
          this.organigramaForm.controls.clave.setValue(editar.clave);
          this.organigramaForm.controls.descripcion.setValue(editar.descripcion);
          this.organigramaForm.controls.responsableId.setValue(editar.responsableId);
          this.organigramaForm.controls.permiteAutorizacion.setValue(editar.permiteAutorizacion);
          this.organigramaForm.controls.estatus.setValue(editar.estatusId === ListadoCMM.EstatusRegistro.ACTIVO ? true : false);
          
          this.autorizacionChange(this.organigramaForm.controls.permiteAutorizacion.value);
        } else {
          this._toastr.warning(this.isValidateRequiredMsg);
        }
      });

      let endNodoPadre: boolean = false, nextNodoPadreIds: Array<number> = [], _nextNodoPadreIds: Array<number> = [];
      nextNodoPadreIds.push(nodo.id);

      while (!endNodoPadre) {
        const nodoHijoIds = this.organigramaData.filter(od => od.nodoPadreId === nextNodoPadreIds[0]);
        if (nodoHijoIds.length > 0) {
          nextNodoPadreIds.splice(0, 1);
          nodoHijoIds.map(nodoHijo => {
            var jQueryNodoPadre = jQuery("#" + nodoHijo.nodoPadreId);

            if (jQueryNodoPadre.children('ol.dd-list').length > 0) {
              jQueryNodoPadre.children('ol.dd-list').append(
                "<li class='dd-item dd3-item pixvs-dd-button' data-id='" + nodoHijo.id + "' data-data='" + JSON.stringify(nodoHijo) + "' id='" + nodoHijo.id + "'>" +
                "<div class='pixvs-dd-menu dd-handle pixvs-dd-hundle' id='menu" + nodoHijo.id + "'></div>" +
                "<div id='datatooltip"+nodoHijo.id+"' class='pixvs-position-relative' data-tooltip='"+ nodoHijo.clave + " - " + nodoHijo.descripcion +"'><div class='pixvs-dd-content' id='descripcion" + nodoHijo.id + "'>" + nodoHijo.clave + " - " + nodoHijo.descripcion + "</div></div>" +
                "</li>"
              ).on('contextmenu', "#" + nodoHijo.id, event => {
                event.stopPropagation();
                event.stopImmediatePropagation();
                event.preventDefault();
                this.openOrganigramaMenu(event.originalEvent, nodoHijo);
              });
              jQuery('#descripcion' + nodoHijo.id).on('click', event => {
                event.stopPropagation();
                event.stopImmediatePropagation();
                event.preventDefault();

                if (!this.organigramaForm.invalid) {
                  if (this.organigramaForm.controls.id.value !== null) {
                    jQuery('#descripcion' + this.organigramaForm.controls.id.value).removeClass('isSelectedNodo');
                    this.organigramaData.filter(od => od.id === this.organigramaForm.controls.id.value).map(od => {
                      od.clave = this.organigramaForm.controls.clave.value;
                      od.descripcion = this.organigramaForm.controls.descripcion.value;
                      od.responsableId = this.organigramaForm.controls.responsableId.value;
                      od.permiteAutorizacion = this.organigramaForm.controls.permiteAutorizacion.value ? true : false;
                      od.estatusId = this.organigramaForm.controls.estatus.value ? ListadoCMM.EstatusRegistro.ACTIVO : ListadoCMM.EstatusRegistro.INACTIVO;
                    });
                  }

                  jQuery('#descripcion' + nodoHijo.id).addClass('isSelectedNodo');
                  const editar = this.organigramaData.find(od => od.id === nodoHijo.id);
                  this.organigramaForm.controls.id.setValue(editar.id);
                  this.organigramaForm.controls.clave.setValue(editar.clave);
                  this.organigramaForm.controls.descripcion.setValue(editar.descripcion);
                  this.organigramaForm.controls.responsableId.setValue(editar.responsableId);
                  this.organigramaForm.controls.permiteAutorizacion.setValue(editar.permiteAutorizacion);
                  this.organigramaForm.controls.estatus.setValue(editar.estatusId === ListadoCMM.EstatusRegistro.ACTIVO ? true : false);

                  this.autorizacionChange(this.organigramaForm.controls.permiteAutorizacion.value);
                } else {
                  this._toastr.warning(this.isValidateRequiredMsg);
                }
              });
            } else {
              jQueryNodoPadre.append(
                "<ol class='dd-list'>" +
                "<li class='dd-item dd3-item pixvs-dd-button' data-id='" + nodoHijo.id + "' data-data='" + JSON.stringify(nodoHijo) + "' id='" + nodoHijo.id + "'>" +
                "<div class='pixvs-dd-menu dd-handle pixvs-dd-hundle' id='menu" + nodoHijo.id + "'></div>" +
                "<div id='datatooltip"+nodoHijo.id+"' class='pixvs-position-relative' data-tooltip='"+ nodoHijo.clave + " - " + nodoHijo.descripcion +"'><div class='pixvs-dd-content' id='descripcion" + nodoHijo.id + "'>" + nodoHijo.clave + " - " + nodoHijo.descripcion + "</div></div>" +
                "</li>" +
                "</ol>"
              ).on('contextmenu', "#" + nodoHijo.id, event => {
                event.stopPropagation();
                event.stopImmediatePropagation();
                event.preventDefault();
                this.openOrganigramaMenu(event.originalEvent, nodoHijo);
              });
              jQuery('#descripcion' + nodoHijo.id).on('click', event => {
                event.stopPropagation();
                event.stopImmediatePropagation();
                event.preventDefault();

                if (!this.organigramaForm.invalid) {
                  if (this.organigramaForm.controls.id.value !== null) {
                    jQuery('#descripcion' + this.organigramaForm.controls.id.value).removeClass('isSelectedNodo');
                    this.organigramaData.filter(od => od.id === this.organigramaForm.controls.id.value).map(od => {
                      od.clave = this.organigramaForm.controls.clave.value;
                      od.descripcion = this.organigramaForm.controls.descripcion.value;
                      od.responsableId = this.organigramaForm.controls.responsableId.value;
                      od.permiteAutorizacion = this.organigramaForm.controls.permiteAutorizacion.value ? true : false;
                      od.estatusId = this.organigramaForm.controls.estatus.value ? ListadoCMM.EstatusRegistro.ACTIVO : ListadoCMM.EstatusRegistro.INACTIVO;
                    });
                  }

                  jQuery('#descripcion' + nodoHijo.id).addClass('isSelectedNodo');
                  const editar = this.organigramaData.find(od => od.id === nodoHijo.id);
                  this.organigramaForm.controls.id.setValue(editar.id);
                  this.organigramaForm.controls.clave.setValue(editar.clave);
                  this.organigramaForm.controls.descripcion.setValue(editar.descripcion);
                  this.organigramaForm.controls.responsableId.setValue(editar.responsableId);
                  this.organigramaForm.controls.permiteAutorizacion.setValue(editar.permiteAutorizacion);
                  this.organigramaForm.controls.estatus.setValue(editar.estatusId === ListadoCMM.EstatusRegistro.ACTIVO ? true : false);

                  this.autorizacionChange(this.organigramaForm.controls.permiteAutorizacion.value);
                } else {
                  this._toastr.warning(this.isValidateRequiredMsg);
                }
              });
              jQueryNodoPadre.prepend(
                "<button data-action='collapse'>Collapse</button>" +
                "<button data-action='expand' style='display: none;'>Expand></button>"
              );
            }

            const existNextPadreIds = this.organigramaData.filter(od => od.nodoPadreId === nodoHijo.id);
            if (existNextPadreIds.length > 0) {
              _nextNodoPadreIds.push(existNextPadreIds[0].nodoPadreId);
            }
          });

          if (nextNodoPadreIds.length === 0) {
            if (_nextNodoPadreIds.length > 0) {
              nextNodoPadreIds = _nextNodoPadreIds;
              _nextNodoPadreIds = [];
            } else {
              endNodoPadre = true;
            }
          }

        } else {
          endNodoPadre = true;
        }
      }
    });

    //Mostramos oculto spinner
    this.spinner.hide();
  }

  changeDescripcion(event) {
    jQuery('#descripcion' + this.organigramaForm.controls.id.value)[0].innerHTML = this.organigramaForm.controls.clave.value + " - " + this.organigramaForm.controls.descripcion.value;
    jQuery('#datatooltip' + this.organigramaForm.controls.id.value)[0].setAttribute('data-tooltip',this.organigramaForm.controls.clave.value + " - " + this.organigramaForm.controls.descripcion.value);
  }

  updateOrganigrama() {
    const getOrganigramaData = jQuery('#nestable-organigrama').nestable('serialize');
    const newOrganigramaData: Array<{ id: number, nodoPadreId: number, orden: number }> = [];
    let idPadre: number = 0, ordenPadre: number = 1;  
    
    getOrganigramaData.map(nodo => {
      idPadre = nodo.id;

      newOrganigramaData.push({
        id: nodo.id,
        nodoPadreId: null,
        orden: ordenPadre,
      });
      ordenPadre++;

      if (isArray(nodo.children)) {

        let nodoChildrenOriginal = nodo.children, nodoChildren, nodoChildrenNext;
        nodoChildren = nodoChildrenOriginal;

        let endNodoPadre: boolean = false, isChildren = false; //ordenHijo: number = 1;
        //nextNodoPadreIds.push(nodo.id);

        while (!endNodoPadre) {
          for (let i = 0; i < nodoChildren.length; i++) {
            if (!isChildren) {
              if (isArray(nodoChildren[i].children)) {
                for (let ii = 0; ii < nodoChildren[i].children.length; ii++) {
                  if (!isChildren) {
                    if (newOrganigramaData.filter(od => od.id === nodoChildren[i].children[ii].id).length === 0) {
                      idPadre = nodoChildren[i].id;
                      isChildren = true;
                      nodoChildrenNext = nodoChildren[i].children;
                    }
                  }
                }
                if (!isChildren) {
                  if (newOrganigramaData.filter(od => od.id === nodoChildren[i].id).length === 0) {
                    // newOrganigramaData.push({
                    //   id: nodoChildren[i].id,
                    //   nodoPadreId: idPadre,
                    //   orden: ordenHijo
                    // })
                    //ordenHijo++;
                    newOrganigramaData.push({
                      id: nodoChildren[i].id,
                      nodoPadreId: idPadre,
                      orden: ordenPadre
                    })
                    ordenPadre++;
                  }
                }
              } else {
                if (newOrganigramaData.filter(od => od.id === nodoChildren[i].id).length === 0) {
                  // newOrganigramaData.push({
                  //   id: nodoChildren[i].id,
                  //   nodoPadreId: idPadre,
                  //   orden: ordenHijo
                  // })
                  //ordenHijo++;
                  newOrganigramaData.push({
                    id: nodoChildren[i].id,
                    nodoPadreId: idPadre,
                    orden: ordenPadre
                  })
                  ordenPadre++;
                }
              }
            }
          }

          if (newOrganigramaData.filter(od => od.id === nodoChildrenOriginal[nodoChildrenOriginal.length - 1].id).length > 0) {
            endNodoPadre = true;
          } else {
            if (isChildren) {
              isChildren = false;
              nodoChildren = nodoChildrenNext;
              //ordenHijo = 1;
            } else {
              nodoChildren = nodoChildrenOriginal;
              idPadre = nodo.id;
            }
          }
        }
      }
    });
    
    let whenChange = 0;
    this.organigramaData.filter(od => od.estatusId !== ListadoCMM.EstatusRegistro.BORRADO).map(od => {
      const changeOrganigramaData = newOrganigramaData.find(nod => nod.id === od.id);
      // if(changeOrganigramaData !== null){
      //   if(od.nodoPadreId !== changeOrganigramaData.nodoPadreId){
      //     od.id = changeOrganigramaData.id;
      //     od.nodoPadreId = changeOrganigramaData.nodoPadreId;
      //     od.orden = changeOrganigramaData.orden;
      //     whenChange++;
      //   }
      // }

      od.id = changeOrganigramaData.id;
      od.nodoPadreId = changeOrganigramaData.nodoPadreId;
      od.orden = changeOrganigramaData.orden;
      whenChange++;

    });

    if (whenChange > 0) {
      const send: Array<Organigrama> = this.organigramaData;
      this._organigramaService.saveOrganigrama(send).then((response) => {
        if (response.status === 200) {
          this._toastr.success('La información se ha guardado con éxito!');
        }
      }, error => {
        this._toastr.error(GenericService.getError(error).message, 'Error al guardar.');
      });
    }
  }

  updateArrayOrganigrama(): boolean {
    try {
      const getOrganigramaData = jQuery('#nestable-organigrama').nestable('serialize');
      const newOrganigramaData: Array<{ id: number, nodoPadreId: number, orden: number }> = [];
      let idPadre: number = 0, orden: number = 1;

      getOrganigramaData.map(nodo => {
        idPadre = nodo.id;

        newOrganigramaData.push({
          id: nodo.id,
          nodoPadreId: null,
          orden: orden,
        });
        orden++;

        if (isArray(nodo.children)) {

          let nodoChildrenOriginal = nodo.children, nodoChildren, nodoChildrenNext;
          nodoChildren = nodoChildrenOriginal;

          let endNodoPadre: boolean = false, isChildren = false; //ordenHijo: number = 1;
          //nextNodoPadreIds.push(nodo.id);

          while (!endNodoPadre) {
            for (let i = 0; i < nodoChildren.length; i++) {
              if (!isChildren) {
                if (isArray(nodoChildren[i].children)) {
                  for (let ii = 0; ii < nodoChildren[i].children.length; ii++) {
                    if (!isChildren) {
                      if (newOrganigramaData.filter(od => od.id === nodoChildren[i].children[ii].id).length === 0) {
                        idPadre = nodoChildren[i].id;
                        isChildren = true;
                        nodoChildrenNext = nodoChildren[i].children;
                      }
                    }
                  }
                  if (!isChildren) {
                    if (newOrganigramaData.filter(od => od.id === nodoChildren[i].id).length === 0) {
                      // newOrganigramaData.push({
                      //   id: nodoChildren[i].id,
                      //   nodoPadreId: idPadre,
                      //   orden: ordenHijo
                      // })
                      //ordenHijo++;
                      newOrganigramaData.push({
                        id: nodoChildren[i].id,
                        nodoPadreId: idPadre,
                        orden: orden
                      })
                      orden++;
                    }
                  }
                } else {
                  if (newOrganigramaData.filter(od => od.id === nodoChildren[i].id).length === 0) {
                    // newOrganigramaData.push({
                    //   id: nodoChildren[i].id,
                    //   nodoPadreId: idPadre,
                    //   orden: ordenHijo
                    // })
                    //ordenHijo++;
                    newOrganigramaData.push({
                      id: nodoChildren[i].id,
                      nodoPadreId: idPadre,
                      orden: orden
                    })
                    orden++;
                  }
                }
              }
            }

            if (newOrganigramaData.filter(od => od.id === nodoChildrenOriginal[nodoChildrenOriginal.length - 1].id).length > 0) {
              endNodoPadre = true;
            } else {
              if (isChildren) {
                isChildren = false;
                nodoChildren = nodoChildrenNext;
                //ordenHijo = 1;
              } else {
                nodoChildren = nodoChildrenOriginal;
                idPadre = nodo.id;
              }
            }
          }
        }
      });
      this.organigramaData.filter(od => od.estatusId !== ListadoCMM.EstatusRegistro.BORRADO).map(od => {
        const changeOrganigramaData = newOrganigramaData.find(nod => nod.id === od.id);
        if(changeOrganigramaData){
          od.id = changeOrganigramaData.id;
          od.nodoPadreId = changeOrganigramaData.nodoPadreId;
          od.orden = changeOrganigramaData.orden;
        }
      });

      return true;

    } catch (error) {
      return false;
    }
  }

  updateOrganigramaClave() {
    if (this.organigramaData.find(od => od.id === this.organigramaForm.controls.id.value && od.estatusId !== ListadoCMM.EstatusRegistro.BORRADO).clave !== this.organigramaForm.controls.clave.value && this.organigramaData.filter(od => od.clave === this.organigramaForm.controls.clave.value && od.estatusId !== ListadoCMM.EstatusRegistro.BORRADO).length > 0) {
      this.organigramaForm.controls.clave.setValue("");
      this._toastr.warning("Ya existe un registro con la misma clave");
    }
  }

  openOrganigramaMenu({ x, y }: MouseEvent, data) {
    this.close();
    let openMenu: boolean = false;
    // const positionStrategy = this.overlay.position()
    //   .flexibleConnectedTo({ x, y })
    //   .withPositions([
    //     {
    //       originX: 'end',
    //       originY: 'bottom',
    //       overlayX: 'end',
    //       overlayY: 'top',
    //     }
    //   ]);
    if (this.organigramaData.length > 0) {
      if (!this.organigramaForm.invalid) {
        openMenu = true;
      } else {
        if (data.id === this.organigramaForm.controls.id.value) {
          openMenu = true;
        }
      }
    } else {
      openMenu = true;
    }

    if (openMenu) {
      const positionStrategy = this.overlay.position().global().width("0px").height('0px').left(x + 'px').top(y + 'px');
      this.overlayRef = this.overlay.create({
        positionStrategy,
        scrollStrategy: this.overlay.scrollStrategies.close()
      });

      this.overlayRef.attach(new TemplatePortal(this.organigramaMenu, this.viewContainerRef, {
        $implicit: data
      }));

      this.sub = fromEvent<MouseEvent>(document, 'click').pipe(filter(event => {
        const clickTarget = event.target as HTMLElement;
        return !!this.overlayRef && !this.overlayRef.overlayElement.contains(clickTarget);
      }), take(1)).subscribe(() => this.close())
    } else {
      this._toastr.warning(this.isValidateRequiredMsg);
    }

  }

  eliminar(): boolean {
    throw new Error("Method not implemented.");
  }

  deleteOrganigrama(data) {
    let endNodoPadre: boolean = false, nextNodoPadreIds: Array<number> = [], _nextNodoPadreIds: Array<number> = [];
    nextNodoPadreIds.push(data.id);
    const allNodes = this.organigramaData.filter(od => od.nodoPadreId === nextNodoPadreIds[0] && od.estatusId !== 1000002).length;
   
    if(allNodes > 0){
      this._toastr.error(this.deleteNodeErrorMsg, "Error!");
      return;
    }

    while (!endNodoPadre) {
      const nodoHijoIds = this.organigramaData.filter(od => od.nodoPadreId === nextNodoPadreIds[0]).length;
      if (nodoHijoIds > 0) {

        this.organigramaData.filter(od => od.nodoPadreId === nextNodoPadreIds[0]).map(nodoHijo => {
          nodoHijo.estatusId = ListadoCMM.EstatusRegistro.BORRADO;

          const existNextPadreIds = this.organigramaData.filter(od => od.nodoPadreId === nodoHijo.id);
          if (existNextPadreIds.length > 0) {
            _nextNodoPadreIds.push(existNextPadreIds[0].nodoPadreId);
          }

        });
        nextNodoPadreIds.splice(0, 1);

        if (nextNodoPadreIds.length === 0) {
          if (_nextNodoPadreIds.length > 0) {
            nextNodoPadreIds = _nextNodoPadreIds;
            _nextNodoPadreIds = [];
          } else {
            endNodoPadre = true;
          }
        }
      } else {
        endNodoPadre = true;

        this.organigramaData.find(od => od.id === data.id).estatusId = ListadoCMM.EstatusRegistro.BORRADO;
      }
    }

    if (this.organigramaData.filter(od => od.estatusId !== ListadoCMM.EstatusRegistro.BORRADO).length === 0) {
      jQuery('#nodo-organigrama').empty();
    } else {
      var jQueryNodoPadre = jQuery('#' + data.id);
      if (jQueryNodoPadre.offsetParent().children().length === 1) {
        jQueryNodoPadre.offsetParent().offsetParent().children().slice(0, 2).remove();
        jQueryNodoPadre.offsetParent().remove();
      } else {
        jQueryNodoPadre.remove();
      }
    }
    this.organigramaForm = this.createOrganigramaForm();
    this.close();
    this.cambios = true;
  }

  addOrganigrama(data): void {
console.log("addOrganigraa");
    // Vertify exist form
    if (this.organigramaForm.controls.id.value !== null) {
      this.organigramaData.filter(od => od.id === this.organigramaForm.controls.id.value).map(od => {
        od.clave = this.organigramaForm.controls.clave.value;
        od.descripcion = this.organigramaForm.controls.descripcion.value;
        od.responsableId = this.organigramaForm.controls.responsableId.value;
        od.permiteAutorizacion = this.organigramaForm.controls.permiteAutorizacion.value;
        od.estatusId = this.organigramaForm.controls.estatus.value ? ListadoCMM.EstatusRegistro.ACTIVO : ListadoCMM.EstatusRegistro.INACTIVO;
      });
    }

    let vali: boolean = false;

    // Funcion para agregar el NODO
    const newOrganigrama: Organigrama = new Organigrama();
    newOrganigrama.id = this.nodoId;
    newOrganigrama.nodoPadreId = data.id === null ? null : data.id;
    // newOrganigrama.orden = this.organigramaData.filter(od => od.nodoPadreId === data.id && od.estatusId === ListadoCMM.EstatusRegistro.ACTIVO).length+1;
    //newOrganigrama.orden = this.organigramaData.filter(od => od.estatusId === ListadoCMM.EstatusRegistro.ACTIVO).length+1;
    this.organigramaData.push(newOrganigrama);

    // ID Nodo count
    this.nodoId++;

    if (newOrganigrama.nodoPadreId === null) {
      var jQueryNodoOrganigrama = jQuery('#nodo-organigrama');

      jQueryNodoOrganigrama.append(
        "<li class='dd-item dd3-item pixvs-dd-button' data-id='" + newOrganigrama.id + "' id='" + newOrganigrama.id + "'>" +
        "<div class='pixvs-dd-menu dd-handle pixvs-dd-hundle' id='menu" + newOrganigrama.id + "'></div>" +
        "<div id='datatooltip"+newOrganigrama.id+"' class='pixvs-position-relative' data-tooltip='"+ newOrganigrama.clave + " - " + newOrganigrama.descripcion +"'><div class='pixvs-dd-content' id='descripcion" + newOrganigrama.id + "'>" + newOrganigrama.clave + " - " + newOrganigrama.descripcion + "</div></div>" +
        "</li>"
      ).on('contextmenu', "#" + newOrganigrama.id, event => {
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();
        this.openOrganigramaMenu(event.originalEvent, newOrganigrama);
      });
      jQuery('#descripcion' + newOrganigrama.id).on('click', event => {
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();

        if (!this.organigramaForm.invalid) {
          if (this.organigramaForm.controls.id.value !== null) {
            jQuery('#descripcion' + this.organigramaForm.controls.id.value).removeClass('isSelectedNodo');
            this.organigramaData.filter(od => od.id === this.organigramaForm.controls.id.value).map(od => {
              od.clave = this.organigramaForm.controls.clave.value;
              od.descripcion = this.organigramaForm.controls.descripcion.value;
              od.responsableId = this.organigramaForm.controls.responsableId.value;
              od.permiteAutorizacion = this.organigramaForm.controls.permiteAutorizacion.value;
              od.estatusId = this.organigramaForm.controls.estatus.value ? ListadoCMM.EstatusRegistro.ACTIVO : ListadoCMM.EstatusRegistro.INACTIVO;
            });
          }

          jQuery('#descripcion' + newOrganigrama.id).addClass('isSelectedNodo');
          const editar = this.organigramaData.find(od => od.id === newOrganigrama.id);
          this.organigramaForm.controls.id.setValue(editar.id);
          this.organigramaForm.controls.clave.setValue(editar.clave);
          this.organigramaForm.controls.descripcion.setValue(editar.descripcion);
          this.organigramaForm.controls.responsableId.setValue(editar.responsableId);
          this.organigramaForm.controls.permiteAutorizacion.setValue(editar.permiteAutorizacion);
          this.organigramaForm.controls.estatus.setValue(editar.estatusId === ListadoCMM.EstatusRegistro.ACTIVO ? true : false);
          
          this.autorizacionChange(this.organigramaForm.controls.permiteAutorizacion.value);
        } else {
          this._toastr.warning(this.isValidateRequiredMsg);
        }
      });
    } else {
      var jQueryNodoPadre = jQuery('#' + newOrganigrama.nodoPadreId);
      if (jQueryNodoPadre.children('ol.dd-list').length > 0) {
        jQueryNodoPadre.children('ol.dd-list').append(
          "<li class='dd-item dd3-item pixvs-dd-button' data-id='" + newOrganigrama.id + "' id='" + newOrganigrama.id + "'>" +
          "<div class='pixvs-dd-menu dd-handle pixvs-dd-hundle' id='menu" + newOrganigrama.id + "'></div>" +
          "<div id='datatooltip"+newOrganigrama.id+"' class='pixvs-position-relative' data-tooltip='"+ newOrganigrama.clave + " - " + newOrganigrama.descripcion +"'><div class='pixvs-dd-content' id='descripcion" + newOrganigrama.id + "'>" + newOrganigrama.clave + " - " + newOrganigrama.descripcion + "</div></div>" +
          "</li>"
        ).on('contextmenu', "#" + newOrganigrama.id, event => {
          event.stopPropagation();
          event.stopImmediatePropagation();
          event.preventDefault();
          this.openOrganigramaMenu(event.originalEvent, newOrganigrama);
        });
        jQuery('#descripcion' + newOrganigrama.id).on('click', event => {
          event.stopPropagation();
          event.stopImmediatePropagation();
          event.preventDefault();

          if (!this.organigramaForm.invalid) {
            if (this.organigramaForm.controls.id.value !== null) {
              jQuery('#descripcion' + this.organigramaForm.controls.id.value).removeClass('isSelectedNodo');
              this.organigramaData.filter(od => od.id === this.organigramaForm.controls.id.value).map(od => {
                od.clave = this.organigramaForm.controls.clave.value;
                od.descripcion = this.organigramaForm.controls.descripcion.value;
                od.responsableId = this.organigramaForm.controls.responsableId.value;
                od.permiteAutorizacion = this.organigramaForm.controls.permiteAutorizacion.value;
                od.estatusId = this.organigramaForm.controls.estatus.value ? ListadoCMM.EstatusRegistro.ACTIVO : ListadoCMM.EstatusRegistro.INACTIVO;
              });
            }

            jQuery('#descripcion' + newOrganigrama.id).addClass('isSelectedNodo');
            const editar = this.organigramaData.find(od => od.id === newOrganigrama.id);
            this.organigramaForm.controls.id.setValue(editar.id);
            this.organigramaForm.controls.clave.setValue(editar.clave);
            this.organigramaForm.controls.descripcion.setValue(editar.descripcion);
            this.organigramaForm.controls.responsableId.setValue(editar.responsableId);
            this.organigramaForm.controls.permiteAutorizacion.setValue(editar.permiteAutorizacion);
            this.organigramaForm.controls.estatus.setValue(editar.estatusId === ListadoCMM.EstatusRegistro.ACTIVO ? true : false);

            this.autorizacionChange(this.organigramaForm.controls.permiteAutorizacion.value);
          } else {
            this._toastr.warning(this.isValidateRequiredMsg);
          }
        });
      } else {
        jQueryNodoPadre.append(
          "<ol class='dd-list'>" +
          "<li class='dd-item dd3-item pixvs-dd-button' data-id='" + newOrganigrama.id + "' id='" + newOrganigrama.id + "'>" +
          "<div class='pixvs-dd-menu dd-handle pixvs-dd-hundle' id='menu" + newOrganigrama.id + "'></div>" +
          "<div id='datatooltip"+newOrganigrama.id+"' class='pixvs-position-relative' data-tooltip='"+ newOrganigrama.clave + " - " + newOrganigrama.descripcion +"'><div class='pixvs-dd-content' id='descripcion" + newOrganigrama.id + "'>" + newOrganigrama.clave + " - " + newOrganigrama.descripcion + "</div></div>" +
          "</li>" +
          "</ol>"
        ).on('contextmenu', "#" + newOrganigrama.id, event => {
          event.stopPropagation();
          event.stopImmediatePropagation();
          event.preventDefault();
          this.openOrganigramaMenu(event.originalEvent, newOrganigrama);
        });
        jQuery('#descripcion' + newOrganigrama.id).on('click', event => {
          event.stopPropagation();
          event.stopImmediatePropagation();
          event.preventDefault();

          if (!this.organigramaForm.invalid) {
            if (this.organigramaForm.controls.id.value !== null) {
              jQuery('#descripcion' + this.organigramaForm.controls.id.value).removeClass('isSelectedNodo');
              this.organigramaData.filter(od => od.id === this.organigramaForm.controls.id.value).map(od => {
                od.clave = this.organigramaForm.controls.clave.value;
                od.descripcion = this.organigramaForm.controls.descripcion.value;
                od.responsableId = this.organigramaForm.controls.responsableId.value;
                od.permiteAutorizacion = this.organigramaForm.controls.permiteAutorizacion.value;
                od.estatusId = this.organigramaForm.controls.estatus.value ? ListadoCMM.EstatusRegistro.ACTIVO : ListadoCMM.EstatusRegistro.INACTIVO;
              });
            }

            jQuery('#descripcion' + newOrganigrama.id).addClass('isSelectedNodo');
            const editar = this.organigramaData.find(od => od.id === newOrganigrama.id);
            this.organigramaForm.controls.id.setValue(editar.id);
            this.organigramaForm.controls.clave.setValue(editar.clave);
            this.organigramaForm.controls.descripcion.setValue(editar.descripcion);
            this.organigramaForm.controls.responsableId.setValue(editar.responsableId);
            this.organigramaForm.controls.permiteAutorizacion.setValue(editar.permiteAutorizacion);
            this.organigramaForm.controls.estatus.setValue(editar.estatusId === ListadoCMM.EstatusRegistro.ACTIVO ? true : false);

            this.autorizacionChange(this.organigramaForm.controls.permiteAutorizacion.value);
          } else {
            this._toastr.warning(this.isValidateRequiredMsg);
          }
        });
        jQueryNodoPadre.prepend(
          "<button data-action='collapse'>Collapse</button>" +
          "<button data-action='expand' style='display: none;'>Expand></button>"
        );
      }
    }

    //Set border is selected
    if (this.organigramaForm.controls.id.value !== null) {
      jQuery('#descripcion' + this.organigramaForm.controls.id.value).removeClass('isSelectedNodo');
    }
    jQuery('#descripcion' + newOrganigrama.id).addClass('isSelectedNodo');

    // Set Values in Form
    const editar = this.organigramaData.find(od => od.id === newOrganigrama.id);
    this.organigramaForm.controls.id.setValue(editar.id);
    this.organigramaForm.controls.clave.setValue(editar.clave);
    this.organigramaForm.controls.descripcion.setValue(editar.descripcion);
    this.organigramaForm.controls.responsableId.setValue(editar.responsableId);
    this.organigramaForm.controls.permiteAutorizacion.setValue(editar.permiteAutorizacion);
    this.organigramaForm.controls.estatus.setValue(editar.estatusId === ListadoCMM.EstatusRegistro.ACTIVO ? true : false);

    this.autorizacionChange(this.organigramaForm.controls.permiteAutorizacion.value);

    //Oculto modal de menu
    this.close();
    this.cambios = true;
  }

  close() {
    this.sub && this.sub.unsubscribe();
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  //Validar Permite Autorización
  autorizacionChange(isChecked) {
    if (isChecked) {
      this.organigramaForm.controls.responsableId.setValidators(Validators.required);

      if (!this.organigramaForm.controls.responsableId.value) {
        this.organigramaForm.controls.responsableId.markAsTouched();
        this.cboResponsable.focus();
      }
    } else {
      this.organigramaForm.controls.responsableId.clearValidators();
    }
    this.organigramaForm.controls.responsableId.updateValueAndValidity();
  }

  //Vertify Checkbox Activo
  vertifyCheckbox(event) {
    if (this.organigramaForm.controls.id.value >= 1000000) {
      event.target.checked = true;
    }
  }

  validateOrganigrama() {
    if(this.habilitarForm()){
      this.guardar();
    }else{
      if (jQuery('.parsleyjsOrganigrama').parsley().validate()) {
        this.guardar();
      }
    }
    
  }

  validarForm(): boolean {
    if (this.organigramaForm.invalid) {
      for (var i in this.organigramaForm.controls) {
        this.organigramaForm.controls[i].markAsTouched();
      }
    }

    return this.organigramaForm.valid;
  }

  //////////////////////////////////////
  ///// Save Organigrama
  //////////////////////////////////////

  guardar(): boolean {
    //Si existen datos invalidos en el Form, retornamos
    if (!this.validarForm()) {
      return;
    }

    //Mostramos el spinner
    this.spinner.show();

    //Recuperamos los valores a guardar    
    this.organigramaData.filter(od => od.id === this.organigramaForm.controls.id.value).map(od => {
      od.clave = this.organigramaForm.controls.clave.value;
      od.descripcion = this.organigramaForm.controls.descripcion.value;
      od.responsableId = this.organigramaForm.controls.responsableId.value;
      od.permiteAutorizacion = this.organigramaForm.controls.permiteAutorizacion.value ? true : false;
      od.clave = this.organigramaForm.controls.clave.value;
      od.estatusId = this.organigramaForm.controls.estatus.value ? ListadoCMM.EstatusRegistro.ACTIVO : ListadoCMM.EstatusRegistro.INACTIVO;
    });

    if (this.updateArrayOrganigrama()) {
      const send: Array<Organigrama> = this.organigramaData;
      this._organigramaService.saveOrganigrama(send).then((response) => {
        if (response.status === 200) {
          //Ocultamos el spinner
          this.spinner.hide();

          //Get organigrama
          this.organigramaData = response.data;
          this.jsonToNodo();

          //Clean Form
          this.organigramaForm = this.createOrganigramaForm();

          //Mostramos error 
          this._toastr.success('La información se ha guardado con éxito!');

          return true;
        }
      }, error => {
        //Ocultamos el spinner
        this.spinner.hide();

        //Mostramos error 
        this._toastr.error(GenericService.getError(error).message, 'Error al guardar.');

        return false;
      });
    } else {
      //Ocultamos el spinner
      this.spinner.hide();

      //Mostramos error 
      this._toastr.error(GenericService.getError("Problema, intentalo mas tarde").message, 'Error.');

      return true;
    }
  }

  //////////////////////////////////////

  cancelar(): void {
    this.spinner.show();
    //this.router.navigated = false;

    this.cambios = false;
    jQuery('.parsleyjsOrganigrama').parsley().reset();

    this.router.navigate([this.router.url]);
  }

  habilitarForm() {
    let deshabilitar: boolean = this.organigramaForm.controls.id.value ? false : true;
    
    if (!deshabilitar) {
      this.organigramaForm.controls.responsableId.enable();
    } else {
      this.organigramaForm.controls.responsableId.disable();
    }

    return deshabilitar;
  }
}
