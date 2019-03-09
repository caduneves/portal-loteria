import Controller from './Controller';
import Session from '../api/Session';
import User from '../api/User';
import Cart from '../api/Cart';

class ComprarCreditos extends Controller{

    constructor(){
        super();
        this.value = "R$ 0,00";
        this.money = {
          decimal: ',',
          thousands: '.',
          prefix: 'R$ ',
          suffix: '',
          precision: 2,
          masked: false
        };
        this.coupomInfo = null;
        sessionStorage.setItem("coupom", null);
        this.coupom = null;
        this._hasCoupom = false;
    }

    async start(){
        //vue instance start here
        this.vm.$watch("value", async () => {
            //atualiza pagamento quando os valor for alterado
            var pagamento = this.component("Pagamento");
            if(pagamento)
                pagamento.update();
            this._hasCoupom = await Cart.hasCoupom();
            if(!this._hasCoupom){
                sessionStorage.setItem("coupom", null);
                this.coupom = null;
            }
            if(this.coupom){
                await this.validateCoupom();
            }
           
        });
        this._hasCoupom = await Cart.hasCoupom();
        if(!this._hasCoupom){
            sessionStorage.setItem("coupom", null);
            this.coupom = null;
        }
        if(this.coupom){
            await this.validateCoupom();
        }
    }

    isSelected(value){
        return this.value == value.format("C2");
    }
    select(value){
        this.value = value.format("C2");
    }

    get selected(){
        return parseNumber(this.value, "C2");
    }
    hasCoupom(){
        return this._hasCoupom;
    }
    async validateCoupom(){
        if(!this.hasCoupom()){
            sessionStorage.setItem("coupom", null);
            this.coupom = null;
            return;
        }
        if(!this.coupom){
            this.showAlert("É necessário informar um cupom");
            return;
        }
        var response = await Cart.validateCoupom(this.coupom, this.selected);
        if(response){
            if(response.Success){
                this.coupomInfo = response;
                sessionStorage.setItem("coupom", this.coupom);
                this.reload();
            }else{
                this.coupom = "";
                this.coupomInfo = null;
                this.showAlert(response.ErrorMessage);
            }
        }
    }
}
export default ComprarCreditos;