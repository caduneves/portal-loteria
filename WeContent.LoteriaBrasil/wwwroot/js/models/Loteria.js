import { msDate } from "../api/util";
class Loteria{

    constructor(loteria){
        loteria = loteria || {};

        for(var i in loteria){
            this[i] = loteria[i];
        }
    }

    get concurso() {
        return (this.ConcursoBolao || this.ConcursoFacaJogo);
    }
    get nome() {
        return this.Especial ? this.NomeDaLoteriaEspecial : this.NomeDaLoteria;
    }

    get descricao() {
        return this.DescricaoLoteria;
    }

    get hasBolao() {
        return this.ConcursoBolao ? true : false;
    }
    get hasFacaSeuJogo() {

        switch ( this.CodigoLoteria ){
            case 6:
                return (this.ConcursoFacaJogo && this.ConcursoFacaJogo.partidas && this.ConcursoFacaJogo.partidas.length > 1);
            default:
                return this.ConcursoFacaJogo ? true : false;
        }
        
    }
    get mensagemHorarioLimite() {
        switch (this.CodigoLoteria) {
            //mega e dupla
            case 1:
            case 2:
                return "O horário limite para apostar com seus palpites no dia do sorteio é as 15h com 6 dezenas e as 16h com 8 dezenas ou mais (horário de Brasília).";
            //loteca e lotogol
            case 1:
            case 2:
                return "O horário limite para apostar com seus palpites no dia da partida de futebol é as 9h (horário de Brasília).";
            default:
                return "O horário limite para apostar com seus palpites no dia do sorteio é as 15h (horário de Brasília).";
        }
    }
    get class() {
        return Loteria.classByID(this.CodigoLoteria);
    }
    get timer(){
        try{
            var diff = Time.fromDateDiff(msDate(this.DataDoSorteio), Date.now());

            if(diff.getTotalSeconds() <= 0){
                return `00d  00h  00m  00s`;
            }
            var hours = diff.getHours();
            var days = 0;
            if(hours > 24){
                days = parseInt(hours / 24);
                hours = hours - (days * 24);
            }
            return `${days.format("00")}d  ${hours.format("00")}h  ${diff.format("mm")}m  ${diff.format("ss")}s`;
        }catch(ex){
            return `00d  00h  00m  00s`;
        }
    }
    get url(){
        if(this.concurso.Especial){
            switch (codigoLoteria) {
                case 1:
                    return "/mega/virada";
                case 2:
                    return "/dupla/pascoa";
                case 4:
                    return "/quina/saojoao";
                case 8:
                    return "/lotofacil/independencia";
                default:
                    break;
            }
        }
        return "/" +this.class;
    }
    static classByID(codigoLoteria){
        switch (codigoLoteria) {
            case 1:
                return "mega-sena";
            case 2:
                return "dupla-sena";
            case 3:
                return "lotomania";
            case 4:
                return "quina";
            case 5:
                return "loteria-federal";
            case 6:
                return "loteca";
            case 7:
                return "lotogol";
            case 8:
                return "lotofacil";
            case 9:
                return "timemania";
            case 10:
                return "diadesorte";
            default:
                return "";
        }
    }
    static nomeByID(codigoLoteria){
        switch (codigoLoteria) {
            case 1:
                return "Mega-Sena";
            case 2:
                return "Dupla-Sena";
            case 3:
                return "Lotomania";
            case 4:
                return "Quina";
            case 5:
                return "Loteria Federal";
            case 6:
                return "Loteca";
            case 7:
                return "Lotogol";
            case 8:
                return "Lotofácil";
            case 9:
                return "Timemania";
            case 10:
                return "Dia de Sorte";
            default:
                return "";
        }
    }   
    get isDezenas(){
        return !this.isLotogol && !this.isLoteca && !this.isFederal;
    }
    get isFederal(){
        return this.CodigoLoteria == 5;
    }
    get isLotogol(){
        return this.CodigoLoteria == 7;
    }
    get isLoteca(){
        return this.CodigoLoteria == 6;
    }

    getTimeDaCasaLoteca(index){
        return this.ConcursoFacaJogo.partidas.length > 1 ? this.ConcursoFacaJogo.partidas[index].TimeDaCasa : null;
    }
    getVisitanteLoteca(index){
        return this.ConcursoFacaJogo.partidas.length > 1 ? this.ConcursoFacaJogo.partidas[index].Visitante : null;
    }
    get acumulado(){
        return this.concurso.Acumulado;
    }


    get estimativaPremio(){
        var premio = this.concurso.EstimativaPremio;
        return Loteria.formatarPremio(premio);
    }

    get estimativaPremioUnidadeEstilizado() {
        let premio = this.estimativaPremio;
        if( premio == "a definir" ){ return premio; };

        premio = premio.split(' ')[1];

        return premio;
    };
    get diaSorteio(){
        if(!this.DataDoSorteio){
            return "a definir";
        }
        var sorteio = msDate(this.DataDoSorteio);
        if(Date.now().date() == sorteio.date()){
            return "Hoje";
        }
        if(Time.fromDateDiff(sorteio.date(), Date.now().date()).getTotalHours() == 24){
            return "Amanhã";
        }
        if(Time.fromDateDiff(sorteio.date(), Date.now().date()).getTotalHours()  / 24 <= 7){
            return ["Domingo", "Segunda", "Terça", "Quarta",  "Quinta", "Sexta", "Sabádo"][sorteio.getDay()];
        }
        return sorteio.format("dd/MM/yyyy");
    }
    static formatarPremio(premio){
        if(premio >= 1000000){
            premio = (premio / 1000000);
            if(premio >= 2){
                if(Number.isInteger(premio)){
                    return premio.format("0") + " milhões";
                }
                return premio.format("0.0") + " milhões";
            }else{
                if(Number.isInteger(premio)){
                    return premio.format("0") + " milhão";
                }
                return premio.format("0.0") + " milhão";
            }
        }

        if(premio >= 1000){
            premio = (premio / 1000);
            if(Number.isInteger(premio)){
                return premio.format("0") + " mil";
            }
            return premio.format("0.0") + " mil";
        }
        if(!premio)
            return "a definir";
        return premio + "";
    }
    static getIDBySlug(slug){
        switch (slug) {
            case "mega":
            case "megasena":
            case "mega-sena":
                return 1;
            case "dupla":
            case "duplasena":
            case "dupla-sena":
                return 2;
            case "lotomania":
                return 3;
            case "quina":
                return 4;
            case "federal":
            case "loteria-federal":
                return 5;
            case "loteca":
                return 6;
            case "lotogol":
                return 7;
            case "lotofacil":
                return 8;
            case "timemania":
                return 9;
            case "dia-de-sorte":
            case "diadesorte":
                return 10;
            default:
                return -1;
        }
    }
}

export default Loteria;