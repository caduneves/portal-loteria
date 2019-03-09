import Controller from './Controller';
import Session from '../api/Session';
import User from '../api/User';

class Indique extends Controller{

    constructor(){
        super();
        this.clean();
    }

    async start(){
       
        this.user = await Session.getUser();
        if(!this.user){
            document.location.href = "/usuario/login?returnUrl=" + encodeURIComponent("/newsletter/indique");
        }
    }

    clean(){
        this.name = "";
        this.dest = "";
        this.email = "";
        this.comment = "";
    }
    async send(){
        if(!this.name || this.name.trim().length < 2){
            this.showAlert("Favor informar o nome");
            return;
        }

        if(!this.dest || this.dest.trim().length < 2){
            this.showAlert("Favor informar o nome do destinatário");
            return;
        }

        if(!this.email || this.email.trim().length < 2 || this.email.indexOf("@") == -1){
            this.showAlert("Favor informar o email do destinatário");
            return;
        }

        if(!this.comment || this.comment.trim().length < 1){
            this.showAlert("Favor informar um comentário");
            return;
        }

        var response = await User.indique(this.name, this.dest, this.email, this.comment);
        var msg = (response.Erros.length ? response.Erros[0].Value : 'E-mail enviado com sucesso!');
        this.showAlert(msg);

    }

}
export default Indique;