import { msDate, titleToSlug } from "../api/util";
import Loteria from "../models/Loteria";

class ModelNoticia {

    constructor(a){
        a = a || {};

        for(var i in a){
            this[i] = a[i];
        }
    }

    get data() {
    	return msDate(this.DataDaPublicacao).format("dd/MM/yyyy");
    }

    get description() {
        return this.ConteudoReduzido.replace(/(<([^>]+)>)/ig,"");
    }

    get url() {
        return  `/noticias/${Loteria.classByID(this.Loteria)}/${titleToSlug(this.Titulo)}?sku=${this.Codigo}`;
    }

}

export default ModelNoticia;