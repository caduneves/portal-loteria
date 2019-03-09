import Controller from './Controller';
import Premiacoes from '../api/Premiacoes';

class Premios extends Controller{

    constructor(){
        super();
        this.ano = 0;
        this.mes = 0;
        this.total = 0;
        this.title =  "Prêmios no Site";
    }

    async start() {

        this.ano = "";
        this.mes = "";
        this.total = "";
        this.loadPrizes();
    }
    async loadPrizes(){
        var results = await Promise.all([Premiacoes.ano(),
            Premiacoes.mes(),
            Premiacoes.total(),
            Premiacoes.premiacaoRecente()]);

        //vue instance start here
        this.ano = results[0].format("C2");
        this.mes = results[1].format("C2");
        this.total = results[2].format("C2");
        this.title = results[3] || "Prêmios no Site";
    }
}
export default Premios;