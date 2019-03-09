import Controller from './Controller';
import Session from '../api/Session';

class LoginHeader extends Controller{

    constructor(){
        super();
        this.user = null;
    }

    async start(){
       
        this.user = await Session.getUser();
        
    }
    async refresh(){
        this.user = await Session.getUser();
        this.reload();
    }
    userImage(){
        if(this.isLoggedIn() && this.user.Avatar){
            return `data:${this.user.TipoImagem};base64,${this.user.Avatar}`;
        }
        return '/images/avatar-default.jpg';
    }
    async logoff(){
        await Session.logoff();
        document.location.reload();
    }
    isLoggedIn(){
        return this.user && this.user.NomeExibicao;
    }
}
export default LoginHeader;