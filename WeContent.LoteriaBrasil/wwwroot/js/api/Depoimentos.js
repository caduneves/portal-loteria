import { http } from "./util";
import { codigoSite } from '../config';
import Session from "./Session";

class Depoimentos {

    static async destaque() {
        return await http.cachedGet(`Depoimentos#destaque()`,
                                     3600, 
                                     "@sorteOnlineAPI/BannerService.svc/depoimentos?q={0}", 1);
    }

    static async listar(quantidade) {
        return await http.cachedGet(`Depoimentos#listar(${quantidade})#${codigoSite}`, 
                                    3605 * 5, 
                                    "@sorteOnlineAPI/ConteudoService.svc/depoimento/top?t={0}&q={1}&c={2}", "", quantidade, codigoSite);
    }

    static async todos(){
        return await http.cachedGet(`Depoimentos#todos()#${codigoSite}`, 
                                    3600 * 5,
                                    "@sorteOnlineAPI/ConteudoService.svc/depoimento/todos?t={0}&c={1}", "", codigoSite)
    }

    static async cadastrar(depoimento){
        var token = await Session.getToken();
        return await http.get("@sorteOnlineAPI/ConteudoService.svc/depoimento/new?t={0}&d={1}&p={2}&n={3}",
                     token, 
                     depoimento,
                     true,
                     true);
    }
}
export default Depoimentos;