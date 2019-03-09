import Controller from './Controller';
import Session from '../api/Session';
import User from '../api/User';

class Cadastrado extends Controller{

    constructor(){
        super();
        this.user = {};
        this.returnUrl = Session.returnUrl();
    }

    async start(){
        //vue instance start here 
        this.user = await Session.getUser();
        if(!this.user){
            document.location.href = "/";
        }
    }

    async back(){
        document.location.href = this.returnUrl || "/";
    }

}
export default Cadastrado;