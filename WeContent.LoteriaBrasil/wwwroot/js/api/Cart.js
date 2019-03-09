import { http } from "./util";
import { codigoSite } from '../config';
import Session from "./Session";

class Cart {
    static async addBolao(codigoConcurso, codigoGrupo, cotas, crossSelling, codigoCanalVenda) {
        var token = await Session.getToken();
        codigoCanalVenda = codigoCanalVenda || 1;
        crossSelling = crossSelling || false;
        return await http.get("@sorteOnlineAPI/JogoService.svc/bolao?c={0}&g={1}&cotas={2}&t={3}&crossSelling={4}&codigoCanalVenda={5}",
                            codigoConcurso, codigoGrupo, cotas, token, crossSelling, codigoCanalVenda);
    }
    static async removeGameByIndex(index, codigoLoteria, numeroConcurso){
        var token = await Session.getToken();
        return await http.get("@sorteOnlineAPI/CompraService.svc/remove-aposta?c={0}&l={1}&nc={2}&t={3}",
                             index, codigoLoteria, numeroConcurso, token);
    }
    static async removeItem(codigoGrupo, codigoConcurso, cotas, tipoCompra, codigoLoteria, numeroConcurso) {
        var token = await Session.getToken();
        return await http.get("@sorteOnlineAPI/CompraService.svc/remove-item?g={0}&c={1}&cotas={2}&tc={3}&l={4}&nc={5}&t={6}",
                                codigoGrupo, codigoConcurso, cotas, tipoCompra, codigoLoteria, numeroConcurso, token);
    }

    static async reservar(){
        var token = await Session.getToken();
        return await http.get("@sorteOnlineAPI/PagamentoService.svc/carrinho/reservarcotas/?token={0}&CodigoSite={1}", token, codigoSite);
    }

    static async updateTeimosinha(codigoLoteria, numeroConcurso, quantidade, recorrente){
        var token = await Session.getToken();
        return await http.get("@sorteOnlineAPI/JogoService.svc/atualizar-seujogo?token={0}&codigoLoteria={1}&numeroConcurso={2}&quantidade={3}&recorrente={4}",
                                token, codigoLoteria, numeroConcurso, quantidade, recorrente);
    }
    static async addGame(codigoLoteria, 
                         numeroConcurso, 
                         cartao,
                         teimosinha,
                         recorrente, 
                         timeDoCoracao, 
                         fechamento,
                         codigoCanalVenda,
                         mesDeSorte){

        var token = await Session.getToken();
        codigoCanalVenda = codigoCanalVenda || 1;
        mesDeSorte = mesDeSorte || 0;
        try{
            return await http.get("@sorteOnlineAPI/JogoService.svc/monteseujogo?l={0}&nc={1}&cartao={2}&teimosinha={3}&recorrente={4}&time={5}&fechamento={6}&t={7}&codigoCanalVenda={8}&mDS={9}",
                                  codigoLoteria, numeroConcurso, cartao, teimosinha, recorrente, timeDoCoracao,
                                fechamento, token, codigoCanalVenda, mesDeSorte)
        }catch(ex){
            return null;
        }
    }

    static async gerarApostas(quantidadeDezena,
                              quantidadeApostas,
                              codigoLoteria, 
                              numeroConcurso, 
                              teimosinha,
                              recorrente){

        var token = await Session.getToken();
        try{
            return await http.get("@sorteOnlineAPI/CompraService.svc/gerar-apostas?qd={0}&qa={1}&c={2}&l={3}&nc={4}&t={5}&r={6}",
                                    quantidadeDezena, quantidadeApostas, teimosinha, codigoLoteria, numeroConcurso, token, recorrente);
        }catch(ex){
            return null;
        }
    }

    static async getCart(){

        try{

            var token = await Session.getToken();
            return await http.get("@sorteOnlineAPI/CompraService.svc/carrinho?t={0}&u=0",
                                  token);
        }catch(ex){
            //JSON Malformated returns empty Cart
            return { TotalValor: 0, TotalItens: 0, Itens: [], Erro: null, EspecialPermiteTeimosinha: false };
        }
    }

    static async clean(){
        var token = await Session.getToken();
        return await http.get("@sorteOnlineAPI/CompraService.svc/esvaziar-carrinho?t={0}",
                              token);
    }


    static async opcoesApostaFacil(valor){
        var token = await Session.getToken();
        return await http.get("@sorteOnlineAPI/JogoService.svc/aposta-facil/opcoes?t={0}&v={1}&s={2}",
                              token, valor, codigoSite);
    }
    static async comprarApostaFacil(valor, opcaoLoteria, maximoDeCotas, numerosDaSorte){
        var token = await Session.getToken();
        return await http.get("@sorteOnlineAPI/JogoService.svc/aposta-facil/comprar?t={0}&v={1}&l={2}&p={3}&n={4}&s={5}",
                              token, valor, opcaoLoteria, maximoDeCotas, numerosDaSorte, codigoSite);
    }

    static async esvaziar(){
        var token = await Session.getToken();
        return await http.get("@sorteOnlineAPI/CompraService.svc/limpa-carrinho?t={0}",
                              token);
    }

    static async hasCoupom(){
        try{
            var token = await Session.getToken();
            return await http.get("@sorteOnlineAPI/CompraService.svc/has-promocao-cupom?t={0}",token);
        }catch(ex){
            return false;
        }
    }
    static async validateCoupom(coupom, value){
        var token = await Session.getToken();
        return await http.get("@sorteOnlineAPI/CompraService.svc/validar-cupom?c={0}&v={1}&t={2}", coupom, (value || 0).format("0.00"), token);
    }
}

   
export default Cart;