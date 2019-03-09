import Controller from './Controller';
import Noticias from '../api/Noticias';
import { msDate, titleToSlug, getQueryParameter } from "../api/util";
import ModelNoticia from '../models/ModelNoticia';
import Loteria from "../models/Loteria";
class BannerNoticias extends Controller{

    constructor(){
        super();
        this.noticias = [];
    }

    async start() {

        this.load();
    }
    async load(){
        var noticias = await Noticias.listar(4);

        this.noticias = noticias.map((a) => new ModelNoticia(a));
        console.log(this.noticias);
    }
}
export default BannerNoticias;