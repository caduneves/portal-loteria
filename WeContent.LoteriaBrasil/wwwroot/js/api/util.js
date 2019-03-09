import * as config from '../config';
import CryptoHelper from '../models/CryptoHelper';
export class http {
    
    static async get(urlTemplate, ...data) {
        for (var i in config) {
            urlTemplate = urlTemplate.replace(`@${i}`, config[i]);
        }
        for (var j in data) {
            urlTemplate = urlTemplate.replace(`{${j}}`, encodeURIComponent(data[j]));
        }
        
        return await http.request(urlTemplate, 'GET', null);
    }
    static async clearCache(cacheKey){
        return await http.request(`/Cache/Clean?cacheKey=${cacheKey}`, 'GET', null);
    }
    static async cachedGet(cacheKey, durationInSeconds, urlTemplate, ...data) {
        for (var i in config) {
            urlTemplate = urlTemplate.replace(`@${i}`, config[i]);
        }
        for (var j in data) {
            urlTemplate = urlTemplate.replace(`{${j}}`, encodeURIComponent(data[j]));
        }
        urlTemplate = btoa(urlTemplate);
        cacheKey = encodeURIComponent(cacheKey);
        return await http.request(`/Cache?cacheKey=${cacheKey}&expiration=${durationInSeconds}&query=${urlTemplate}`, 'GET', null);
    }

    static async post(urlTemplate, data) {
        for (var i in config) {
            urlTemplate = urlTemplate.replace(`@${i}`, config[i]);
        }
        for (var j in data) {
            urlTemplate = urlTemplate.replace(`{${j}}`, encodeURIComponent(data[j]));
        }
        return await http.request(urlTemplate, 'POST', JSON.stringify(data));
    }

    static request(url, type, data) {
        url = CryptoHelper.encrypt(url);
        url = `/Request/Index?query=${encodeURIComponent(url)}`;
        if(type == "POST"){
            data = CryptoHelper.encrypt(data);
        }
        return new Promise((resolve, reject) => {
            var httpRequest;
            if (window.XMLHttpRequest) { // Mozilla, Safari, ...
                httpRequest = new XMLHttpRequest();
            } else if (window.ActiveXObject) { // IE
                try {
                    httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
                }
                catch (e) {
                    try {
                        httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
                    }
                    catch (e) {
                        reject(e);
                    }
                }
            }

            if (!httpRequest) {
                alert('Giving up :( Cannot create an XMLHTTP instance');
                return false;
            }
            

            httpRequest.onreadystatechange = () => {
                if (httpRequest.readyState === 4) {
                    if (httpRequest.status === 200) {
                        try {
                            resolve(JSON.parse(httpRequest.responseText));
                        } catch (ex) {
                            reject(`Malformed JSON: ${httpRequest.responseText}`)
                        }
                    } else {
                        reject(arguments);
                    }
                }
            };
            httpRequest.open(type, url);
            httpRequest.setRequestHeader("Content-type", "text/plain");
            httpRequest.send(data);
        });
        
    }
}


export function msDate(jsonDate) {
    return new Date(parseInt((jsonDate || "").substr(6)));
}

export function getQueryParameter(name){
    var url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
export function multiSort(array, ...functionValues){
    array.sort((a, b)=>{

        for(var i in functionValues){
            var aProperty = functionValues[i].call(this, a);
            var bProperty = functionValues[i].call(this, b);
            var direction = "asc";
            if(aProperty instanceof Array){
                direction = aProperty[1];
                aProperty = aProperty[0];
                bProperty = bProperty[0];
            }
            if(aProperty > bProperty)
                return direction == "asc" ? 1 : -1;
            if(aProperty < bProperty)
                return direction == "asc" ? -1 : 1;
        }
    
        return 0;
    });
}

export function meses(){
    return ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
}
export function titleToSlug(title){
    var ret = (title || "").toLowerCase();
    ret = ret.split("-").join("");
    ret = ret.replace(/[ÁÀÂÃáàâã]/g, "a");
    ret = ret.replace(/[ÉÈÊéèê]/g, "e");
    ret = ret.replace(/[Íí]/g, "i");
    ret = ret.replace(/[ÓÒÔÕóòôõ]/g, "o");
    ret = ret.replace(/[ÚÙÛÜúùûü]/g, "u");
    ret = ret.replace(/[Çç]/g, "c");
    ret = ret.replace(/[ºª]/g, "");
    ret = ret.replace(/[^\w\s]/g, "");
    ret = ret.split(' ').join('-');
    ret = ret.split("--").join("-");
    return ret;
}
export function getMidia(){
    return getCookie("midia") || 1;
}
export function getIP(){
    return getCookie("ip") || "127.0.0.1";
}
export function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

export function getValorAproximado(valor) {
    var txt = "";
    var x = Math.round((valor / 1000), 1);
    var y = valor / 1000;
    var valueTxt = "";
    if (x == y) { valueTxt = y.toString(); }
    else { valueTxt = x.toString(); }

    txt = x > 0 ? valueTxt + " Mil" : txt;
    x = Math.floor((valor / 1000000) * 10) / 10;
    y = valor / 1000000;
    
    if (x == y) { valueTxt = y.toString(); }
    else { valueTxt = x.toString(); }

    txt = y == 1 ? valueTxt + " Milhão" : txt;
    txt = y > 1 ? valueTxt + " Milhões" : txt;

    if( y > 1000 ){
        valueTxt = Math.floor( (y/1000) * 10 ) / 10;
        txt = valueTxt + (valueTxt > 1 ? " Bilhões" : " Bilhão");
    }

    if(!txt.length) { txt = valor.toString(); }

    return txt;
}