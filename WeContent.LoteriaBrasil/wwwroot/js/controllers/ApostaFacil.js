import Controller from './Controller';
import { msDate } from "../api/util";
import Cart from '../api/Cart';

class ApostaFacil extends Controller{

    constructor(){
        super();
       this.reset();
       window.ApostaFacil = this;
    }

    reset(){
        this.visible = false;
        this.value = "R$ 0,00";
        this.money = {
          decimal: ',',
          thousands: '.',
          prefix: 'R$ ',
          suffix: '',
          precision: 2,
          masked: false
        };
        this.options = [];
        this.loteria = -1;
        this.opcaoJogo = 0;
        this.dezenas = ["", "", ""];
        this.step = 0;
    }
    async start() {
        window.ApostaFacil = this;
    }
    async searchOptions(){
        var result = await Cart.opcoesApostaFacil(this.formatedValue);
        this.loteria = 0;
        if(result){
            this.options = result.OpcoesLoterias;
            this.step = 1;
        }
        this.reload();
    }

    next(){
        if(this.step < 3)
            this.step++;
    }
    opcoesJogo(){
        var option = this.options.filter((opcao)=> opcao.Codigo == this.loteria)[0];
        if(!option)
            return [];
        return option.OpcoesDeParticipacao || [];
    }
    onLotteryChange(){
        this.opcaoJogo = 0;
        this.dezenas = ["", "", ""];
    }
    close(){
        this.reset();
    }
    get formatedValue(){
        return parseNumber(this.value, "C2").format("0.00");
    }
    async ok(){
        this.showLoading();
        var response = await Cart.comprarApostaFacil(this.formatedValue, this.loteria, this.opcaoJogo, this.dezenas.join(" ").trim());
        if(response.Success){
            document.location.href = "/carrinho";
            return;
        }
        this.hideLoading();
        this.showAlert(response.ErrorMessage);
    }
    show(){
        this.visible = true;
    }
}
export default ApostaFacil;