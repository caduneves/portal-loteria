import Controller from './Controller';
import Session from '../api/Session';
import User from '../api/User';
import { msDate } from '../api/util';

class Resgatar extends Controller{

    constructor(){
        super();
        //models
        this.bancos = [];
        this.regras = {};
        this.contas = [];
        this.saldo = { Premiados: 0, Comprados: 0, Total: 0};
        //properties
        this.reset();

        //masks
        this.money = {
          decimal: ',',
          thousands: '.',
          prefix: 'R$ ',
          suffix: '',
          precision: 2,
          masked: false
        };
    }
    reset(){
        this.title = "";
        this.message = "";
        this.resgateInfo = {
            valor: 'R$ 0,00',
            tipoConta: "",
            banco: "",
            agencia: "",
            agenciaDV: "",
            conta: "",
            contaDV: "",
            titular: "",
            cpf: ""
        };
        this.showMessage = this.updateMessages();
    }
    
    async start() {
        this.component("MenuMinhaConta").select("resgatar");
        await Session.updateUserFromSession();
        
        this.user = await Session.getUser();
        if(!this.user){
            document.location.href = "/usuario/login";
        }
        
        var results = await Promise.all([
                                          User.getBancosResgate(), 
                                          User.getRegrasResgate(),
                                          User.getContasBancarias(),
                                          User.getSaldo(),
                                          User.existeResgatesPendentes()
        ]);
        
        this.bancos = results.shift() || [];
        this.regras = results.shift() || {};
        this.contas = results.shift() || [];
        this.saldo = results.shift() || { Premiados: 0, Comprados: 0, Total: 0};
        if(this.saldo && this.saldo.extrato){
            this.saldo.extrato.forEach((item)=>{
                item.data = msDate(item.data).format("dd/MM/yyyy");
            });
        }

        this.existeResgatePendente = results.shift();
             
        this.showMessage = this.updateMessages();

        this.reload();                  
    }
    bancoAceitaPoupanca(){
        var banco = this.bancos.filter((banco)=> banco.Numero == this.resgateInfo.banco)[0];
        return !banco || banco.AceitaContaPoupanca;
    }
    bancoPossuiDigitoAgencia(){
        var banco = this.bancos.filter((banco)=> banco.Numero == this.resgateInfo.banco)[0];
        return !banco || banco.DigitoAgencia;
    }
    bancoPossuiDigitoConta(){
        var banco = this.bancos.filter((banco)=> banco.Numero == this.resgateInfo.banco)[0];
        return !banco || banco.DigitoContaCorrente;
    }
    updateMessages(){
        if(this.existeResgatePendente){
            this.title = "Já existe um resgate solicitado!";
            this.message = "Por favor aguarde a confirmação para fazer o próximo.";
            return true;
        }
        if (this.regras.UsuarioAdmin)
        {
            if (this.saldo.Premiados <= 0 && this.saldo.Comprados <= 0)
            {
                this.title = this.message = "Não há prêmio a ser resgatado.";
                return true;
            }
        }
        
        if (this.saldo.Premiados <= 0)
        {
            this.title = this.message = "Não há prêmio a ser resgatado.";
            return true;
        }
        if (this.saldoPremiados <= this.saldo.TaxaResgate)
        {
            this.title = "O seu Saldo de Prêmio para Resgate precisa ser superior a Taxa de Resgate.";
            this.message = "Taxa de resgate: " + this.regras.TaxaResgate.format("C2") + ".";
            return true;
        }
        this.title = "Resgatar";
        return false;
        
    }
    onBancoChange(){
        this.reset();
        if(!this.bancoAceitaPoupanca()){
            this.resgateInfo.tipoConta = "CC";
        }
    }
    async resgatar(){
        var valor = parseNumber(this.resgateInfo.valor, "C2");
        var agencia = this.resgateInfo.agencia;
        var conta = this.resgateInfo.conta;
        
        if(!this.bancoAceitaPoupanca()){
            this.resgateInfo.tipoConta = "CC";
        }
        if(!this.resgateInfo.tipoConta){
            this.showAlert("Informe o Tipo da Conta");
            return;
        }
        if(!this.resgateInfo.agencia || this.resgateInfo.agencia.trim().length != 4){
            this.showAlert("Informe uma Agência válida");
            return;
        }

        if(this.bancoPossuiDigitoAgencia()){
            if(!this.resgateInfo.agenciaDV ||  (isNaN(parseInt(this.resgateInfo.agenciaDV)) && this.resgateInfo.agenciaDV != "X") ){
                this.showAlert("Informe o digito verificador da Agência");
                return;
            }
            agencia += "-" + this.resgateInfo.agenciaDV;
        }
        if(!this.resgateInfo.conta || this.resgateInfo.conta.trim().length > 2){
            this.showAlert("Informe uma Conta válida");
            return;
        }
        if(this.bancoPossuiDigitoConta()){
            if(!this.resgateInfo.contaDV ||  (isNaN(parseInt(this.resgateInfo.contaDV)) && this.resgateInfo.contaDV != "X") ){
                this.showAlert("Informe o digito verificador da Conta");
                return;
            }
            conta += "-" + this.resgateInfo.contaDV;
        }
        if(!this.resgateInfo.titular || this.resgateInfo.titular.trim().length > 2){
            this.showAlert("Informe o Titular");
            return;
        }
        if(!this.resgateInfo.cpf || User.validateCPF(this.resgateInfo.cpf)){
            this.showAlert("Informe um CPF válido");
            return;
        }
        this.showLoading();
        var response = await User.resgatarPremio(valor.format("0.00"), this.resgateInfo.banco, this.resgateInfo.tipoConta, agencia, conta, this.resgateInfo.titular, this.regras.cpf, true);
        var error = this.getError(response);
        if(error){
            this.hideLoading();
            this.showAlert(error);
            return;
        }
        await this.start();
        this.hideLoading();
    }
    getError(result, defaultMessage){
        defaultMessage = defaultMessage || "Falha inexperada tente novamente.";
        if(!result){
            return defaultMessage;
        }
        if(result.Erros &&
            result.Erros.length > 0){
            return result.Erros[0].Value
        }
        if(result.Erro  && result.Erro.Erros &&
            result.Erro.Erros.length > 0){
            return result.Erro.Erros[0].Value
        }
        return null;
    }
}
export default Resgatar;