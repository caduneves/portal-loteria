import Controller from './Controller';
import Loterias from '../api/Loterias';
import ProviderEstatisticas from '../api/Estatisticas';
import Loteria from '../models/Loteria';
import Resultados from '../api/Resultados';
import ModelResultado from '../models/Resultado';
import ModelPremioPorEstado from '../models/ModelPremioPorEstado';
import Noticias from '../api/Noticias';
import ModelNoticia from '../models/ModelNoticia';
import Bolao from '../models/Bolao';
import Game from '../models/Game';
import { msDate } from "../api/util";
import Apostar from '../models/Apostar';
import Premiacoes from '../api/Premiacoes';

class LoteriaController extends Controller {
    constructor(element){
        super();
        this.codigoLoteria = parseInt(element.getAttribute('data-lottery'));
        this.apostar = new Apostar(false, this, this.codigoLoteria, false);
        //selected
        this.loteria = {};
        //resultados
        this.resultados = [];
        this.premios = [];
        this.resultadoSelected = [];
        //estátisticas
        this.premiosPorEstado = [];
        this.maioresPremios = [];
        this.numerosMaisSorteados = [];
        this.noticias = [];
    }
    async start() {
        
        await this.apostar.start();
        this.loteria = this.apostar.lotterySelected;
        this.reload();

        this.loadResultados();

        this.loadPremiosEstados();
        
        this.loadMaioresPremios();

        this.loadMaisSorteados();
        
        this.loadNoticias();

        this.loadPremiacoes();

    }

    async loadResultados(){
        var resultados = await Resultados.ultimos();
        this.resultados = resultados.map((resultado) => new ModelResultado(resultado));
        this.resultadoSelected = this.takeLastResult(this.loteria);
        this.reload();
    }
    takeLastResult(loteria){
        return (loteria.CodigoLoteria) ? this.resultados.filter((a) => a.Loteria == loteria.CodigoLoteria) : [];
    }
    async loadMaioresPremios(){
        this.maioresPremios = await ProviderEstatisticas.maioresPremios(this.codigoLoteria);
        this.reload();
    }
    async loadMaisSorteados(){
        var numerosMaisSorteados = await ProviderEstatisticas.numerosMaisSorteados(this.codigoLoteria);
        
        if( this.loteria.isDezenas ){

            var tempMaisSorteados = [];


            numerosMaisSorteados[0].Dezenas.map((a) => tempMaisSorteados.push(...a));
            
            var max = tempMaisSorteados[0].qtd;
            var min = tempMaisSorteados[9].qtd;
            
            tempMaisSorteados.slice(0,10).map((a) => {
                a.percent = Math.round((100/(max - min)) * (Number(a.qtd) - min));
                this.numerosMaisSorteados.push(a);
            });
        }
    }
    async loadPremiosEstados(){

        var premiosPorEstado = await ProviderEstatisticas.premioPorEstado(this.codigoLoteria);
        
        this.premiosPorEstado = premiosPorEstado.sort((a, b) => {
            return (b.QuantidadeDeGanhadores - a.QuantidadeDeGanhadores);
        }).filter((a, b) => {
            return ( a.Estado != 'XX');
        }).slice(0, 5).map((a) => new ModelPremioPorEstado(a));

        this.reload();
    }

    async loadNoticias() {
        var noticias = await Noticias.listar(10, this.codigoLoteria, false);
        this.noticias = noticias.map((a) => new ModelNoticia(a));
        setTimeout(() => { this.initSliderNews(); }, 500);
    }

    async loadPremiacoes() {
        var premiacoes = await Premiacoes.getRankingPremios(this.codigoLoteria, false, 20, "", "", "R") || [];
        this.premios = premiacoes.map((premiacao) => {
            return {
                name: premiacao.Loteria.Nome,
                grupo: premiacao.NomeDoGrupo,
                concurso: premiacao.NumeroDoConcurso,
                ranking: premiacao.NumeroRanking,
                data: msDate(premiacao.DataDoSorteio).format("dd/MM/yyyy"),
                class: Loteria.classByID(premiacao.Loteria.CodigoDaLoteria),
                premio: premiacao.Valor.format("C2"),
                cotas: premiacao.QuantidadeDeCotas,
                urlLoteria: '/' + Loteria.classByID(premiacao.Loteria.CodigoDaLoteria),
                codigoGrupo: premiacao.CodigoDoGrupo
            }
       });
       this.reload();
    }
    
    verJogo(resultado){
        var VerJogo = this.component("VerJogo");
        if(VerJogo){
            VerJogo.show(resultado.codigoGrupo, resultado.concurso, 0);
        }   
    }
    verComprovante(resultado){
        var VerComprovante = this.component("VerComprovante");
        if(VerComprovante){
            VerComprovante.show(resultado.codigoGrupo, resultado.concurso);
        }   
    }
    scrollTo(id, offset){
        offset = offset || 0;
        $(window).scrollTop($(id).offset().top - offset);
    }
    initSliderNews() {

        $('.owl-carousel-news').owlCarousel({
            loop: true,
            margin: 0,
            nav: true,
            mouseDrag: false,
            navText: ['<i class="fa fa-chevron-left color-primary"></i>','<i class="fa fa-chevron-right color-primary"></i>'],
            responsiveClass: true,
            // center: true,
            // items: 3,
            responsive: {
                0 : {
                    items: 2,
                    center: false
                },
                667 : {
                    items: 3,
                    center: true
                }
            }
        });
    }
}

export default LoteriaController;