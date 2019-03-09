import Controller from './Controller';
import Session from '../api/Session';
import User from '../api/User';

class Login extends Controller{

    constructor(){
        super();
        this.email = "";
        this.password = "";
        this.returnUrl = Session.returnUrl();

        this.emailPasswordRecover = "";
        this.cpfEmailRecover = "";
        this.recoveredEmail = "";
        this.newUser  = {
            email: "",
            emailConfirmation: "",
            celPhone: "",
            birthDate: "",
            name: "",
            cep: "",
            password: "",
            passwordConfirmation: "",
            sexo: "",
            cpf: ""
        };
        this.registerStep = 0;
        this.recoverPasswordModalVisible = false;
        this.recoverEmailModalVisible = false;
        this.recoverEmailStep = 0;
        this.loginRecaptchaToken = null;
        this.verifyRecaptcha();
    }
    verifyRecaptcha(){
        if(grecaptcha){
            setTimeout(()=> this.reCaptchaLoaded(), 500);
        }else{
            setTimeout(()=> this.verifyRecaptcha() ,500);
        }
    }
    reCaptchaLoaded(){
        grecaptcha.render('loginReCaptcha', {
            'sitekey' : '6LeBAF8UAAAAAIA-gP_pL2L3Z2PBlUcDEvEoiVOO',
            'callback' : (token)=> this.reCaptchaCallback(token)
        });
        grecaptcha.render('cadastrarReCaptcha', {
            'sitekey' : '6LeBAF8UAAAAAIA-gP_pL2L3Z2PBlUcDEvEoiVOO',
            'callback' : (token)=> this.reCaptchaCallback(token)
        });
    }
    reCaptchaCallback(token){
        this.recaptchaToken = token;
    }
    async start(){
        this.user = await Session.getUser();
        if(this.user){
            document.location.href = "/usuario/cadastrar";
        }
    }

    showRecoveryPassword(){
        this.emailPasswordRecover = "";
        this.recoverPasswordModalVisible = true;
    }
    showRecoveryEmail(){
        this.recoverEmailModalVisible = true;
        this.recoverEmailStep = 0;
        this.recoveredEmail = "";
        this.cpfEmailRecover = "";
    }
    closeRecoveryPassword(){
        this.recoverPasswordModalVisible = false;
    }
    closeRecoveryEmail(){
        this.recoverEmailModalVisible = false;
    }
    async recoverPassword(){
        this.closeRecoveryPassword();
        var result = await User.esqueciMinhaSenha(this.emailPasswordRecover);
        if(result && result.length > 0 && result[0].Value){
            this.showAlert(result[0].Value);
        }else{
            this.showAlert("Foi enviado um e-mail para você com instruções para redefinir a sua senha.");
        }
    }
    async recoverEmail(){
        var result = await User.esqueciEmail(this.cpfEmailRecover);
        if(result && result.length > 0 && result[0].Value && result[0].Key != 0){
            this.closeRecoveryEmail();
            this.showAlert(result[0].Value);
        }else{
            this.recoveredEmail = result[0].Value;
        }
        this.recoverEmailStep = 1;
    }
    async registerNextStep(){
        if(!this.newUser.name || 
            this.newUser.name.length <= 3 ||
             this.newUser.name.trim().split(" ").length < 2){
               this.showAlert("Informe o nome completo");
               return;
        }
        if(parseDate(this.newUser.birthDate, "dd/MM/yyyy") == null){
            this.showAlert("Informe a data de nascimento");
            return;
        }
        if(!this.newUser.celPhone && this.newUser.celPhone.trim().length != 15){
            this.showAlert("Informe um telefone celular válido");
            return;
        }
        if(!this.newUser.email || this.newUser.email.indexOf("@") == -1 ||
        this.newUser.email.trim().split("@")[0].length < 3){
            this.showAlert("Informe um e-mail válido");
            return;
        }
        if(this.newUser.email != this.newUser.emailConfirmation){
            this.showAlert("Os e-mails informados não conferem");
            return;
        }
          
        if(!this.recaptchaToken){
            this.showAlert("É necessário marcar se você não é um robô");
            return;
        }
        this.showLoading();
        var result = await User.incluirUsuarioParcial(this.recaptchaToken, this.newUser.name, this.newUser.birthDate, this.newUser.email, this.newUser.celPhone);
        this.hideLoading();

        var error = this.getError(result);
        if(error){
            this.showAlert(error);
        }else{
            this.registerStep  = 1;
        }
    }

  
    async register(){
        if(!this.newUser.cpf || !User.validateCPF(this.newUser.cpf)){
            this.showAlert("Informe um CPF válido");
            return;
        }
        if(this.newUser.sexo == ""){
            this.showAlert("Informe o sexo");
            return;
        }
        if(!this.newUser.cep || this.newUser.cep.trim().length != 9){
            this.showAlert("Informe um CEP válido");
            return;
        }
        var cepInformation = await User.getCEPInformation(this.newUser.cep);
        if(!cepInformation || !cepInformation.uf || !cepInformation.localidade){
            this.showAlert("Informe um CEP válido");
            return;
        }
        if(!this.newUser.password || this.newUser.password.trim().length < 6){
            this.showAlert("Informe uma senha com no mínimo 6 caracteres");
            return;
        }
        if(this.newUser.password != this.newUser.passwordConfirmation){
            this.showAlert("As senhas informadas não conferem");
            return;
        }
        this.showLoading();
        var result = await User.updateUser(this.newUser.birthDate, 
                                    this.newUser.sexo, 
                                    this.newUser.email,
                                    "",
                                    this.newUser.name, 
                                    this.newUser.cpf,
                                    this.newUser.celPhone,
                                    "","","","",
                                    this.newUser.cep,
                                    "","",
                                    cepInformation.localidade,
                                    cepInformation.uf,
                                    "", "s", null, null, 
                                    this.newUser.password);
       

        var error = this.getError(result);
        if(error){
            this.hideLoading();
            this.showAlert(error);
            return;
        }
        this.login(this.newUser.email,this.newUser.password);
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

    async login(email, password){
        
        if(!this.recaptchaToken){
            this.showAlert("É necessário marcar se você não é um robô");
            return;
        }

        this.showLoading();

        email = email || this.email;
        password = password || this.password;
        var usuario =  await Session.login(this.recaptchaToken,
                                           email.indexOf("@")  != -1 ? email : "",//email
                                           email.indexOf("@")  == -1 ? email : "", //telefone
                                           password);

        this.hideLoading();          

        var error = this.getError(usuario, "Falha ao realizar login. Por favor tente novamente.");

        if(error){
            this.showAlert(error);
        }else{
            var tokenTransfered = await Session.transferToken(usuario.Token);
            if(!tokenTransfered){
                this.showAlert("Falha ao realizar login. Por favor tente novamente.");
                return;
            }
            Session.updateUser(usuario);

            var targetUrl =  "/";
            if (usuario.CadastroIncompleto)
            {
                targetUrl = "/usuario/cadastrar";
                if(this.returnUrl){
                    targetUrl += "?returnUrl=" + encodeURIComponent(this.returnUrl);
                }
            }
            else if (this.returnUrl)
            {
                targetUrl = this.returnUrl;
            }
            document.location.href = targetUrl;
        }
        
    }
}
export default Login;