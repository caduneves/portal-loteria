import Controller from './Controller';
import Cart from '../api/Cart';
import Loteria from '../models/Loteria';
 
class CartController extends Controller {
 
    constructor() {
        super();
        sessionStorage.setItem("coupom", null);
        this.coupom = null;
        this.coupomInfo = null;
    } 
 

    items(){
        return (this.component("MiniCart") || {}).cart.Itens || [];
    }
    classLoteria(item){
        return Loteria.classByID(item.CodigoLoteria);
    }
    cart(){
        return (this.component("MiniCart") || {}).cart;      
    }
    
    hasCoupom(){
        return (this.component("MiniCart") || {}).hasCoupom;      
    }
    async toogleRecorrente(item){
        item.Recorrente = !item.Recorrente;
        return await this.updateTeimosinha(item);
    }
    async updateTeimosinha(item){
        await Cart.updateTeimosinha(item.CodigoLoteria, item.Numero, item.Teimosinha, item.Recorrente);
        await this.component("MiniCart").refresh();
        this.updatePayments();
    }
    async updateCotas(item){
        await Cart.addBolao(item.CodigoConcurso, item.CodigoGrupo, item.Cotas, false, 1);
        await Cart.reservar();
        await this.component("MiniCart").refresh();
        this.updatePayments();
    }
    async remove(item){

        var result = await this.showConfirm("Deseja realmente excluir esse item?",  "Sim", "Não");
        if(result){
            await Cart.removeItem(item.CodigoGrupo, item.CodigoConcurso, item.Cotas, item.TipoCompra, item.CodigoLoteria, item.Numero);
            await this.component("MiniCart").refresh();
            this.updatePayments();
        }
    }
    async start() {
        await Cart.reservar();
        var miniCart = this.component("MiniCart");
        if(miniCart){
            await miniCart.join();

            if(this.coupom){
                await this.validateCoupom();
            }
        }
    }
    async updatePayments(){
        if(this.component("Pagamento"))
            await this.component("Pagamento").update();
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
        var response = await Cart.validateCoupom(this.coupom, this.cart().TotalValor);
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
    go(url){
        document.location.href = url;
    }
    
    
    async esvaziar(){
        var result = await this.showConfirm("Deseja realmente esvaziar o carrinho?",  "Sim", "Não");
        if(result){
            this.showLoading();
            await Cart.esvaziar();
            await this.component("MiniCart").refresh();
            this.hideLoading();
            this.reload();
        }
    }
}
export default CartController;