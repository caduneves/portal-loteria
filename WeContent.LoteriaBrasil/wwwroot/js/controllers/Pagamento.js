import Controller from './Controller';
import Session from '../api/Session';
import Pagamento from '../api/Pagamento';
import User from '../api/User';
import { getQueryParameter, getIP } from '../api/util';

class PagamentoController extends Controller{

    constructor(){
        super();
        this.type = "CT";
        this.paymentMethods = null;
        this._hashMapPaymentMethods = {};
        this.termosDeUso = false;
        this.dadosTransferencia = {};
        this.bancoSelecionado = 0;
    }
    selectBanco(numero){
        this.bancoSelecionado = numero;
    }
    async start(){
        //vue instance start here
        this.type = this.component("ComprarCreditos") ? "CR" : "CT";
        if(this.type == 'CR'){
            this.component("ComprarCreditos").select(parseFloat(getQueryParameter("value")));
        }
        this.update();
    }
    goLogin(){
        var returnURL = '';
        if(this.type == 'CR'){
            if(document.location.search){
                returnURL = '/credito/comprar' + document.location.search + '&value=' + encodeURIComponent(this.value);
            }else{
                returnURL = '/credito/comprar?value=' + encodeURIComponent(this.value);
            }
        }else{
            returnURL = '/carrinho' + document.location.search;
        }
        document.location.href = '/usuario/login?returnUrl=' + encodeURIComponent(returnURL);
    }
    go(url){
        document.location.href = url;
    }
    isEmpty(){
        return this.type == "CT" &&  this.component("Cart") ? this.component("Cart").items().length == 0 : this.value <= 0;
    }
    get value(){
        return ((this.component("ComprarCreditos") || {}).selected || 0);
    }

    isActive(paymentTitle){
        return this._hashMapPaymentMethods[paymentTitle] ? true : false;
    }
    unAvailabilityReason(paymentTitle){
        return this._hashMapPaymentMethods[paymentTitle].UnavailabilityReason;
    }
    async update(){
        this.showLoading();
        this.paymentMethods = await Pagamento.paymentMethods(this.type, this.value.format("0.00"));
        this._hashMapPaymentMethods = {};
        if(this.paymentMethods.Success){
            this.paymentMethods.Options.filter((p)=> p.IsActive).forEach((p)=>{
                this._hashMapPaymentMethods[p.Title] = p;
            });
        }
        this.hideLoading();
    }
    async pagarCartaoCredito(){
       
        if (!this.dadosTransferencia.NomeDoTitular || this.dadosTransferencia.NomeDoTitular.length < 2) {
            this.showAlert("Favor informar o titular.");
            return;
        }
        var cardNumber = (this.dadosTransferencia.NumeroCartao || "").split("-").join("");
        if (cardNumber.length < 14 || !this.isValidCreditCardNumber(cardNumber)) {
            this.showAlert("Favor informar um cartão de crédito válido");
            return;
        }
        
        var cardBrand = this.getCreditCardBrand(cardNumber);
        //validação da bandeira do cartão
        if (!cardBrand) {
            this.showAlert("Favor informar um cartão de crédito válido");
            return;
        }
        //caso seja master e visa o numero de digitos deve ser 16
        if (cardBrand != "Diners.Credit" && cardNumber.length < 16) {
            this.showAlert("Favor informar um cartão de crédito válido");
            return;
        }

        //validação da data de expiração do cartão
        var cardDateParts = (this.dadosTransferencia.ValidadeCartao || "").split("/");
        var cardDateMonth = parseInt(cardDateParts[0]);
        var cardDateYear = parseInt(cardDateParts[1]);
        var now = Date.now();
        var currentYear = now.getFullYear() - 2000;
        var currentMonth = now.getMonth() + 1;
        if (isNaN(cardDateMonth) || isNaN(cardDateYear) ||
            cardDateMonth <= 0 || cardDateMonth > 12 ||
            (currentYear == cardDateYear && currentMonth > cardDateMonth) ||
            cardDateYear < currentYear ||
            cardDateYear > 100) {

            this.showAlert("Verificar a data de validade");
            return;
        }
        var year = cardDateYear + 2000;
        var month = cardDateMonth;

        //validação de CVV do cartão
        if ((this.dadosTransferencia.CVV || "").length < 3) {
            this.showAlert("Favor informar um CVV válido");
            return;
        }
        if(!this.termosDeUso){
            this.showAlert("É necessário aceitar os termos de uso para realizar o pagamento");
            return;
        }
        var formData = "NumeroDoCartao=" + cardNumber;
            formData += "&BandeiraDoCartao=" + encodeURIComponent(cardBrand);
            formData += "&CodigoVerificador=" + this.dadosTransferencia.CVV;
            formData += "&MesValidadeCartao=" + month;
            formData += "&AnoValidadeCartao=" + year;
            formData += "&NomeDoTitular=" + encodeURIComponent(this.dadosTransferencia.NomeDoTitular); 
            //dados adicionais para o pagamento
            formData += "&IP=" + encodeURIComponent(getIP());
            formData += "&tipoDeCompra=" + this.type;
            formData += "&tipoDePagamento=E";
            formData += "&Cupom=" + (sessionStorage.getItem("coupom") || "");
        this.showLoading();
        var paymentResult = await Pagamento.makePayment(this.type, this.value, 32, formData, 0);
        this.hideLoading();

        this.processPaymentResult(paymentResult);
    }
    isValidCreditCardNumber(number) {
        function isValidCreditCard(value) {
            // accept only digits, dashes or spaces
            if (/[^0-9-\s]+/.test(value)) return false;

            // The Luhn Algorithm. It's so pretty.
            var nCheck = 0, nDigit = 0, bEven = false;
            value = value.replace(/\D/g, "");

            for (var n = value.length - 1; n >= 0; n--) {
                var cDigit = value.charAt(n),
                      nDigit = parseInt(cDigit, 10);

                if (bEven) {
                    if ((nDigit *= 2) > 9) nDigit -= 9;
                }

                nCheck += nDigit;
                bEven = !bEven;
            }

            return (nCheck % 10) == 0;
        }

        return this.getCreditCardBrand(number) && isValidCreditCard(number);
    }
    getCreditCardBrand(number) {
        //inicio 5
        if (/^5[1-5]/.test(number)) {
            return "MA.Credit";
        }
        //inicio 4
        if (/^4/.test(number)) {
            return "Visa.Credit";
        }
        //inicio 301, 305, 36, 38
        if (/^30[15]/.test(number) || /^3[68]/.test(number)) {
            return "Diners.Credit";
        }
        //mais cartões em https://gist.github.com/erikhenrique/5931368
        return null;
    }
    async gerarBoleto(){
        if(!this.termosDeUso){
            this.showAlert("É necessário aceitar os termos de uso para realizar o pagamento");
            return;
        }
        this.showLoading();
        var formData = "Cupom=" + (sessionStorage.getItem("coupom") || "");
        var paymentResult = await Pagamento.makePayment(this.type, this.value, 1, formData, 0);
        this.hideLoading();

        this.processPaymentResult(paymentResult);
    }

