import Controller from './Controller';
import Depoimentos from '../api/Depoimentos';
import { msDate } from "../api/util";

class BannerDepoimentos extends Controller{

    constructor(){
        super();
        this.depoimentos = [];
    }

    async start() {

        this.load();
    }
    async load(){
        var depoimentos = await Depoimentos.listar(4);

        depoimentos.forEach((depoimento) => {
            depoimento.Data = msDate(depoimento.Data).format("dd/MM/yyyy");
            var text = (depoimento.Texto || "").trim();
            depoimento.TextoReduzido = text.substring(0, 275);
            if(text.length > 275){
                depoimento.TextoReduzido += "...";
            }
        });
        this.depoimentos = depoimentos; 
    }
}
export default BannerDepoimentos;