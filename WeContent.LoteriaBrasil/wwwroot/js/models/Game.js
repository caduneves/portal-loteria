import Loteca from './Loteca';
import Cart from '../api/Cart';

class Game{
    
    constructor(dadosLoteria){
        this.dadosLoteria = dadosLoteria;
        this.dezenasHash = {};
        this.lotecaHash = {};
        for(var i = 0; i < 14;i++){
            this.lotecaHash[i] = { 0: false, 1: false, 2: false };
        }
        this.concursos = 1;
        this.recorrente = false;
        //timemania
        if(dadosLoteria.CodigoLoteria == 9){
            this.timeDoCoracao = 1;
        }else{
            this.timeDoCoracao = 0;
        }
        this.fechamento = 0;
        this.desdobramento = 0;
        //1 - Geral, 4 - Quer ajuda para Jogar, 7 - Mais Sorteadas, 8 - Menos Sorteadas
        //9 - Mais atrasadas, 10 - Mais recentes
        this.canalDeVenda = 1;
        if(dadosLoteria.CodigoLoteria == 10){
            this.mesDeSorte = 1;
        }else{
            this.mesDeSorte = 0;
        }
    }
    get quantitySelected(){
        return this.dezenas.length;
    }
    get dezenas(){
        return Object.keys(this.dezenasHash);
    }
    get formatedDozens(){
        
        if(this.dadosLoteria.CodigoLoteria == 6){
            return Object.values(this.lotecaHash).map((line)=>{
                var value = 0;
                if(line[0])
                  value+= 4;
                if(line[1])
                  value+= 2;
                if(line[2])
                  value+= 1;
                return value;
             }).filter((v) => v != 0).join("");
        }

        var arr = this.dezenas;
    	if(!arr.length){ return ""; } 
    	arr.map = function(a, b){ return a > b; };
        if (arr[arr.length - 1] == "00") {
            arr.pop();
            arr.unshift("00");
        }
        
        arr = arr.join("-");
    	return arr;
    }
    toogleLoteca(line, column){
        this.lotecaHash[line][column] = !this.lotecaHash[line][column];
    }
    toogleDozen(dozen){
        this.dezenasHash[dozen] = this.dezenasHash[dozen] ? false : true;
        if(!this.dezenasHash[dozen])
            delete this.dezenasHash[dozen];
    }
    isLotecaSelected(line, column){
        return this.lotecaHash[line][column];
    }
    lotecaTotal(type){
        var total =  0;
        for(var i = 0; i < 14;i++){
            if(this.lotecaLineText(i) == type)
                total++;
        }
        return total;
    }
    lotecaLineText(line){
        var selecteds = Object.values(this.lotecaHash[line]).filter((v)=>v).length;

        switch(selecteds){
            case 1:
                return "Seco";
            case 2:
                return "Duplo";
            case 3:
                return "Triplo";
            default:
                return "---";
        }
    }
    isSelected(dozen){
        return this.dezenasHash[dozen] ? true : false;
    }
    get valor(){
        var dezenas = this.quantitySelected;
        for (var i = 0; i < this.dadosLoteria.ConcursoFacaSeuJogo.Valores.length; i++) {
            if (this.dadosLoteria.ConcursoFacaSeuJogo.Valores[i].Dezenas == dezenas) {
                var valor = this.dadosLoteria.ConcursoFacaSeuJogo.Valores[i].ValorDeVenda;
                return valor;
            }
        }
        return 0;
    }
 
    get total(){
        return this.concursos * this.valor;
    }
    clean(){
        this.dezenasHash = {};
        if(this.dadosLoteria.CodigoLoteria == 9){
            this.timeDoCoracao = 1;
        }else{
            this.timeDoCoracao = 0;
        }
        for(var i = 0; i < 14;i++){
            this.lotecaHash[i] = { 0: false, 1: false, 2: false };
        }
    }
    async addToCart(){
        var cartao = this.formatedDozens;
        var error = null;
        var errors = await Cart.addGame(this.dadosLoteria.ConcursoFacaJogo.Loteria,
                                this.dadosLoteria.ConcursoFacaJogo.Numero,
                                cartao,
                                this.concursos,
                                this.recorrente,
                                this.timeDoCoracao || this.mesDeSorte,
                                this.fechamento,
                                this.canalDeVenda,
                                this.mesDeSorte);
        if(errors && errors.length)
        {
            error = errors[0];
        }
        return error;
    }
    async generate(dozens, quantity){
        return await Cart.gerarApostas(dozens,
                                       quantity,
                                       this.dadosLoteria.ConcursoFacaJogo.Loteria,
                                       this.dadosLoteria.ConcursoFacaJogo.Numero,
                                       this.concursos,
                                       this.recorrente);
    }
    hint(quantity){

        var notSelecteds = [];
        var selecteds = this.dezenasHash;
        var selectedCount = Object.keys(selecteds).length;
        if(selectedCount >= quantity){
            selecteds = {};
            selectedCount = 0;
            this.clean();
        }

        for(var i = 1; i <= this.dadosLoteria.ConcursoFacaJogo.Dezenas; i++){
            if(!selecteds[i])
                notSelecteds.push(i);
        }

        var randomInt = function (min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        };
        if(this.dadosLoteria.CodigoLoteria == 9){
            this.timeDoCoracao = randomInt(1, 80);
        }else if(this.dadosLoteria.CodigoLoteria == 10){
            this.mesDeSorte = randomInt(1, 12);
        }
        for (var i = 0; i < quantity - selectedCount; i++) {
            var index = randomInt(0, notSelecteds.length - 1);
            this.toogleDozen(notSelecteds[index]);
            notSelecteds.splice(index, 1);
        }
    }

