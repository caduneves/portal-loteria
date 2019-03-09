import { http } from "./util";
import { codigoSite } from '../config';

class ProviderEstatisticas {
    static async premioPorEstado(codLoteria) {
        try {
            return await http.cachedGet(`ProviderEstatisticas#premioPorEstado(${codLoteria})`, 3600, "@sorteOnlineAPI/JogoService.svc/estatistica/premiacaoEstado?l={0}", codLoteria);
        } catch (e) {
            return [];
        }
    }

    static async maioresPremios(codLoteria, qty, acumulado) {
        var qty = qty || 5;
        var acumulado = (!acumulado ? "N" : "S");

        try {
            return await http.cachedGet(`ProviderEstatisticas#maioresPremio(${codLoteria}, ${qty}, ${acumulado})`, 3600, "@sorteOnlineAPI/JogoService.svc/estatistica/maiorPremiacao?l={0}&t={1}&a={2}", codLoteria, qty, acumulado);
        } catch (e) {
            return [];
        }
    }

    static async numerosMaisSorteados(codLoteria, qty) {
        var qty = qty || 10;

        try {
            return await http.cachedGet(`ProviderEstatisticas#numerosMaisSorteados(${codLoteria}, ${qty})`, 3600, "@sorteOnlineAPI/JogoService.svc/estatistica/numerosMaisSorteados?l={0}&t={1}&o=sorteio&e=false", codLoteria, qty);
        } catch (e) {
            return [];
        }
    }

    static async numerosMaisAtrasados(codLoteria, qty) {
        var qty = qty || 10;

        try {
            return await http.cachedGet(`ProviderEstatisticas#numerosMaisAtrasados(${codLoteria}, ${qty})`, 3600, "@sorteOnlineAPI/JogoService.svc/estatistica/dezenasMaisAtrasadas?l={0}&t={1}&o=sorteio&e=false", codLoteria, qty);
        } catch (e) {
            return [];
        }
    }

    static async somaDezenas(codLoteria, qty) {

        try {
            return await http.cachedGet(`ProviderEstatisticas#somaDasDezenas(${codLoteria}, ${qty})`, 3600, "@sorteOnlineAPI/JogoService.svc/estatistica/somaDasDezenas?l={0}", codLoteria);
        } catch (e) {
            return [];
        }
    }

    static async paresImpares(codLoteria) {
        try {
            return await http.cachedGet(`ProviderEstatisticas#paresImpares(${codLoteria})`, 3600, "@sorteOnlineAPI/JogoService.svc/estatistica/paresEImpares?l={0}", codLoteria);
        } catch (e) {
            return [];
        }
    }

    static async linhasColunas(codLoteria, mode) {
        var mode = mode || "coluna"

        try {
            return await http.cachedGet(`ProviderEstatisticas#linhasColunas(${codLoteria}, ${mode})`, 3600, "@sorteOnlineAPI/JogoService.svc/estatistica/linhasEColunas?l={0}&o={1}", codLoteria, mode);
        } catch (e) {
            return [];
        }
    }
    
    static async somaGols() {
        try {
            return await http.cachedGet(`ProviderEstatisticas#somaGols()`, 3600, "@sorteOnlineAPI/JogoService.svc/estatistica/somaDeGolsPorConcurso");
        } catch (e) {
            return [];
        }        
    }

    static async golsPorConcurso() {
        try {
            return await http.cachedGet(`ProviderEstatisticas#golsPorConcurso()`, 3600, "@sorteOnlineAPI/JogoService.svc/estatistica/quantidadeDeGolsPorConcurso");
        } catch (e) {
            return [];
        }        
    }

    
    
}
export default ProviderEstatisticas;