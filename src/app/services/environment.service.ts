import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {

  public dynamicEnv: any;

  constructor() { }
  
  /** Setter for environment variable */
  setEnvironment(env: Observable<any>){
    env.subscribe(data => this.dynamicEnv = { ...data});
  }

  /** Getter for environment variable */
  get environment() {
    return this.dynamicEnv;
  }
}