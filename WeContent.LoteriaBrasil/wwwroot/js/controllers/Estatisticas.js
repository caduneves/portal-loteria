import Controller from './Controller';
import Loterias from '../api/Loterias';
import ProviderEstatisticas from '../api/Estatisticas';
import Loteria from '../models/Loteria';
import Resultados from '../api/Resultados';
import ModelResultado from '../models/Resultado';
import ModelPremioPorEstado from '../models/ModelPremioPorEstado';
import { msDate } from "../api/util";

class EstatisticasController extends Controller {
    constructor(){
        super();
        this.loteria = {};
        this.selected = {};
        this.games = {};
        this.hintQty = 0;
        this.hintTotal = 1;
        this.isHome = false;
        this.resultados = [];
        this.resultadoSelected = [];
        this.boloes = [];
        this.boloesSelected = {};
        this.isRecorrente = false;
        this.premiosPorEstado = [];
        this.maioresPremios = [];
        this.numerosMaisSorteados = [];
        this.numerosMaisAtrasados = [];
    }
    async start() {

        this.codigoLoteria = parseInt(this.element.getAttribute('data-lottery'));
        var loterias = await Loterias.listar();
         this.loterias = loterias.map((loteria) => new Loteria(loteria));

        this.loteria = this.loterias.filter((loteria) => loteria.CodigoLoteria == this.codigoLoteria)[0];
        if (this.loteria && this.loteria.ConcursoFacaJogo){
            this.hintQty = this.loteria.ConcursoFacaJogo.MininoDezena;
            this.selected = await Loterias.dadosAposta(this.loteria.CodigoLoteria, this.loteria.concurso.Numero, this.loteria.concurso.Especial);
        }

        var resultados = await Resultados.ultimos();
        this.resultados = resultados.map((resultado) => new ModelResultado(resultado));
        this.resultadoSelected = this.takeLastResult(this.loteria);

        var premiosPorEstado = await ProviderEstatisticas.premioPorEstado(this.codigoLoteria);
        
        this.premiosPorEstado = premiosPorEstado.sort((a, b) => {
            return (b.QuantidadeDeGanhadores - a.QuantidadeDeGanhadores);
        }).filter((a, b) => {
            return ( a.Estado != 'XX');
        }).slice(0, 5).map((a) => new ModelPremioPorEstado(a));
        
        var maioresPremios = await ProviderEstatisticas.maioresPremios(this.codigoLoteria);
        this.maioresPremios = maioresPremios;

        var numerosMaisSorteados = await ProviderEstatisticas.numerosMaisSorteados(this.codigoLoteria);
        
        if( this.loteria.isDezenas ){

            var tempMaisSorteados = numerosMaisSorteados[0].Dezenas.concat()[0];
            
            var max = tempMaisSorteados[0].qtd;
            var min = tempMaisSorteados[tempMaisSorteados.length-1].qtd;
            
            tempMaisSorteados.map((a, b) => {
                a.percent = Math.round((100/max) * Number(a.qtd));

                if( this.numerosMaisSorteados.length < 5){
                    this.numerosMaisSorteados.push(a);
                }
            });
        }

        var numerosMaisAtrasados = await ProviderEstatisticas.numerosMaisAtrasados(this.codigoLoteria);
                
        if( this.loteria.isDezenas ){

            
            var tempMaisAtrasados = [];
            
            numerosMaisAtrasados[0].Dezenas.map((a) => tempMaisAtrasados.push(...a));

            var min = tempMaisAtrasados[0].qtd;
            var max = tempMaisAtrasados[tempMaisAtrasados.length-1].qtd;

            tempMaisAtrasados.reverse().map((a, b) => {
                a.percent = Math.round((100/max) * Number(a.qtd));

                if( this.numerosMaisAtrasados.length < 5){
                    this.numerosMaisAtrasados.push(a);
                }
            });
        }

    }

    takeLastResult(loteria){
        return (loteria.CodigoLoteria) ? this.resultados.filter((a) => a.Loteria == loteria.CodigoLoteria) : [];
    }

    isSelected(loteria){ return true; }
}

export default EstatisticasController;