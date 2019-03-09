import Controller from './Controller';
import Session from '../api/Session';
import User from '../api/User';
import { msDate } from '../api/util';

class Saldo extends Controller{

    constructor(){
        super();
        this.displayFilter = false;
        this.saldo = { extrato: [], Premiados: 0, Comprados: 0, Total: 0};
        this.resetFilters();
      
    }
    
    async start() {
        this.component("MenuMinhaConta").select("saldo");
        await Session.updateUserFromSession();
        
        this.user = await Session.getUser();
        if(!this.user){
            document.location.href = "/usuario/login";
        }
        
        await this.update();
    }

    async update(){
        
        this.saldo = await User.retornaExtrato(this.dataInicial, 
                                                 this.dataFinal, 
                                                 this.tipoLancamento);

        if(this.saldo && this.saldo.extrato){
            this.saldo.extrato.forEach((item)=>{
                item.data = msDate(item.data).format("dd/MM/yyyy");
            });
        }                                                               
        this.reload();
    }
    resetFilters(){
        var start = Date.now();
        start.setDate(start.getDate() - 30);
        var end = Date.now();
        this.dataInicial = start.format("dd/MM/yyyy") + " 00:00";
        this.dataFinal = end.format("dd/MM/yyyy") + " 23:59";
        this.tipoLancamento = "";
    }

    async filter(){
        this.showLoading();
        await this.update();
        this.hideLoading();
        this.displayFilter = false;
    }
    toogleFilter(){
        this.displayFilter = !this.displayFilter;
    }
}
export default Saldo;