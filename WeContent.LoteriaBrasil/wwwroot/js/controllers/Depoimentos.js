import Controller from './Controller';
import Depoimentos from '../api/Depoimentos';
import { msDate, getQueryParameter } from "../api/util";

class DepoimentosController extends Controller{

    constructor(){
        super();
        this.depoimentos = [];
        this.displayQuantity = 12;
        this.destaque = null;
        this.isLoading = true;
    }

    async start() {

        

        this.displayQuantity = 12;
        this.isLoading = true;
        //carrega destaque
        var destaque = await Depoimentos.destaque();
        if(destaque && destaque[0]){
            this.formatOne(destaque[0]);
            this.destaque = destaque[0];
        }
        //todos depoimentos
        var depoimentos = await Depoimentos.listar(12);

        //formata depoimentos da primeira página
        this.formatList(depoimentos);

        //Lazy load todos depoimentos
        Depoimentos.listar(1000).then((depoimentos)=> {
            this.formatList(depoimentos);
            this.isLoading = false;
        });

        if((getQueryParameter("cadastrar") || "").toLocaleLowerCase() == "true"){
            this.novoDepoimento();
        }
        setInterval(()=> this.autoScroll(), 1000);
    }
   
    formatList(depoimentos){
        depoimentos.forEach((depoimento) => this.formatOne(depoimento));
        this.depoimentos = depoimentos; 
    }
    formatOne(depoimento){
        var data = msDate(depoimento.Data);
        depoimento.Data = data.format("dd/MM/yyyy");
        depoimento.Hora = data.format("HH:mm");
        var text = (depoimento.Texto || "").trim();
        depoimento.TextoReduzido = text.substring(0, 275);
        if(text.length > 275){
            depoimento.TextoReduzido += "...";
        }
    }

    depoimento(line, position){
        return this.depoimentos[((line-1) * 2) + position];
    }

    autoScroll(){
        if(window.scrollY  >= depoimentosContainer.clientHeight / 2 && !this.isLoading){
            this.displayQuantity += 12;
        }
    }

    novoDepoimento(){
        NovoDepoimento.show();
    }
}
export default DepoimentosController;