import Controller from './Controller';
import Session from '../api/Session';

class MenuMinhaConta extends Controller{

    constructor(){
        super();
        this.selected =  "";
    }

    async start(){
        
    }

    select(name){
        this.selected = name;
        this.reload();
    }
    isSelected(name){
        return this.selected == name ? "selected" : ""; 
    }
}
export default MenuMinhaConta;