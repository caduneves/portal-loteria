import Controller from './Controller';
import Cart from '../api/Cart';
import { getCookie } from '../api/util';
import CryptoHelper from '../models/CryptoHelper';

class MiniCart extends Controller {
 
    constructor() {
        super();
        this.cart = { TotalValor: 0, TotalItens: 0, Itens: [], Erro: null, EspecialPermiteTeimosinha: false };
        this.loaded = false;
        this.hasCoupom = false;
    }
 
    async start() {
        
       var result = await this.refresh();
       this.loaded = true;
       
    }
    

    join(){
        return new Promise((resolve)=>{
            var promiseInterval = setInterval(()=> {
                if(this.loaded){
                    resolve(true);
                    clearInterval(promiseInterval);
                }
            }, 100);
        });
    }
    async refresh(){
        this.cart = await Cart.getCart();
        this.hasCoupom = await Cart.hasCoupom();
        if(!this.hasCoupom){
            sessionStorage.setItem("coupom", null);
        }
        this.reloadIfExists('AposteAqui', 'Loteria', 'Pagamento', 'Cart');
        
    }

    reloadIfExists(...components){
        for(var i in components){
            var component = this.component(components[i]);
            if(component)
                component.reload();
        }
    }
    go(url){
        document.location.href = url;
    }
    async remove(item){
       await Cart.removeItem(item.CodigoGrupo, item.CodigoConcurso, item.Cotas, item.TipoCompra, item.CodigoLoteria, item.Numero);
       await this.refresh();
       this.reloadIfExists('Cart');
        
    }
    async clean(){
        await Cart.clean();
        this.refresh();
        this.reload();
    }
    getAddedQuantity(cdConcurso, cdGrupo){
        try{
            return (this.cart.Itens || [])
              .filter((item)=> item.CodigoConcurso == cdConcurso && item.CodigoGrupo == cdGrupo)
              .map((item)=> item.Cotas)
              .reduce((acumulator, cotas) => acumulator + cotas);
        }catch(ex){
            //reduce error
            return 0;
        }
    }
}
export default MiniCart;