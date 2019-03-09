import { msDate, getValorAproximado } from "../api/util";
class ResultadoEspecial {

    constructor(resultado){
        resultado = resultado || {};
        

        for(var i in resultado){
            this[i] = resultado[i];
        }
    }

    get concurso() { return this.NumeroConcurso; }

    get premio() {
        return getValorAproximado(this.EstimativaDePremio );
    }

    get diaSorteio(){
        var sorteio = msDate(this.DataSorteio);
        return sorteio.format("dd/MM");
    }

    get diaSorteioFull(){
        var sorteio = msDate(this.DataSorteio);
        return sorteio.format("dd/MM/yyyy");
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

}

export default ResultadoEspecial;