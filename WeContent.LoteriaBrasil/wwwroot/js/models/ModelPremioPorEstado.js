import { msDate } from "../api/util";
class ModelPremioPorEstado {

    constructor(a){
        a = a || {};

        for(var i in a){
            this[i] = a[i];
        }
    }

    get uf() { return this.Estado; }
    
    get estado() { return this.Estado; }
    
    get ganhadores() { return this.QuantidadeDeGanhadores; }

    get mapUrl() {
    	return "/images/states/"+this.Estado.toLowerCase()+".png";
    }

}

export default ModelPremioPorEstado;