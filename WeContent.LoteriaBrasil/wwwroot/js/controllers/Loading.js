import Controller from './Controller';
import Session from '../api/Session';

class Loading extends Controller{

    constructor(){
        super();
        this.visible = false;
    }

    async start(){
        this.visible = false;    
    }

    show(){
        this.visible = true;
    }
    hide(){
        this.visible = false;
    }
}
export default Loading;