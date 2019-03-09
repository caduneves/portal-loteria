import Controller from './Controller';
import Session from '../api/Session';
import Pagamento from '../api/Pagamento';
import User from '../api/User';
import { getQueryParameter } from '../api/util';

class FinalizarPagamento extends Controller{

    constructor(){
        super();

        try{
            this.paymentInfo = JSON.parse(localStorage.getItem("lastPaymentResponse"));
            this.paymentInfo.Model = JSON.parse(this.paymentInfo.Model);
            if(!this.paymentInfo.Model.FormaDePagamento && this.paymentInfo.Model.paymentResponse){
                this.paymentInfo.Model.FormaDePagamento = 28;
            }
        }catch(ex){
            document.location.href = "/";
        }
    }

    async start(){
        
    }
    go(url){
        document.location.href = url;
    }
}
export default FinalizarPagamento;