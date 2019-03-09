import Controller from './Controller';
import Session from '../api/Session';
import User from '../api/User';
import { msDate } from '../api/util';

class MinhasCompras extends Controller{

    constructor(){
        super();
        this.displayFilter = false;
        this.minhasCompras = { Compras: []};
        this.currentTab = "compras";
        this.resetFilters();
    }
    
    async start() {

        this.user = await Session.getUser();
        if(!this.user){
            document.location.href = "/usuario/login";
        }
        this.watchHash();

        await this.update();
        //start watching hash
        setInterval(()=> this.watchHash(), 300);
    }
    watchHash(){
        var hash = document.location.hash.replace("#", "") || "compras";
        if(hash == "compras"){
            this.component("MenuMinhaConta").select("compras");
        }else{
            this.component("MenuMinhaConta").select("apostas");
        }
        if(hash != this.currentTab){
            this.currentTab = hash;
            window.scroll(0, 0);
            this.filter();
        }
    }
    async update(){
        this.tipoBusca = this.currentTab  == "compras" ? 1 : 2;
        this.minhasCompras = await User.getComprasApostas(
            this.dataInicial,
            this.dataFinal,
            this.tipoBusca,
            this.formaPagamento ? "": parseInt(this.formaPagamento),
            parseInt(this.situacaoCompra),
            parseInt(this.loteria),
            parseInt(this.tipoAposta),
            parseInt(this.situacaoAposta)
        );
        if(this.minhasCompras.Compras){
            this.minhasCompras.Compras.forEach((compra)=>{
                compra.Data = msDate(compra.Data);
                compra.DataDaAposta = msDate(compra.DataDaAposta);

                if(compra.DataDaConferencia){
                    compra.DataDaConferencia = msDate(compra.DataDaConferencia);
                }
                compra.canExpand = false;
                compra.expanded = this.currentTab  == "compras" ? false : true;
                if(compra.Itens){
                    
                    compra.Itens.forEach((item)=>{
                        compra.canExpand =  true;
                        
                        if(item.DataDePagamento){
                            item.DataDePagamento = msDate(item.DataDePagamento);
                        }
                        if(item.DataDoSorteio){
                            item.DataDoSorteio = msDate(item.DataDoSorteio).format("dd/MM/yyyy");
                        }else{
                            item.DataDoSorteio = "-";
                        }
                    });
                }
            });
        }
        console.log(this.minhasCompras);
        this.reload();
    }
    resetFilters(){
        var start = Date.now();
        start.setDate(start.getDate() - 30);
        var end = Date.now();
        end.setDate(end.getDate() + 365);
        this.dataInicial = start.format("dd/MM/yyyy") + " 00:00";
        this.dataFinal = end.format("dd/MM/yyyy") + " 23:59";
        this.tipoBusca = 1;
        this.formaPagamento = "";
        this.situacaoCompra = "0";
        this.loteria = "0";
        this.tipoAposta = "0";
        this.situacaoAposta = "0";
    }

    async filter(){
        this.showLoading();
        await this.update();
        this.hideLoading();
        this.displayFilter = false;
    }
    toogleFilter(){
        this.displayFilter = !this.displayFilter;
    }
    toogle(compra){
        if(compra.canExpand){
            compra.expanded = !compra.expanded;
            this.reload();
        }
    }

    paymentImage(compra){
        switch(parseInt(compra.FormaDePagamento)){
            case 0:
                return "credito.png";
            case 1:
                return "boleto.png";
            case 28:
                return `cartao_${compra.BandeiraCartao}.png`;
            case 26:
                return "neteller.png";
            case 29:
                return `pagvap_${parseInt(compra.BankID)}.png`;    
            case 39:
                return `transferencia_bb.png`;
            case 291:
                return `transferencia_bradesco.png`;
            case 292:
                return `transferencia_itau.png`;
            case 293:
                return `transferencia_santander.png`;
            case 294:
                return `transferencia_caixa.png`;
            case 295:
                return `transferencia_bb.png`;
            default:
                return '';
        }
    }
}
export default MinhasCompras;