    //Realiza validação do jogo
    get error(){
        
        //this.dadosLoteria.ConcursoFacaSeuJogo.JogoAntecipado
        if (this.dadosLoteria.CodigoLoteria == 7) {
            //lotogol
            if (this.dezenas.length < 10) {
                return 'Selecione todos os placares para completar a aposta.';
            }
        } else if (this.dadosLoteria.CodigoLoteria == 6) {
            //loteca
            var dozens = this.formatedDozens;
            if (dozens.length < 14) {
                //Mensagem desdobramentos
                var palpitesNaoMarcados = (14 - dozens.length);
                if (palpitesNaoMarcados > 1) {
                    return `Faltam ${palpitesNaoMarcados} palpites para completar o jogo!`;
                } else {
                    return `Falta ${palpitesNaoMarcados} palpite para completar o jogo!`;
                }
            } else {
                var totais = new Loteca(dozens).calculatedCard;
                if (totais.Duplo < 1 && totais.Triplo < 1) {
                    return 'Marque pelo menos um duplo';
                }
                if ((totais.Triplo == 0 && totais.Duplo > 9) || (totais.Triplo == 1 && totais.Duplo > 8) || (totais.Triplo == 2 && totais.Duplo > 6) ||
                    (totais.Triplo == 3 && totais.Duplo > 5) || (totais.Triplo == 4 && totais.Duplo > 3) || (totais.Triplo == 5 && totais.Duplo > 1) ||
                    (totais.Triplo == 6 && totais.Duplo > 0)) {
                    return 'Combinação de Duplos e/ou Triplos não permitida!';
                }
            }
        } else {
            //dezenas
            //valida se foi selecionado a quantidade obrigatoria de dezenas caso seja opcao de jogos
            /*if (Jogar.opcaoDeJogoSelecionada && Jogar.opcaoDeJogoSelecionada.dezenas != cartao.dezenasSelecionadas) {
                var error = 'Selecione {0} dezenas para realizar sua aposta'.format(Jogar.opcaoDeJogoSelecionada.dezenas);
                return;
            }*/
            //caso não tenha seleciona o minimo de dezenas
            if (this.dadosLoteria.ConcursoFacaJogo.MininoDezena > this.quantitySelected) {
                return `É necessário escolher no mínimo ${this.dadosLoteria.ConcursoFacaJogo.MininoDezena} dezenas para realizar seu jogo.`;
            }
            //verifica se precisa preencher time do coração
            if (this.timeDoCoracao && this.timeDoCoracao === "0") {
                return 'Você precisa selecionar um time do coração para montar seu jogo.';
            }
 
            //realiza tratamentos para apostas com otimização
            if (this.dadosLoteria.ConcursoFacaJogo.MaximoDeDezenasJogo < this.quantitySelected) {
                //quando existir otimização
                /*if ($("[for^=field_otimizar_]:visible").length ||
                    (Jogar.opcaoDeJogoSelecionada != null && (Jogar.opcaoDeJogoSelecionada.tipo == 'desdobramento' || Jogar.opcaoDeJogoSelecionada.tipo == 'fechamento'))) {
                    //verifica otimizações selecionadas
                    if (!cartao.desdobramento && !cartao.fechamento) {
                        ___frontend.dialog.show({ msg: 'Você precisa marcar uma opção de otimização.' });
                        return;
                    }
                } else {
                    //caso não seja possivel realizar esse jogo
                    ___frontend.dialog.show({ msg: 'Não existe otimização para este jogo.' });
                    return;
                }*/
                return `É necessário escolher no máximo ${this.dadosLoteria.ConcursoFacaJogo.MaximoDeDezenasJogo} dezenas para realizar seu jogo.`;
            }
        }
    }
}
 
export default Game;