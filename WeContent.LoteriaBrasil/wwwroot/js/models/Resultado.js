import { msDate, getValorAproximado } from "../api/util";
class Resultado {

    constructor(resultado){
        resultado = resultado || {};

        for(var i in resultado){
            this[i] = resultado[i];
        }
    }

    get concurso() { return this.Concurso; }

    get localSorteio() { return this.ResumoSorteio.LocalSorteio; }

    get premio() {
        var val = 0;
        
        this.Premiacao.map((a) => {
            val += a.Premio;
        })

        return getValorAproximado(val);
    }

    get premioProximo() {
        return getValorAproximado(this.ResumoSorteio.EstimativaProximo);
    }

    get diaSorteio(){
        var sorteio = msDate(this.DataDoSorteio);
        return sorteio.format("dd/MM");
    }

    get diaSorteioFull(){
        var sorteio = msDate(this.DataDoSorteio);
        return sorteio.format("dd/MM/yyyy");
    }

    get dezenas() {
        return this.NumerosSorteados.map((a) => a.Value.split(' ') );
    }

    get partidas() { return this.Partidas; }

    get isAcumulada() {
        return ( this.ResumoSorteio.AcumuladoParte1 > 0);
    }

    get className() {
        switch (this.Loteria) {
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

    get loteriaNome(){
        switch (this.Loteria) {
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
        return this.Loteria == 5;
    }
    get isLotogol(){
        return this.Loteria == 7;
    }
    get isLoteca(){
        return this.Loteria == 6;
    }
}

export default Resultado;