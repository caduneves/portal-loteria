import Controller from './Controller';
import Noticias from '../api/Noticias';
import { msDate, titleToSlug, getQueryParameter } from "../api/util";
import Loteria from "../models/Loteria";

class NoticiasDetalhe extends Controller{

    constructor(){
        super();
        this.noticias = [];
        this.destaque = null;
    }

    async start() {
        this.codigo = parseInt(getQueryParameter("sku"));
        this.destaque = await Noticias.detalhes(this.codigo);
        this.destaque.TextoDoConteudo = this.cleanHTML(this.destaque.TextoDoConteudo);
        this.destaque.DataDaPublicacao = msDate(this.destaque.DataDaPublicacao);
        document.title = this.destaque.Titulo;
        this.destaque.Url = `/${Loteria.classByID(this.destaque.Loteria)}`;
        this.destaque.Nome = Loteria.nomeByID(this.destaque.Loteria);
        this.destaque.class = Loteria.classByID(this.destaque.Loteria);
        this.noticias = await this.getNoticias(4, this.destaque.Loteria);
    }
    cleanHTML(rawHTML){
         var elementContainer = $("<div>").html(rawHTML);
         elementContainer.find("img:first").remove();
         var code = elementContainer.html();
         code  = code.split("<p>&nbsp;</p>").join("");
         return code;
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
}
export default NoticiasDetalhe;