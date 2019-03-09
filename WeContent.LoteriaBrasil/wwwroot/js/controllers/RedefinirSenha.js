import Controller from './Controller';
import Session from '../api/Session';
import User from '../api/User';
import { getQueryParameter } from "../api/util";

class RedefinirSenha extends Controller{

    constructor(){
        super();
        this.password = "";
        this.passwordConfirmation = "";
        this.returnUrl = Session.returnUrl();
        this.redefinitionToken = "";
    }

    start(){
        //vue instance start here
        this.redefinitionToken = getQueryParameter("rt");
        if(!this.redefinitionToken)
            document.location.href = "/";
    }

    async redefinir(){
        if(!this.password || this.password.trim().length < 6){
            this.showAlert("Informe uma senha com no mínimo 6 caracteres");
            return;
        }
        if(this.password != this.passwordConfirmation){
            this.showAlert("As senhas informadas não conferem");
            return;
        }
        var result = await User.redefinirSenha(this.password, this.passwordConfirmation, this.redefinitionToken);
        if(result && result.length > 0 && result[0].Value && result[0].Key != 0){
            this.closeRecoveryEmail();
            this.showAlert(result[0].Value);
        }else{
            result = await this.showAlert("Senha redefinida com sucesso!");
            document.location.href = "/";
        }
    }

}
export default RedefinirSenha;