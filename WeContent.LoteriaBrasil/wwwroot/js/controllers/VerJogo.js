import Controller from './Controller';
import Session from '../api/Session';
import Loterias from '../api/Loterias';
import { msDate } from '../api/util';
import Loteria from '../models/Loteria';

class VerJogo extends Controller{

    constructor(){
        super();
        this.reset();
        this.pageSize = 100;
    }
    
    async start() {
        
    }

    reset(){
        this.visible = false;
        this.volante = null;
        this.page = 1;
        this.totalPages = 1;
        this.totalApostas = 0;
        this.somentePremiados = false;
        this.codigoLoteria = 0;
        this.numeroDoConcurso = 0;
        this.codigoDoPagamento = 0;
        this.isFacaSeuJogo = false;
        this.cartoes = [];
    }

    async showFSJ(codigoLoteria, numeroDoConcurso){
        this.reset();

        this.codigoLoteria = codigoLoteria;
        this.numeroDoConcurso = numeroDoConcurso || 0;

        this.isFacaSeuJogo = true;
        
        this.showLoading();
        var result = await Loterias.volanteFSJ(codigoLoteria, numeroDoConcurso);

        this.cartoes = result.Cartoes;
        this.volante = result;
        this.hideLoading();
    }
    
    async show(codigoGrupo, numeroDoConcurso, codigoDoPagamento){
        this.reset();

        this.codigoGrupo = codigoGrupo;
        this.numeroDoConcurso = numeroDoConcurso || 0;
        this.codigoDoPagamento  = codigoDoPagamento || 0;

        this.isFacaSeuJogo = false;

        this.showLoading();

        var volante = await Loterias.volante(codigoGrupo, codigoDoPagamento, numeroDoConcurso);
        this.volante = {
            class: Loteria.classByID(volante.Loteria),
            nomeGrupo: volante.NomeGrupo,
            numeroConcurso: volante.Concurso.Numero,
            nomeLoteria: Loteria.nomeByID(volante.Loteria),
            codigoLoteria: volante.Loteria,
            dataSorteio: msDate(volante.Concurso.DataSorteio).format("dd/MM/yyyy"),
            premio: Loteria.formatarPremio(volante.Concurso.EstimativaPremio),
            descricao: volante.DescricaoGrupo
        };
        this.totalApostas = parseInt(volante.TotalDeCartoes);
        var pages = this.totalApostas / this.pageSize;
        if(!Number.isInteger(pages)){
            pages = parseInt(pages) + 1;
        }
        this.totalPages = pages;
        await this.changePage(0, false);
        this.visible = true;
    }

    async changePage(page, somentePremiados){
        
        this.page = page || 0;
        if(this.page < 1){
            this.page = 1;
        }
        this.somentePremiados = somentePremiados || false;

        this.showLoading();
        var cartoes = await Loterias.cartoesVolante(this.codigoGrupo, this.page, this.pageSize, this.numeroDoConcurso, this.somentePremiados);
        this.cartoes = (cartoes || []).map((c) => {
            return {
                dezenas: c.CartaoAposta.split(" "),
                numero: parseInt(c.Numero).format("00000")
            }
        });
        this.hideLoading();
    }
    firstPage(){
        if(this.page != 1){
            this.changePage(1, false);
        }
    }
    pageNext(){
        if(this.page < this.totalPages){
            this.page++;
            this.changePage(this.page, false);
        }
    }
    pageBack(){
        if(this.page > 1){
            this.page--;
            this.changePage(this.page, false);
        }
    }
    lastPage(){
        if(this.page != this.totalPages){
            this.changePage(this.totalPages, false);
        }
    }

    close(){
        this.reset();
        this.visible = false;
    }
}
export default VerJogo;