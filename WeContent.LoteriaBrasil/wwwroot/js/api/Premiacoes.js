import { http, msDate, multiSort } from "./util";

class Premiacoes {
    static async mes() {
        return await http.cachedGet(`Premiacoes#mes()`,  12 * 3600, "@sorteOnlineAPI/BannerService.svc/premios/mes");
    }

    static async ano() {
        return await http.cachedGet(`Premiacoes#ano()`, 12 * 3600, "@sorteOnlineAPI/BannerService.svc/premios/ano");
    }

    static async total() {
        return await http.cachedGet(`Premiacoes#total()`, 12 * 3600, "@sorteOnlineAPI/BannerService.svc/premios/total");
    }

    
    static async premiacaoRecente(){

        var premios = await http.cachedGet(`Premiacoes#premiacaoRecente()`, 12 * 3600, "@sorteOnlineAPI/BannerService.svc/premios/ultimos");
        premios = premios || [];
        //order by premio.Data.Date desc, premio.Premio asc
        multiSort(premios,
                  (item)=> [ msDate(item.Data).date(), "desc"],
                  (item)=> item.Premio);
        var premio = premios[0];
        if(!premio)
            return "Prêmios no Site";

        premio.Faixa = (premio.Faixa || '').split('(')[0] || '';
        premio.Texto = "Acertamos {0}{1} da {2}";
        switch (premio.CodigoLoteria)
        {
            case 1://mega-sena
            case 2://dupla-sena
            case 4://quina
                premio.Texto = String.format(premio.Texto, "a ", premio.Faixa, premio.Loteria);
                break;
            case 5://federal
                if (premio.NumeroFaixa == 2)
                    premio.Texto = String.format(premio.Texto, "a ", premio.Faixa, premio.Loteria);
                else
                    premio.Texto = String.format(premio.Texto, "o ", premio.Faixa, premio.Loteria);
                break;
            case 9://timemania
                if (premio.Faixa == "Time do Coração")
                    premio.Texto = String.format(premio.Texto, "o ", premio.Faixa, premio.Loteria);
                else
                    premio.Texto = String.format(premio.Texto, "os ", premio.Faixa, premio.Loteria);
                break;
            default:
                premio.Texto = String.format(premio.Texto, '', premio.Faixa, premio.Loteria);
                break;
        }
        return 'Prêmiamos novamente: ' + premio.Texto;
    }

    static async getRankingPremios(codigoLoteria,
                            especial,
                            topRegistro,
                            dataInicio,
                            dataFim,
                            tipo){
        return await http.cachedGet(`Premiacoes#getRankingPremios(${codigoLoteria},${especial},${topRegistro},${dataInicio},${dataFim},${tipo})`,
                                             60, 
                                             "@sorteOnlineAPI/JogoService.svc/ranking/premios?c={0}&e={1}&top={2}&di={3}&df={4}&tp={5}",
                                             codigoLoteria,
                                             especial,
                                             topRegistro,
                                             dataInicio,
                                             dataFim,
                                             tipo);
      
        
    }
}
export default Premiacoes;