    async transferenciaBB(){
       
        if (!this.dadosTransferencia.NomeDoTitular || this.dadosTransferencia.NomeDoTitular.length < 2) {
            this.showAlert("Favor informar o titular.");
            return;
        }

        if (!this.dadosTransferencia.Agencia) {
            this.showAlert("Favor informar o número da agência bancária.");
            return;

        } else if (this.dadosTransferencia.Agencia.length != 4) {
            this.showAlert("Agência precisa ter 4 dígitos.");
            return;
        }
        if (!this.dadosTransferencia.DVAgencia) {
            this.showAlert("Favor informar o digito da agência");
            return;
        }

        if (!this.dadosTransferencia.ContaCorrente) {
            this.showAlert("Favor informar o número da conta corrente.");
            return;

        } else if (this.dadosTransferencia.ContaCorrente.length > 10) {
            this.showAlert("Conta corrente precisa ter no máximo 10 dígitos.");
            return;

        } else if (this.dadosTransferencia.ContaCorrente.length < 4) {
            this.showAlert("Conta corrente precisa ter no mínimo 4 dígitos.");
            return;
        }

        if (!this.dadosTransferencia.DVContaCorrente) {
            this.showAlert("Favor informar o digito da conta corrente");
            return;
        }

        if(!this.termosDeUso){
            this.showAlert("É necessário aceitar os termos de uso para realizar o pagamento");
            return;
        }
        var formData = "NomeDoTitular=" + encodeURIComponent(this.dadosTransferencia.NomeDoTitular);
            formData += "&NumeroDaAgencia=" + encodeURIComponent(this.dadosTransferencia.Agencia);
            formData += "&DigitoDaAgencia=" + encodeURIComponent(this.dadosTransferencia.DVAgencia);
            formData += "&NumeroDaContaCorrente=" + encodeURIComponent(this.dadosTransferencia.ContaCorrente);
            formData += "&DigitoDaContaCorrente=" + encodeURIComponent(this.dadosTransferencia.DVContaCorrente);
            formData += "&Cupom=" + (sessionStorage.getItem("coupom") || "");
        this.showLoading();
        var paymentResult = await Pagamento.makePayment(this.type, this.value, 39, formData, 0);
        this.hideLoading();

        this.processPaymentResult(paymentResult);
    }

