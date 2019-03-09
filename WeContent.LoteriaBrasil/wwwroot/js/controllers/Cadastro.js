import Controller from './Controller';
import Session from '../api/Session';
import User from '../api/User';
import { msDate } from '../api/util';
class Cadastro extends Controller{

    constructor(){
        super();
        this.user = {};
        this.updatedUser = {};
        this.passwordData = { password: "", newPassword: "", confPassword: ""};
        this.returnUrl = Session.returnUrl();
        this.receiveEmail = true;
        this.currentTab = "dadospessoais";
    }

    async start(){
        window.scroll(0, 0);
        
        this.user = await Session.getUser();
        if(!this.user){
            document.location.href = "/usuario/login";
        }

        this.user.Nascimento = msDate(this.user.Nascimento).format('dd/MM/yyyy');
        this.receiveEmail = (this.user.ReceberEmail || "s").toLowerCase() == "s";
        this.user.ConfirmacaoEmail = this.user.Email;
        this.currentTab = document.location.hash.replace("#", "") || "dadospessoais";
        
        //start watching hash
        setInterval(()=> this.watchHash(), 300);
    }

    async back(){
        document.location.href = this.returnUrl || "/usuario/login";
    }

    selectTab(tab){
        this.currentTab = tab;
        document.location.hash = `#${tab}`;
    }

    changeAvatar(){
        fileInput.click();
    }
    async onAvatarChange(){
        var avatar = await this.getAvatarData();
        if(avatar){
            if(avatar.type != "png" && avatar.type != "gif" && avatar.type != "jpeg" && avatar.type != "jpg")
            {
                this.showAlert('A imagem de perfil deve ser png, gif, jpeg');
                return;
            }
            if(avatar.size / 1024 > 300.5){
                this.showAlert('A imagem do avatar deve ter o tamanho máximo de 300KB');
                return;
            }
            this.user.TipoImagem = `image/${avatar.type}`;
            this.user.Avatar = avatar.base64;
        }
    }
    getAvatarData() {
        return new Promise((resolve)=>{
            var file = fileInput.files[0];
            if(file){
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function () {
                    var parts = reader.result.split(";");
                    var type = parts[0].split("/").pop().split('-').pop().toLowerCase();
                    var base64 = parts[1].split(',')[1];
                    resolve({ base64: base64, type: type, size: file.size });
                };
                reader.onerror = function (error) {
                    resolve(null);
                };
            }
        });
     }
    confirm(){
        switch(this.currentTab){
            case "dadospessoais":
                this.saveUser();
                break;
            case "alteracaodesenha":
                this.changePassword();
                break;
            case "":
                break;
        }    
        
    }

    async saveUser(){
        var response = await this.showConfirm("Deseja salvar as alterações no cadastro de usuário?");
        if(!response){
            return;
        }
        if(!this.user.NomeUsuario || 
            this.user.NomeUsuario.length <= 3 ||
             this.user.NomeUsuario.trim().split(" ").length < 2){
               this.showAlert("Informe o nome completo");
               return;
        }
        if(parseDate(this.user.Nascimento, "dd/MM/yyyy") == null){
            this.showAlert("Informe a data de nascimento");
            return;
        }
       
        if(!this.user.TelefoneCelular && this.user.TelefoneCelular.trim().length != 15){
            this.showAlert("Informe um telefone celular válido");
            return;
        }
       
        if(!this.user.CEP || this.user.CEP.trim().length != 9){
            this.showAlert("Informe um CEP válido");
            return;
        }
        var cepInformation = await User.getCEPInformation(this.user.CEP);
        if(!cepInformation || !cepInformation.uf || !cepInformation.localidade){
            this.showAlert("Informe um CEP válido");
            return;
        }
        if(!this.user.Email || this.user.Email.indexOf("@") == -1 ||
        this.user.Email.trim().split("@")[0].length < 3){
            this.showAlert("Informe um e-mail válido");
            return;
        }
        if(this.user.Email != this.user.ConfirmacaoEmail){
            this.showAlert("Os e-mails informados não conferem");
            return;
        }
        if(!this.user.CPF || !User.validateCPF(this.user.CPF)){
            this.showAlert("Informe um CPF válido");
            return;
        }
        if(this.user.Sexo == ""){
            this.showAlert("Informe o sexo");
            return;
        }
        this.showLoading();
        var result = await User.updateUser(this.user.Nascimento, 
                                    this.user.Sexo, 
                                    this.user.Email,
                                    this.user.Apelido,
                                    this.user.NomeUsuario, 
                                    this.user.CPF,
                                    this.user.TelefoneCelular,
                                    "","",this.user.TelefoneResidencial,"",
                                    this.user.CEP,
                                    "","",
                                    cepInformation.localidade,
                                    cepInformation.uf,
                                    "", 
                                    (this.receiveEmail ? "S" : "N"), 
                                    99,
                                    (this.user.Avatar ? `data:${this.user.TipoImagem};base64,${this.user.Avatar}` : null));
        await Session.updateUserFromSession();
        this.hideLoading();
        var error = this.getError(result);
        if(error){
            this.showAlert(error);
            return;
        }
        var loginHeader = this.component('LoginHeader');
        if(loginHeader){
            loginHeader.refresh();
        }
        await this.showAlert("Cadastro alterado com sucesso!");
        
    }

    async changePassword(){
        this.showLoading();
        var result = await User.alterarSenha(this.passwordData.password, this.passwordData.newPassword, this.passwordData.confPassword);
        this.hideLoading();
        var error = this.getError(result);
        if(error){
            this.showAlert(error);
            return;
        }
        this.showAlert("Senha alterada com sucesso!");
        this.passwordData = { password: "", newPassword: "", confPassword: ""};
    }

    watchHash(){
        var hash = document.location.hash.replace("#", "") || "dadospessoais";
        if(hash == "dadosdepagamento"){
            this.component("MenuMinhaConta").select("cartoes");
        }else{
            this.component("MenuMinhaConta").select("cadastro");
        }
        if(hash != this.currentTab){
            this.currentTab = hash;
            window.scroll(0, 0);
        }
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

export default Cadastro;