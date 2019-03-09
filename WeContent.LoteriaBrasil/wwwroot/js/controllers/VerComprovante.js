import Controller from './Controller';
import Session from '../api/Session';
import Loterias from '../api/Loterias';
import { msDate } from '../api/util';
import Loteria from '../models/Loteria';

class VerComprovante extends Controller{

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
        this.totalApostas = 1;
        this.codigoLoteria = 0;
        this.numeroDoConcurso = 0;
        this.comprovante = null;
    }

    async show(codigoGrupo, numeroDoConcurso){
        this.reset();

        this.codigoGrupo = codigoGrupo;
        this.numeroDoConcurso = numeroDoConcurso || 0;

        this.showLoading();

        var volante = await Loterias.volante(codigoGrupo, 0, numeroDoConcurso);
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
        await this.changePage(0);
        this.visible = true;
    }

    async changePage(page){
        
        this.page = page || 0;
        if(this.page < 1){
            this.page = 1;
        }

        this.showLoading();
        this.comprovante = await Loterias.comprovantes(this.codigoGrupo, this.numeroDoConcurso, this.page);
        this.page = this.comprovante.CartaoFinal;
        this.totalPages = this.comprovante.TotalDeCartoes;
        this.reload();
        this.hideLoading();
    }
    firstPage(){
        if(this.comprovante.CartaoInicial != 1){
            this.changePage(1);
        }
    }
    pageNext(){
        if(this.comprovante.CartaoFinal  < this.totalPages){
            this.changePage(this.comprovante.CartaoFinal + 1);
        }
    }
    pageBack(){
        if(this.comprovante.CartaoInicial  > 1){
            this.changePage(this.comprovante.CartaoInicial - 1);
        }
    }
    lastPage(){
        if(this.comprovante.CartaoFinal != this.totalPages){
            this.changePage(this.totalPages);
        }
    }

    close(){
        this.reset();
        this.visible = false;
    }
}
export default VerComprovante;