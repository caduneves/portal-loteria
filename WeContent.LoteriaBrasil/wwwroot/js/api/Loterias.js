import { http } from "./util";
import { codigoSite } from '../config';
import Session from "./Session";

var localCache = {};
class Loterias {
    static async boloes() {
        var cacheKey = `Loterias#boloes()`;

        if (!localCache[cacheKey]) {
            var token = await Session.getToken();
            localCache[cacheKey] = await http.cachedGet(cacheKey, 30, "@sorteOnlineAPI/JogoService.svc/bolao/todos");
        }
        return localCache[cacheKey];
    }
    static async dadosAposta(codigoLoteria, numeroConcurso, especial, forceUpdate) {
        var token = await Session.getToken();
       var cacheKey = `Loterias#dadosAposta(${codigoLoteria}, ${numeroConcurso}, ${especial}, ${token})`;
       
       if (!localCache[cacheKey] || forceUpdate) {
           if(forceUpdate){
               await http.clearCache(cacheKey);
           }
           localCache[cacheKey] =  await http.get("@sorteOnlineAPI/JogoService.svc/facaseujogo/?t={0}&l={1}&n={2}&e={3}", token, codigoLoteria, numeroConcurso, especial);
       }
       return localCache[cacheKey];
    }
    static async listar(quantidade) {
        var cacheKey = "Loterias#listar()";

        if (!localCache[cacheKey]) {
            localCache[cacheKey] = await http.cachedGet(cacheKey, 30, "@sorteOnlineAPI/JogoService.svc/loterias/concursos");
        }
        return localCache[cacheKey];
    }
    static async volante(codgrupo, codigoDoPagamento, numeroDoConcurso){
        var planofederal = "";
        var cacheKey = `Loterias#volante(${codgrupo}, ${planofederal}, ${codigoDoPagamento}, ${numeroDoConcurso})`;
        return await http.cachedGet(cacheKey, 3600, "@sorteOnlineAPI/JogoService.svc/lista/volante?g={0}&federal={1}&codigoDoPagamento={2}&numeroDoConcurso={3}",
                                    codgrupo, planofederal, codigoDoPagamento, numeroDoConcurso);
    }
    static async volanteFSJ(codigoLoteria, numeroConcurso){
        var token = await Session.getToken();
        var cacheKey = `Loterias#volanteFSJ(${codigoLoteria}, ${numeroConcurso}, ${token})`;
        return await http.cachedGet(cacheKey, 1, "@sorteOnlineAPI/JogoService.svc/lista/cartoesmsj?l={0}&nc={1}&t={2}",
                                    codigoLoteria, numeroConcurso, token);
    }

    static async comprovantes(codigoDoGrupo, numeroDoConcurso, numeroDoCartao){
        var cacheKey = `Loterias#comprovantes(${codigoDoGrupo}, ${numeroDoConcurso}, ${numeroDoCartao})`;
        return await http.cachedGet(cacheKey, 3600, "@sorteOnlineAPI/JogoService.svc/lista/comprovante?g={0}&c={1}&n={2}",
                                    codigoDoGrupo, numeroDoConcurso, numeroDoCartao);
    }
    static async cartoesVolante(codigoDoGrupo, page, pagesize, numeroDoConcurso, apenasPremiados){
        var cacheKey = `Loterias#cartoesVolante(${codigoDoGrupo},${page}, ${pagesize}, ${numeroDoConcurso}, ${apenasPremiados})`;
        return await http.cachedGet(cacheKey, 3600, "@sorteOnlineAPI/JogoService.svc/lista/cartoes?g={0}&p={1}&q={2}&c={3}&pr={4}",
                                    codigoDoGrupo, page, pagesize, numeroDoConcurso, apenasPremiados);
    }
}
export default Loterias;