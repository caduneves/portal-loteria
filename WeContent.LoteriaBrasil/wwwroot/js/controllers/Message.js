import Controller from './Controller';
import Session from '../api/Session';

class Message extends Controller{

    constructor(){
        super();
        this.isConfirmation = false;
        this.visible = false;
        this.confirmText = "";
        this.cancelText = "";
        this.messageText = "";
        this.resolve = function(){};
    }

    async start(){
        this.visible = false;    
    }

    
    alert(message, buttonText){
        this.confirmText = buttonText || "Ok";
        this.messageText = message;
        this.isConfirmation = false;
        this.visible = true;
        var self = this;
        return new Promise((resolve)=>{
            self.resolve = resolve;
        });
    }

    confirm(message, confirmText, cancelText){
        this.confirmText = confirmText || "Sim";
        this.cancelText = cancelText || "Não";
        this.messageText = message;
        this.isConfirmation = true;
        this.visible = true;
        var self = this;
        return new Promise((resolve)=>{
            self.resolve = resolve;
        });
    }

    ok(){
        this.resolve(true);
        this.visible = false;
    }

    cancel(){
        this.resolve(false);
        this.visible = false;
    }
}
export default Message;