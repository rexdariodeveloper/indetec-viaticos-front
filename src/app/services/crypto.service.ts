import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from 'environments/environment';
@Injectable({ providedIn: 'root' })
export class CryptoService {
​
    private paddingKey(key: string): string {
        let keyPadded = key;
        if(keyPadded.length < 32){
            for(let i = keyPadded.length; i < 32; i++)
                keyPadded += '0';
        }
        return keyPadded;
    }
    
    encrypt(word){
        let keyPadded = this.paddingKey(environment.cryptoSecret);
        var key = CryptoJS.enc.Utf8.parse(keyPadded);
        var srcs = CryptoJS.enc.Utf8.parse(word);
        var encrypted = CryptoJS.AES.encrypt(srcs, key, {mode:CryptoJS.mode.ECB,padding: CryptoJS.pad.Pkcs7});
        return encrypted.toString();
    }
​
    decrypt(word){
        let keyPadded = this.paddingKey(environment.cryptoSecret);
        var key = CryptoJS.enc.Utf8.parse(keyPadded);
        var decrypt = CryptoJS.AES.decrypt(word, key, {mode:CryptoJS.mode.ECB,padding: CryptoJS.pad.Pkcs7});
        return CryptoJS.enc.Utf8.stringify(decrypt).toString();
    }
    
}