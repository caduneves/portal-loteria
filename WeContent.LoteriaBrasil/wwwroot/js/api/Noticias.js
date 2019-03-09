import { http } from "./util";
import Session from "./Session";
import { codigoSite } from '../config';

class Noticias {
    
    static async listar(quantidade, codigoLoteria, somenteEspeciais) {
        codigoLoteria = codigoLoteria || -1;
        somenteEspeciais = somenteEspeciais || false;
        var token = await Session.getToken();
        return await http.cachedGet(`Noticias#listar(${quantidade}, ${codigoLoteria}, ${somenteEspeciais})`, 60, "@sorteOnlineAPI/ConteudoService.svc/noticias/top?t={0}&c={1}&e={4}&tp={2}&q={3}&s={5}", token, codigoLoteria, 2, quantidade, somenteEspeciais, codigoSite);
    }
    static async detalhes(codigo){

        var token = await Session.getToken();
        return await http.cachedGet(`Noticias#detalhes(${codigo})`, 60, "@sorteOnlineAPI/ConteudoService.svc/noticias/conteudo?t={0}&cc={1}", token, codigo);

    }
}

export default Noticias;