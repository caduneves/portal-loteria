class Loteca{
 
    constructor(formatedCard){
        this.dezenas = formatedCard;
    }
 
    get calculatedCard(){
        var totais = { "Seco": 0, "Duplo": 0, "Triplo": 0 };
        for (var i = 0; i < this.dezenas.length; i++) {
            var tipo = this.getTipoJogoLoteca(this.dezenas[i]);
            totais[tipo] = (totais[tipo] || 0) + 1;
        }
        return totais;
    }
 
    isColunaMarcadaLoteca(valor, coluna) {
        valor = parseInt(valor);
        if (valor == 7)
            return true;
 
        var colunas = [[4, 6, 5], [2, 3, 6], [1, 3, 5]];
 
        if (!colunas[coluna])
            return false;
 
        for (var i = 0; i < colunas[coluna].length; i++) {
            if (colunas[coluna][i] == valor)
                return true;
        }
 
        return false;
    }
    getTipoJogoLoteca(valor) {
        var tipo = 0;
 
        for (var i = 0; i < 3; i++) {
            if (this.isColunaMarcadaLoteca(valor, i))
                tipo++;
        }
 
        if (tipo == 1)
            return "Seco";
        if (tipo == 2)
            return "Duplo";
        if (tipo == 3)
            return "Triplo";
        return "";
    }
}
 
export default Loteca;