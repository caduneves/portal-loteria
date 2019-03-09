
import Cart from '../api/Cart';
class Bolao{
    constructor(bolao, component){
        bolao = bolao || {};

        for(var i in bolao){
            this[i] = bolao[i];
        }
        this.quantity = 0;
        this.component = component;
    }

    get availableQuantity(){
        var cart = this.component.component("MiniCart");
        var cartQuantity = cart.getAddedQuantity(this.CdConcurso, this.CdGrupo);
        return this.CotasDisp - cartQuantity;     
    }
    increment(){
        var cart = this.component.component("MiniCart");
        var cartQuantity = cart.getAddedQuantity(this.CdConcurso, this.CdGrupo);
        if(this.quantity + cartQuantity  < this.CotasDisp){
            this.quantity++;
            this.component.reload();
        }
    }

    decrement(){
        if(this.quantity > 0){
            this.quantity--;
            this.component.reload();
        }
    }
    async verJogo(){
        var verJogo = this.component.component("VerJogo");
        if(!verJogo)
            return false;
        verJogo.show(this.CdGrupo, this.NumConcurso, 0);
        return true;
    }
    async verComprovante(){
        var VerComprovante = this.component.component("VerComprovante");
        if(!VerComprovante)
            return false;
        VerComprovante.show(this.CdGrupo, this.NumConcurso, 0);
        return true;   
    }
    async addToCart(crossSelling, canalVenda){
        var cart = this.component.component("MiniCart");
        var result = await Cart.addBolao(this.CdConcurso, this.CdGrupo, this.quantity, crossSelling, canalVenda);

        if(result && result.Erros.length > 0){
            alert(result.Erros[0].Value);
            return false;
        }
        if(cart != null){
            await cart.refresh();
            return true;
        }
        return true;
    }
}

export default Bolao;