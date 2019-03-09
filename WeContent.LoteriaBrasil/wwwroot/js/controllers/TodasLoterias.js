import Controller from './Controller';
import Loterias from '../api/Loterias';
import ProviderEstatisticas from '../api/Estatisticas';
import Loteria from '../models/Loteria';
import Resultados from '../api/Resultados';
import ModelResultado from '../models/Resultado';
import ModelResultadoEspecial from '../models/ResultadoEspecial';
import ModelPremioPorEstado from '../models/ModelPremioPorEstado';
import Noticias from '../api/Noticias';
import ModelNoticia from '../models/ModelNoticia';
import { msDate } from "../api/util";
import Premiacoes from '../api/Premiacoes';

class TodasLoteriasController extends Controller {
    constructor(element){
        super();
        this.codigoLoteria = parseInt(element.getAttribute('data-lottery'));
        //selected
        this.loterias = [];
        this.loteriasEspeciais = [];
        //resultados
        this.resultados = [];
        this.premios = [];
        this.resultadoSelected = [];
        //estátisticas
        this.premiosPorEstado = [];
        this.maioresPremios = [];
        this.numerosMaisSorteados = [];
        this.noticias = [];
        this.showContentLottery = null;
    }
    async start() {
    
        var loterias = await Loterias.listar();
        var codesArr = [];
        
        this.loterias = loterias.map(a => {
            return new Loteria(a);
        }).sort( (a, b) => {
            return a.CodigoLoteria - b.CodigoLoteria;
        }).filter((a) => {
            if( codesArr.indexOf(a.CodigoLoteria) != -1 ){ return false; }
            codesArr.push(a.CodigoLoteria);
            return true;
        });

        var loteriasEspeciais = await Resultados.loteriasEspeciais();

        this.loteriasEspeciais = loteriasEspeciais.sort((a, b) => {
            return a.CodigoDaLoteria - b.CodigoDaLoteria;
        }).filter((a) => {
            return (!!a.NomeDaLoteria && a.CodigoDaLoteria != 3);
        }).map( (a) => {
            return new ModelResultadoEspecial(a);
        });

        console.log(this.loteriasEspeciais);

        this.reload();
        
        // this.loadResultados();
        
        // this.loadPremiosEstados();
        
        // this.loadMaioresPremios();
        
        // this.loadMaisSorteados();
        
        this.loadNoticias();
        this.initSlideComoApostar();
        
        // this.loadPremiacoes();
        

        this.reload();
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
        var noticias = await Noticias.listar(10, -1, false);
        this.noticias = noticias.map((a) => new ModelNoticia(a));
        
        console.log(this.noticias);

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

    initSlideComoApostar() {
       
        $('.owl-carousel-comoapostar').owlCarousel({
            loop: true,
            margin: 0,
            responsiveClass: true,
            responsive: {
                0: {
                    items: 2,
                    nav: true
                },
                600: {
                    items: 2,
                    nav: false
                },
                1000: {
                    items: 5,
                    nav: true,
                    loop: false
                }
            }
        });
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

    showContent( index ){
        console.log(index);
        this.showContentLottery = (index == this.showContentLottery) ? null : index;
    }
}

export default TodasLoteriasController;