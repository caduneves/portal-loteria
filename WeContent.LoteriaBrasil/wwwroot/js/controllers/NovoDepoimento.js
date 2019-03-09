import Controller from './Controller';
import { msDate } from "../api/util";
import Cart from '../api/Cart';
import Session from '../api/Session';
import Depoimentos from '../api/Depoimentos';

class NovoDepoimento extends Controller{

    constructor(){
        super();
       this.reset();
       window.NovoDepoimento = this;
       this.user = null;       
    }

    reset(){
        this.depoimento = "";
        this.visible = false;
    }
    async start() {
        window.NovoDepoimento = this;
        this.user = await Session.getUser();
    }
   
    close(){
        this.reset();
    }
 
    async send(){
        if(!this.depoimento || this.depoimento.trim().length == 0){
            this.showAlert("Favor informe um texto para o depoimento.")
            return;
        }
        if(this.depoimento.length > 600){
            this.showAlert("O tamanho limite para o texto do depoimento é de 600 caracteres")
            return;
        }
        var response = await Depoimentos.cadastrar(this.depoimento);
        var error = this.getError(response);
        if(error){
            this.showAlert(error);
        }else{
            this.showAlert("Depoimento cadastrado com sucesso");
            this.close();
        }

    }
    getError(result, defaultMessage){
        defaultMessage = defaultMessage || "Falha inexperada tente novamente.";
        if(!result){
            return defaultMessage;
        }
        if(result.Erros &&
            result.Erros.length > 0){
            return result.Erros[0].Value
        }
        if(result.Erro  && result.Erro.Erros &&
            result.Erro.Erros.length > 0){
            return result.Erro.Erros[0].Value
        }
        return null;
    }
    show(){
        if(!this.user){
            document.location.href = "/usuario/login?returnUrl=" + encodeURIComponent("/depoimentos?cadastrar=true");
            return;
        }
        this.visible = true;
    }
}
export default NovoDepoimento;