import { http, getMidia, getIP } from "./util";
import Session from "./Session";
import { codigoSite } from '../config';

class User {
    static async getCEPInformation(cep) {
        try{
            return await http.get("https://viacep.com.br/ws/{0}/json", cep);
        }catch(ex){
            //invalid cep
            return null;
        }
    }


    static async incluirUsuarioParcial(reCaptchaToken, name, birthDate, email, celPhone){
        var token = await Session.getToken();
        var data = {
            token: token, 
            nome: name, 
            nascimento: birthDate, 
            email: email, 
            celular: celPhone,
            optin : 's', 
            ip : getIP(), 
            codigoMidia: getMidia(),
            comoNosConheceu: 18, 
            codigoSite: codigoSite
        };
        
        return await http.post("/Usuario/CadastroParcial", {
            reCaptchaToken,
            dadosCadastro: JSON.stringify(data)
        });
    }

    static async updateUser(nascimento,
                            sexo,
                            email,
                            apelido,
                            nome,
                            cpf,
                            celular,
                            celular2,
                            celular3,
                            residencial,
                            comercial,
                            cep,
                            endereco,
                            complemento,
                            cidade,
                            estado,
                            bairro,
                            optin,
                            comoNosConheceu,
                            avatarBase64,
                            senha){
        var token = await Session.getToken();
        var data = {
            token: token,
            nascimento: nascimento,
            sexo: sexo,
            email: email,
            apelido: apelido,
            nome: nome,
            cpf: cpf,
            celular: celular,
            celular2: celular2 || "",
            celular3: celular3 || "",
            residencial: residencial || "",
            comercial: comercial || "",
            cep: cep,
            endereco: endereco,
            complemento: complemento || "",
            cidade: cidade,
            estado: estado,
            bairro: bairro || "",
            ip: getIP(),
            optin: optin || "s",
            codigoMidia: getMidia(),
            comoNosConheceu: comoNosConheceu || 18,
            codigoSite : codigoSite,
            avatarBase64: avatarBase64 || "",
            senha: senha || ""
        };
        return await http.post("@sorteOnlineAPI/ContaService.svc/update-cadastro", data)
    }

    static async esqueciMinhaSenha(email){
        return await http.get("@sorteOnlineAPI/ContaService.svc/envio-senha?e={0}&codigoSite={1}", email, codigoSite);
    }
    static async esqueciEmail(cpf){
        return await http.get("@sorteOnlineAPI/ContaService.svc/envio-email?c={0}&codigoSite={1}", cpf, codigoSite);
    }
    static async redefinirSenha(password, passwordConfirmation, redefinitionToken){
        return await http.get("@sorteOnlineAPI/ContaService.svc/redefinirSenha?s={0}&cs={1}&t={2}", password, passwordConfirmation, redefinitionToken);
    }
    static async alterarSenha(senha, novaSenha, confSenha){
        var token = await Session.getToken();
        return await http.get("@sorteOnlineAPI/ContaService.svc/alterarSenha?s={0}&ns={1}&cs={2}&t={3}", senha, novaSenha, confSenha, token);
    }
    static async retornaExtrato(dataInicio, dataFim, tipoLancamento){
        var token = await Session.getToken();
        return await http.get("@sorteOnlineAPI/ContaService.svc/extratoSite?t={0}&i={1}&f={2}&tl={3}", token, dataInicio, dataFim, tipoLancamento);
    }
    static validateCPF(strCPF){
        strCPF = strCPF || "";
        strCPF = strCPF.split(".").join("").split("-").join("");
        var Soma;
        var Resto;
        Soma = 0;
        if (strCPF == "00000000000") return false;
        
        for (i=1; i<=9; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (11 - i);
        Resto = (Soma * 10) % 11;
        
        if ((Resto == 10) || (Resto == 11))  Resto = 0;
        if (Resto != parseInt(strCPF.substring(9, 10)) ) return false;
        
        Soma = 0;
        for (i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (12 - i);
        Resto = (Soma * 10) % 11;
        
        if ((Resto == 10) || (Resto == 11))  Resto = 0;
        if (Resto != parseInt(strCPF.substring(10, 11) ) ) return false;
        return true;
    }

    static async getComprasApostas(dataInicial,
                                   dataFinal,
                                   tipoBusca,
                                   formaPagamento,
                                   situacaoCompra,
                                   loteria,
                                   tipoAposta,
                                   situacaoAposta){
        var token = await Session.getToken();
        return await http.get("@sorteOnlineAPI/ContaService.svc/compras-apostas?t={0}&di={1}&df={2}&tb={3}&fp={4}&sc={5}&lo={6}&ta={7}&sa={8}", 
                                token, dataInicial,
                                dataFinal,
                                tipoBusca,
                                formaPagamento,
                                situacaoCompra,
                                loteria,
                                tipoAposta,
                                situacaoAposta);

    }

    static async getRegrasResgate(){
        var token = await Session.getToken();
        
        return await http.get("@sorteOnlineAPI/ContaService.svc/regrasResgatePremio?token={0}", token);
    }

    static async getContasBancarias(){
        var token = await Session.getToken();
        try{
            return await http.get("@sorteOnlineAPI/ContaService.svc/contasBancarias?token={0}", token);
        }catch(ex){
            console.error("User#getContasBancarias", ex);
            return [];
        }
    }
    static async getBancosResgate(){
        
        var token = await Session.getToken();
        try{
            return await http.cachedGet("User#getBancosResgate", 600, "@sorteOnlineAPI/PagamentoService.svc/bancos/?token={0}", token);
        }catch(ex){
            console.error("User#getBancosResgate", ex);
            return [];
        }
    }
    static async getSaldo(){
        
        var token = await Session.getToken();
        try{
            return await http.get("@sorteOnlineAPI/ContaService.svc/saldo?t={0}", token);
        }catch(ex){
            console.error("User#getSaldo", ex);
            return { extrato: [], Premiados: 0, Comprados: 0, Total: 0};
        }
    }
    static async existeResgatesPendentes(){
        var token = await Session.getToken();
        try{
            return await http.get("@sorteOnlineAPI/ContaService.svc/existeResgatePendente?token={0}", token);
        }catch(ex){
            console.error("User#existeResgatesPendentes", ex);
            return false;
        }
    }

    static async resgatarPremio(valorDoResgate, 
                                numeroDoBanco, 
                                tipoDeConta,
                                numeroDaAgencia, 
                                contacorrente, 
                                titular, 
                                cpf, 
                                tipoResgate, 
                                cobraTaxa){
        var token = await Session.getToken();
        return await http.get("@sorteOnlineAPI/ContaService.svc/resgate-premio?valor={valorDoResgate}&numbanco={numeroDoBanco}&tipoconta={TipoDeConta}&numAgencia={NumeroDaAgencia}&numCC={Contacorrente}&nomeTitular={TitularDaConta}&cpf={CPFTitularDaConta}&t={token}&ip={ip}&TipoResgate={TipoResgate}&codigoSite={codigoSite}&cobraTaxa={cobraTaxa}",
                             valorDoResgate, numeroDoBanco, tipoDeConta, numeroDaAgencia, contacorrente, titular, cpf, token, getIP(),tipoResgate, codigoSite, cobraTaxa);
    }

    static async indique(nome, destinatario, email, comentario){
        var token = await Session.getToken();
        return await http.get("@sorteOnlineAPI/ConteudoService.svc/email/indiqueUmAmigo?t={0}&n={1}&d={2}&e={3}&ct={4}&c={5}", token, nome, destinatario, email, comentario, codigoSite);
    }
}
export default User;