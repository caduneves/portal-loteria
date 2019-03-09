class Controller{

    constructor(){
    }
    
    async onload(vm){
        this.vm = vm;
        var result = this.start();
        if(result instanceof Promise){
            return await result;
        }
        return;
    }

    start(){

    }

    reload(){
        this.vm.$forceUpdate();
    }
 
    async showAlert(message, buttonText){
        return await this.component("Message").alert(message, buttonText);
    }
    
    async showConfirm(message, confirmText, cancelText){
        return await this.component("Message").confirm(message, confirmText, cancelText);
    }

    showLoading(){
        if(this.component("Loading"))
            this.component("Loading").show();
    }

    hideLoading(){
        if(this.component("Loading"))
            this.component("Loading").hide();
    }
}

export default Controller;