import Controller from './Controller';
import Loterias from '../api/Loterias';
import Loteria from '../models/Loteria';
import ProviderEstatisticas from '../api/Estatisticas';
import ModelPremioPorEstado from '../models/ModelPremioPorEstado';
import { msDate } from "../api/util";

class LoteriaController extends Controller {
    constructor(){
        super();
        this.loteria = {};
        this.selected = {};
        this.sectionStats = "";
        this.data = [];
    }
    async start() {

        this.codigoLoteria = parseInt(this.element.getAttribute('data-lottery'));
        this.mode = this.element.getAttribute('data-mode');
        
        console.log(this.mode);

        var loterias = await Loterias.listar();
        this.loterias = loterias.map((loteria) => new Loteria(loteria));
        this.loteria = this.loterias.filter((loteria) => loteria.CodigoLoteria == this.codigoLoteria)[0];

        if( this.mode == "maiores-premios" )
        {
            return this.getMaioresPremios();
        }
        else if( this.mode == "premios-estado" )
        {
            return this.getPremiosEstado();
        }
        else if( this.mode == "numeros-mais-sorteados" )
        {
            return this.getMaisSorteadas();
        }
        else if( this.mode == "dezenas-mais-atrasadas" )
        {
            return this.getMaisAtrasadas();
        }
        else if( this.mode == "soma-das-dezenas" )
        {
            return this.getSomaDezenas();
        }
        else if( this.mode == "pares-e-impares" )
        {
            return this.getParesImpares();
        }
        else if( this.mode == "linhas-e-colunas" )
        {
            return this.getLinhasColunas();
        }
        else if( this.mode == "soma-de-gols-por-concurso" )
        {
            return this.getSomaGols();
        }
        else if( this.mode == "quantidade-de-gols-por-concurso" )
        {
            return this.getGolsPorConcurso();
        }

        console.log(this.data);

    }

    async getMaioresPremios() {
        var acumuladas = await ProviderEstatisticas.maioresPremios(this.codigoLoteria, 10, false);
        var individuais = await ProviderEstatisticas.maioresPremios(this.codigoLoteria, 10, true);
        
        var maxAcumulada = acumuladas[0].Premio; 
        var maxIndividuais = individuais[0].Premio; 
        
        this.data.push(
            acumuladas.map(a => {
                a.Porcentagem =  (100/maxAcumulada) * a.Premio;
                a.DataResultado = msDate(a.DataResultado); 
                return a;  }), 
            individuais.map( a => {         
                a.Porcentagem =  (100/maxIndividuais) * a.Premio;
                a.DataResultado = msDate(a.DataResultado); 
                return a; })
        );
    };

    async getMaisSorteadas() {
        var base = await ProviderEstatisticas.numerosMaisSorteados(this.codigoLoteria, 10);
        var porDezena = [];
        var porSorteio = [];
        var max = 0;
        var min = 999;

        base[0].Dezenas.map(a => {
            a.map(b => {
                porDezena.push(b);
                if( b.qtd > max ){ max = b.qtd; }
                if( min == 0 ){ min = b.qtd } else { min = b.qtd < min ? b.qtd : min; }
            }); 
        });

        porDezena = porDezena.map(a => {
            a.porcentagem = (100/(max - min)) * (a.qtd - min);
            return a;
        }).sort((a, b) => { return (Number(b.dezena) - Number(a.dezena)) });
        
        
        porSorteio.push(...porDezena);
        porSorteio.sort((a, b) => { return (Number(b.qtd) - Number(a.qtd)); });

        this.data.push(porDezena, porSorteio);

        console.log(this.data);

    }

    async getMaisAtrasadas() {
        var base = await ProviderEstatisticas.numerosMaisAtrasados(this.codigoLoteria, 10);
        var porDezena = [];
        var porSorteio = [];
        var max = 0;
        var min = 999;

        base[0].Dezenas.map(a => {
            a.map(b => {
                porDezena.push(b);
                if( b.qtd > max ){ max = b.qtd; }
                if( min == 0 ){ min = b.qtd } else { min = b.qtd < min ? b.qtd : min; }
            }); 
        });

        porDezena = porDezena.map(a => {
            a.porcentagem = (100/(max - min)) * (a.qtd - min);
            return a;
        }).sort((a, b) => { return (Number(b.dezena) - Number(a.dezena)) });
        
        
        porSorteio.push(...porDezena);
        porSorteio.sort((a, b) => { return (Number(b.qtd) - Number(a.qtd)); });

        this.data.push(porDezena, porSorteio);

    }

    async getSomaDezenas() {
        var somaDezenas = await ProviderEstatisticas.somaDezenas(this.codigoLoteria);
        var max = 0;

        somaDezenas[0].map( a => {
            if(a.Percentual > max){ max = a.Percentual; }
        });

        somaDezenas[0].map( a => {
            a.PercentualBarra = (100/max) * a.Percentual;
            return a;
        });

        this.data = somaDezenas[0];
    };

    async getParesImpares() {
        var res = await ProviderEstatisticas.paresImpares(this.codigoLoteria);
        var max = 0;

        res[0].map( a => {
            if(a.Percentual > max){ max = a.Percentual; }
        });

        res[0].map( a => {
            a.PercentualBarra = (100/max) * a.Percentual;
            return a;
        });

        this.data = res[0];
    };

    async getLinhasColunas() {
        var res = await ProviderEstatisticas.linhasColunas(this.codigoLoteria, 'coluna');
        console.log(res);
        
        this.data = res;
    }
    
    async getPremiosEstado() {
        var res = await ProviderEstatisticas.premioPorEstado(this.codigoLoteria);
        console.log(res);
        
        APP.Mapa.Init();
        
        this.data = res;
    }
    
    async getSomaGols() {
        var res = await ProviderEstatisticas.somaGols();
        var max = 0;
        
        res.map( a => {
            if(a.Percentual > max){ max = a.Percentual; }
        });

        res.map( a => {
            a.PercentualBarra = (100/max) * a.Percentual;
            return a;
        });

        this.data = res;
    }

    async getGolsPorConcurso() {
        var res = await ProviderEstatisticas.golsPorConcurso(this.codigoLoteria);
        var max = 0;

        this.data = res;
    }

    isSelected(loteria){ return true; }
}

export default LoteriaController;