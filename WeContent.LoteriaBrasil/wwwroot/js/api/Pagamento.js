import { http, getMidia, getIP } from "./util";
import Session from "./Session";
import { codigoSite } from '../config';

class Pagamento {

    static async paymentMethods(type, value){
        var token = await Session.getToken();
        return await http.get("@sorteOnlineAPI/PagamentoService.svc/formasDePagamento/{0}/{1}?value={2}", token, type, value);
    }

    static async makePayment(type, value, paymentOptionID, formData, cardID){
        
        try{
            var token = await Session.getToken();
            var codigoMidia = getMidia();
            var ip = getIP();

            return await http.get("@sorteOnlineAPI/PagamentoService.svc/pagar/{0}/{1}/?value={2}&paymentOptionID={3}&formData={4}&cardID={5}&codigoMidia={6}&codigoSite={7}&ip={8}",
                                    token, type, value.format("0.00"), paymentOptionID, formData, cardID, codigoMidia, codigoSite, ip);
        }catch(ex){
            return {
                Success: false,
                ErrorMessage: 'Falha inesperada. Tente novamente.'
            };
        }
    }

    static async getGATransaction(codigoPagamento, numeroParcela){
        var token = await Session.getToken();
        return await http.get("@sorteOnlineAPI/PagamentoService.svc/pagamento/ga/{0}/?codigoPagamento={1}&numeroParcela={2}", token, codigoPagamento, numeroParcela);
    }

    static async getRefundGaTransactions(){
        var token = await Session.getToken();
        return await http.get("@sorteOnlineAPI/PagamentoService.svc/pagamento/ga/refunds/{0}/?codigoSite={1}&isMobile={2}", token, codigoSite, false);
    }
}
export default Pagamento;