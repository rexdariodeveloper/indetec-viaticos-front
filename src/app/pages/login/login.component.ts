import {Component, HostBinding, OnInit} from '@angular/core';
import {LoginService} from './login.service';
import {ActivatedRoute} from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GenericService } from '@services/generic.service';
import { JsonResponseError } from '@models/json_response_error';
import { ToastrService } from 'ngx-toastr';
import { Usuario } from '@models/usuario';
import { MenuPrincipal } from '@models/menu_principal';
import { CryptoService } from '@services/crypto.service';
import { PublicService } from '@services/public.service';
import { ArchivoService } from '@services/archivo.service';
import { Archivo } from '@models/archivo';
import {AppConfig} from '../../app.config';

@Component({
  selector: 'app-login',
  templateUrl: './login.template.html',
  styleUrls    : ['./login.component.scss'],
})
export class LoginComponent implements OnInit{
  @HostBinding('class') classes = 'auth-page app';

  /**
   * Form Group
   */
  loginForm: FormGroup;

  //Datos para el logo del ente
  logo: Archivo;
  urlTmp: any;
  cargandoLogo: boolean = true;
  config:any;
  constructor(
    config: AppConfig,
    private _formBuilder: FormBuilder,
    private toastr: ToastrService,
    private loginService: LoginService,
    private cryptoService: CryptoService,
    private archivoService: ArchivoService,
    private publicService: PublicService
  ) {
    this.config=config.getConfig();
    // const config: any = appConfig.getConfig();
    // const creds = config.auth;
    // this.email = creds.email;
    // this.password = creds.password;

  }

  /**
   * On init
   */
  ngOnInit(): void
  {

    //Si ya esta logeado un usuario, redireccionarlo al Home
    if (this.loginService.isAuthenticated()) {
      this.loginService.receiveLogin();
    }

    //Recuperamos Variable "recordar" de la Cache del navegador
    let recordar : String = localStorage.getItem("recordar");
    //Cargamos el logo del ente
    this.getLogo();
    //Construimos el Form
    this.loginForm = this._formBuilder.group({
      usuario    : ['', [Validators.required]],
      contrasenia: ['', Validators.required],
      recordar   : []
    });

    //Si existe algun usuario que recordar, llenamos los campos. 
    if(recordar !== null){
      this.loginForm.controls.usuario.setValue(recordar);
      this.loginForm.controls.recordar.setValue(true);
    }
  }

  private validaForm() : boolean{    
    if(this.loginForm.invalid){
      for (var i in this.loginForm.controls)
        this.loginForm.controls[i].markAsTouched();
      return false;
    }
    return true;
  }

  public onLogin() {
    
    //Si existen datos invalidos en el Form, retornamos
    if(!this.validaForm()){
      this.toastr.warning('Datos incompletos');
      return;    
    }

    let usuario : string = this.loginForm.controls.usuario.value;
    let contrasenia : string = this.cryptoService.encrypt(this.loginForm.controls.contrasenia.value);

    //Verificamos en Back las credenciales del Usuario
    this.loginService.loginUser(usuario, contrasenia)
                     .then(
                            (res: any) => {
                              //Recuperamos todos los datos del usuario
                              let usuario : Usuario = res.data.usuario;
                              let token : string = res.data.token;
                              let athid : string = res.data.athid;
                              let menu: MenuPrincipal[] = res.data.menu;

                              usuario.token = token;
                              usuario.athid = athid;

                              //Si se marco la opcion Recordar, guardamos el nombre del Usuario en cache
                              if(this.loginForm.controls.recordar.value){
                                localStorage.setItem('recordar', usuario.usuario);
                              }
                              
                              //Si no, eliminamos de cache la propiedad en caso de que exista.
                              else{
                                localStorage.removeItem('recordar');
                              }

                              //Generamos la Sesion y direccionamos al home
                              this.loginService.receiveToken(usuario, menu);  

                            },
                            (rejected : any) =>{          
                                let error : JsonResponseError = GenericService.getError(rejected);
                                this.toastr.info(error.message);
                            }
                     ), error => {
                      //Mostramos error 
                      this.toastr.error(GenericService.getError(error).message);
                  };
  }

  getLogo() {
    this.publicService.getLogo().then((response: any) => {
          this.logo = response.data.logo;
          if(this.logo){
            this.descargarArchivoTmp(this.logo);
          }
          else{
            this.cargandoLogo = false;
          }
        }, (reject) => {
          // cachar el error de forma normal
        });
  }

  descargarArchivoTmp(archivo: Archivo){
    this.archivoService.descargarArchivoPublic(archivo.id).then((response: any) => {
      let extension = archivo.rutaFisica.substr(archivo.rutaFisica.indexOf('.'));
      this.urlTmp = this.archivoService.generarURLTmp(response, extension);
      this.cargandoLogo = false;
    }, (reject) => {
      // cachar el error de forma normal
    });
  }
}