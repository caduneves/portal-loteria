import * as CryptoJS  from "crypto-js";

class CryptoHelper{

    static sha256(text){
      return CryptoJS.SHA256(text).toString(CryptoJS.enc.Hex); 
    }
    static md5(text){
      return CryptoJS.MD5(text).toString(CryptoJS.enc.Hex); 
    }
    static encrypt (msg) {
        var keySize = 256;
        var ivSize = 128;
        var saltSize = 256;
        var iterations = 1000;  
        var password = "6cd5a6e4-d41c-469f-2195-74ffabf4d601";
        var salt = CryptoJS.lib.WordArray.random(saltSize/8);

        var key = CryptoJS.PBKDF2(password, salt, {
            keySize: keySize/32,
            iterations: iterations
        });

        var iv = CryptoJS.lib.WordArray.random(ivSize/8);

        var encrypted = CryptoJS.AES.encrypt(msg, key, { 
          iv: iv, 
          padding: CryptoJS.pad.Pkcs7,
          mode: CryptoJS.mode.CBC
        });

        var encryptedHex = CryptoHelper.base64ToHex(encrypted.toString());
        var base64result = CryptoHelper.hexToBase64(salt + iv + encryptedHex);

        return base64result;
    }
    
    static hexToBase64(str) {
        return btoa(String.fromCharCode.apply(null,
          str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
        );
    }
      
    static base64ToHex(str) {
      for (var i = 0, bin = atob(str.replace(/[ \r\n]+$/, "")), hex = []; i < bin.length; ++i) {
        var tmp = bin.charCodeAt(i).toString(16);
        if (tmp.length === 1) tmp = "0" + tmp;
        hex[hex.length] = tmp;
      }
      return hex.join("");
    }
}

export default CryptoHelper;