    async transferenciaPagVap(){
       
        if(this.bancoSelecionado == 0){
            this.showAlert("Favor selecionar um banco");
            return;
        }
        if(this.bancoSelecionado == 3){
            if(!this.dadosTransferencia.CPF || !User.validateCPF(this.dadosTransferencia.CPF)){
                this.showAlert("Favor informar um CPF de Titular válido.");
                return;
            }
        }else{
            if (!this.dadosTransferencia.NomeDoTitular || this.dadosTransferencia.NomeDoTitular.length < 2) {
                this.showAlert("Favor informar o titular.");
                return;
            }
            
            if (!this.dadosTransferencia.Agencia) {
                this.showAlert("Favor informar o número da agência bancária.");
                return;

            } else if (this.dadosTransferencia.Agencia.length != 4) {
                this.showAlert("Agência precisa ter 4 dígitos.");
                return;
            }
            if (!this.dadosTransferencia.DVAgencia && this.bancoSelecionado != 3 && this.bancoSelecionado != 4) {
                this.showAlert("Favor informar o digito da agência");
                return;
            }

            if (!this.dadosTransferencia.ContaCorrente) {
                this.showAlert("Favor informar o número da conta corrente.");
                return;

            } else if (this.dadosTransferencia.ContaCorrente.length > 10) {
                this.showAlert("Conta corrente precisa ter no máximo 10 dígitos.");
                return;

            } else if (this.dadosTransferencia.ContaCorrente.length < 4) {
                this.showAlert("Conta corrente precisa ter no mínimo 4 dígitos.");
                return;
            }

            if (!this.dadosTransferencia.DVContaCorrente) {
                this.showAlert("Favor informar o digito da conta corrente");
                return;
            }
        }

        if(!this.termosDeUso){
            this.showAlert("É necessário aceitar os termos de uso para realizar o pagamento");
            return;
        }

        var formData = "NomeDoTitular=" + encodeURIComponent(this.dadosTransferencia.NomeDoTitular);
            formData += "&NumeroDaAgencia=" + encodeURIComponent( this.bancoSelecionado != 4 &&  this.bancoSelecionado != 3 ? this.dadosTransferencia.Agencia + "-" + this.dadosTransferencia.DVAgencia: this.dadosTransferencia.Agencia);
            formData += "&ContaCorrente=" + encodeURIComponent(this.dadosTransferencia.ContaCorrente);
            formData += "&DigitoContaCorrente=" + encodeURIComponent(this.dadosTransferencia.DVContaCorrente);
            formData += "&bankID=" + encodeURIComponent(this.bancoSelecionado);
            formData += "&cpf=" + encodeURIComponent(this.dadosTransferencia.CPF);
            formData += "&Cupom=" + (sessionStorage.getItem("coupom") || "");
        this.showLoading();
        
        var paymentResult = await Pagamento.makePayment(this.type, this.bancoSelecionado == 4 ? this.gerarCentavos(this.value) : this.value, 29, formData, 0);
        this.hideLoading();

        this.processPaymentResult(paymentResult);
    }
    gerarCentavos(value) {
        function getRandomArbitrary(min, max) {
            return Math.random() * (max - min) + min;
        }
        var centavosAtuais = parseInt((value - parseInt(value)) * 100);
        if (centavosAtuais == 0)
            centavosAtuais = 1;
        var centavosCaixa = parseInt(getRandomArbitrary(centavosAtuais, 100));
        if (centavosCaixa <= 0)
            centavosCaixa = 1;
        return (parseInt(value) + (centavosCaixa / 100));
    }
    async processPaymentResult(paymentResult){
        sessionStorage.setItem("coupom", "");

        if(!paymentResult.Success){
            await this.showAlert(paymentResult.ErrorMessage);
            this.update();
            return;
        }
        localStorage.setItem("lastPaymentResponse", JSON.stringify(paymentResult));
        document.location.href = "/Pagamento/Finalizar";
    }
}
export default PagamentoController;