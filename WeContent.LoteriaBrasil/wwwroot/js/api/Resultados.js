import { http } from "./util";

class Resultados {

    static async ultimos() {
        return await http.cachedGet(`Resultados#ultimos()`, 3600, "@sorteOnlineAPI/JogoService.svc/todos-ultimos-resultados");
    }

    static async loteria(loteria, concurso) {
        var concurso = concurso || null;
        var url = "@sorteOnlineAPI/JogoService.svc/ultimos-resultados-resumo?l=" + loteria + "&q=1&r=1";
        if( concurso ){ url += "&c=" + concurso };
        
        return await http.cachedGet(`Resultados#loteria(${loteria}, ${concurso})`, 3600, url);
    }

    static async loteriasEspeciais() {
        var url = "@sorteOnlineAPI/JogoService.svc/loterias/concursosResumo?t=4";
        
        return await http.cachedGet(`Resultados#loteriasEspeciais()`, 3600, url);
    }

}
export default Resultados;