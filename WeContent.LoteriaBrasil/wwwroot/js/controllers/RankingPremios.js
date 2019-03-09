import Controller from './Controller';
import Premiacoes from '../api/Premiacoes';
import { msDate, getQueryParameter } from "../api/util";
import Loteria from '../models/Loteria';

class RankingPremios extends Controller{

    constructor(){
        super();
        this.quantidade = this.getParameterOrDefault("TopoPremio", 20, true);
        this.loteria = this.getParameterOrDefault("CodigoLoteria", 0, true);
       
        this.dataInicio = this.getParameterOrDefault("DataInicial", "");
        this.dataFim = this.getParameterOrDefault("DataFinal", "");
        this.resultados = [];
    }

    getParameterOrDefault(parameter, defaultValue, isInt){
        try{
            var value = getQueryParameter(parameter);
            if(isInt && isNaN(parseInt(value))){
                return defaultValue;
            }
            return isInt ? parseInt(value) : value;
        }catch(ex){
            return defaultValue;
        }
    }

    async start() {
        if(!this.loteria){
            this.loteria = parseInt(this.element.getAttribute('data-lottery'));
        }
       this.resultados = [];

       this.dataInicio = parseDate(this.dataInicio, "dd/MM/yyyy") ? this.dataInicio : "";
       this.dataFim = parseDate(this.dataFim, "dd/MM/yyyy") ? this.dataFim : "";

       var premiacoes = await Premiacoes.getRankingPremios(this.loteria, false, this.quantidade, this.dataInicio, this.dataFim, "R") || [];
       this.resultados = premiacoes.map((premiacao) => {

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
    async update(){
        this.showLoading();
        await this.start();
        this.hideLoading();
    }
}
export default RankingPremios;