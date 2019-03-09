import { http, getQueryParameter } from "./util";
import { codigoSite } from '../config';

class Session {

   
    static async getToken() {
        var token = sessionStorage.getItem("SessionToken");
        if (!token)
        {
            token = await Session.generateToken();
            sessionStorage.setItem("SessionToken", token);
        }
        return token;
    }
    static async getUser(){
        try{
            return JSON.parse(sessionStorage.getItem("User"));
        }catch(ex){
            return null;
        }
    }
    static async updateUser(usuario){
        sessionStorage.setItem("User", JSON.stringify(usuario));
        return usuario;
    }
    static async updateUserFromSession(){
        try{
            var token = await Session.getToken();
            var usuario = await http.get("@sorteOnlineAPI/ContaService.svc/get-updated-user?token={0}", token);
            sessionStorage.setItem("User", JSON.stringify(usuario));
            return usuario;
        }catch(ex){
            sessionStorage.setItem("User", JSON.stringify(null));
            return null;
        }
    }
    static async generateToken() {
        return await http.get("@sorteOnlineAPI/ContaService.svc/new-token");
    }
    static async transferToken(tokenA){
        var tokenB = await Session.getToken();
        return await http.get("@sorteOnlineAPI/ContaService.svc/transfer-token?a={0}&b={1}", tokenA, tokenB);
    }
    static async login(reCaptchaToken, email, telefone, senha){
        email = email || "";
        telefone = telefone || "";
        return await http.post("/Usuario/Login", {
            reCaptchaToken, 
            email, 
            telefone, 
            password: senha
        });
    }
    static async logoff(){
        var token = await Session.getToken();
        http.get("@sorteOnlineAPI/CompraService.svc/esvaziar-carrinho?t={0}", token);
        sessionStorage.removeItem("SessionToken");
        sessionStorage.removeItem("User");
        return await Session.getToken();
    }
    static returnUrl(url){
        return getQueryParameter("returnUrl");
    }
}
export default Session;