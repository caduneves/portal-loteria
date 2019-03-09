import Controller from './Controller';
import Noticias from '../api/Noticias';
import { msDate, titleToSlug } from "../api/util";
import Loteria from "../models/Loteria";
import Premios from "./Premios";
class NoticiasGeral extends Premios{

    constructor(){
        super();
        this.noticias = [];
        this.destaque = [];
        this.categorias = [];
        this.especiais =  [];
        this.codigoLoteria = -1;
        this.classLoteria = "";
        this.nomeLoteria = "";
    }

    async start() {
        await super.start();

        //9 noticias de qualquer loteria (3 destaques, 6 em ultimas noticias)
        this.destaque = [];
        this.noticias = [];

        this.codigoLoteria = parseInt($(this.element).attr("data-sku"));
        this.nomeLoteria = Loteria.nomeByID(this.codigoLoteria);
        this.classLoteria = Loteria.classByID(this.codigoLoteria);
        if(this.classLoteria){
            this.classLoteria += " color";
        }
        var noticias = await this.getNoticias(9, this.codigoLoteria);    
        
        this.destaque = noticias.slice(0, 3);
        this.noticias = noticias.slice(3);
        
        this.categorias = [];
        this.especiais =  [];

        this.reload();
        //Carrega categorias
        
        if(this.codigoLoteria != -1){
            this.getNoticias(4, this.codigoLoteria == 1 ? 2 : 1).then((noticias)=> {
                this.categorias.push({
                    name: "Outras Loterias",
                    noticias: noticias
                });
                this.reload();
            });                
            return;
        }

        this.getNoticias(4, 1).then((noticias)=> {
            this.categorias.push({
                name: "Mega-Sena",
                noticias: noticias
            });
            this.reload();
        });
        this.getNoticias(4, 8).then((noticias)=> {
            this.categorias.push({
                name: "Lotofácil",
                noticias: noticias
            });
            this.reload();
        });

        this.getNoticias(4, 4).then((noticias)=> {
            this.categorias.push({
                name: "Quina",
                noticias: noticias
            });
            this.reload();
        });

        this.getNoticias(4, 2).then((noticias)=> {
            this.categorias.push({
                name: "Dupla-Sena",
                noticias: noticias
            });
            this.reload();
        });
        
        this.getNoticias(1, 2, true).then((noticias)=> {
            this.especiais.push({
                name: "Dupla de Páscoa",
                noticias: noticias
            });
            this.reload();
        });

        this.getNoticias(1, 4, true).then((noticias)=> {
            this.especiais.push({
                name: "Quina de São João",
                noticias: noticias
            });
            this.reload();
        });

        this.getNoticias(1, 8, true).then((noticias)=> {
            this.especiais.push({
                name: "Lotofácil da Independência",
                noticias: noticias
            });
            this.reload();
        });

        this.getNoticias(1, 1, true).then((noticias)=> {
            this.especiais.push({
                name: "Mega da Virada",
                noticias: noticias
            });
            this.reload();
        });
    }


    async getNoticias(quantidade, codigoLoteria){
        var noticias = await Noticias.listar(quantidade, codigoLoteria);
        (noticias || []).forEach((noticia) => {
            noticia.ConteudoReduzido = $("<div>").html(noticia.ConteudoReduzido).text();
            noticia.DataDaPublicacao = msDate(noticia.DataDaPublicacao).format("dd/MM/yyyy");
            noticia.Url = `/noticias/${Loteria.classByID(noticia.Loteria)}/${titleToSlug(noticia.Titulo)}?sku=${noticia.Codigo}`;
            noticia.Imagem = noticia.Imagem || "";
        });
        
        return noticias || [];
    }
    go(url){
        document.location.href = url;
    }
}
export default NoticiasGeral;