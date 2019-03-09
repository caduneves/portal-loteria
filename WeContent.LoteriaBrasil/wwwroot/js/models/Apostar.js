import Loterias from '../api/Loterias';
import Loteria from '../models/Loteria';
import Bolao from '../models/Bolao';
import Game from '../models/Game';
import { msDate, meses } from "../api/util";
import Cart from '../api/Cart';
import Slider from './Slider';
class Apostar {
 
    constructor(isHome, component, codigoLoteria, especial) {
        
        this.codigoLoteria = codigoLoteria || 0;
        this.especial = !!especial;
        this.loterias = [];
        this.selected = {};
        this.lotterySelected = {};
        this.boloesSelected = [];
        this.countBoloes = 0;
        this.boloes = [];
        this.games = {};
        this.hintQty = 0;
        this.hintTotal = 1;
        this.isHome = isHome;
        this.sliderConcursos = 0;
        this.slider = new Slider(1, [1]);
        this.slider.onChange((concursos)=> this.changeConcursos(concursos))
        this.tabApostar = 0;
        this.selectedCard = null;
        this.component = component;
    }
 
  
    async start(){
        var loterias = await Loterias.listar();
 
        this.firstFederal = null;
        this.firstDiaDeSorte = null;
        this.secondDiaDeSorte = null;
        this.secondFederal = null;
        loterias = loterias.map((loteria) => new Loteria(loteria));
        this.loterias = loterias.filter((l)=> {
            if(!l.Especial || 
                !loterias.filter((a)=> !a.Especial &&
                                        a.codigoLoteria == l.CodigoLoteria).length){
                if(l.CodigoLoteria == 5 ){
                    if(this.firstFederal == null){
                        this.firstFederal = l;
                        return true;
                    }
                    this.secondFederal = l;
                    return false;
                }else if(l.CodigoLoteria == 10 ){
                    if(this.firstDiaDeSorte == null){
                        this.firstDiaDeSorte = l;
                        return true;
                    }
                    this.secondDiaDeSorte = l;
                    return false;
                }
                return true;
            }
            return false;
        });
 
        if(this.codigoLoteria){
            var first = this.loterias.filter((loteria) => loteria.hasFacaSeuJogo && loteria.CodigoLoteria == this.codigoLoteria && loteria.Especial == this.especial)[0];
            if (first){
                this.hintQty = first.ConcursoFacaJogo.MininoDezena;
                this.lotterySelected = first;
                this.selected = await Loterias.dadosAposta(first.CodigoLoteria, first.concurso.Numero, first.concurso.Especial);
            }
        }else{
            var first = this.loterias.filter((loteria) => loteria.hasFacaSeuJogo)[0];
            if (first){
                this.hintQty = first.ConcursoFacaJogo.MininoDezena;
                this.lotterySelected = first;
                this.selected = await Loterias.dadosAposta(first.CodigoLoteria, first.concurso.Numero, first.concurso.Especial);
            }
            for (var i in this.loterias) {
                Loterias.dadosAposta(this.loterias[i].CodigoLoteria, this.loterias[i].concurso.Numero, this.loterias[i].concurso.Especial);
            }
        }

        var boloes = await Loterias.boloes();
        this.boloes = boloes.map((bolao)=> new Bolao(bolao, this.component));

        this.boloesSelected = [];
        if(this.lotterySelected)
            this.reduceBoloes(this.lotterySelected);
    }
    async select(loteria, forceUpdate) {
        forceUpdate = forceUpdate || false;
        this.lotterySelected = loteria;
        this.selected = await Loterias.dadosAposta(loteria.CodigoLoteria, loteria.concurso.Numero, loteria.concurso.Especial, forceUpdate);
        if(this.selected && this.selected.ConcursoFacaSeuJogo){
            this.hintQty =  this.selected.ConcursoFacaSeuJogo.MininoDezena;
        }
        this.reduceBoloes(loteria);
        this.slider.valueList =  this.listTeimosinhas();
        this.slider.value = this.concursos();
    }
    toogleLoteca(loteria, line, column){
        this.game(loteria, 0).toogleLoteca(line, column);
        this.component.reload();
    }
    toogleDozen(loteria, dozen, gameID){
        this.game(loteria, gameID).toogleDozen(dozen);
        this.component.reload();
    }
    go(url){
        document.location.href = url;
    }
    meses(){
        return meses();
    }
    game(loteria, gameID){
        var key = this.getGameKey(loteria, gameID);
        return this.games[key];
    }
    getGameKey(loteria, gameID){
        var key = `${gameID}-${loteria.CodigoLoteria}-${loteria.Especial}`;
        if(!this.games[key])
            this.games[key] = new Game(loteria);
        return key;
    }
    hint(loteria, gameID){
        this.game(loteria, gameID).hint(this.hintQty);
        this.component.reload();
    }
    cleanGame(loteria, gameID){
        this.game(loteria, gameID).clean();
        this.component.reload();
    }
    showGameDozens(card){
        this.selectedCard = card;
    }
    closeSelectedCard(){
        this.selectedCard = null;
    }
    descricaoAposta(aposta){
        if(aposta.Recorrente){
            return "recorrente";
        }
        return `${aposta.Teimosinha.format("00")} ${(aposta.Teimosinha > 1 ? 'concursos' : 'concurso')}`;
    }
    totalApostas(){
        try{
            return this.selected.JogosNoCarrinho.map((a)=> a.ValorTotal).reduce((a,b)=> a+b);
        }catch(ex){
            return 0;
        }
    }
    async add(loteria, gameID){

        var game = this.game(loteria, gameID);
        game.recorrente = this.isRecorrente();
        var error = game.error;
        if(error){
            this.component.showAlert(error);
            return;
        }
        this.component.showLoading();
        var error  = await game.addToCart();
        
        if(error && error.Value){
            this.component.hideLoading();
            this.component.showAlert(error.Value);
            return;
        }
        if(gameID == 1 && this.hintTotal > 1){
            error = await game.generate(this.hintQty, this.hintTotal-1);
            if(error && error.Value){
                this.component.hideLoading();
                this.component.showAlert(error.Value);
                return;
            }
        }
        this.component.hideLoading();
        this.cleanGame(loteria, gameID);
        await this.select(loteria, true);
        var miniCart = this.component.component("MiniCart");
        if(miniCart){
            miniCart.refresh();
        }
    }
    expandBoloes(loteria){
        this.boloesSelected = this.takeBoloes(loteria);
        this.countBoloes = this.boloesSelected.length;
    }
    reduceBoloes(loteria){
        var boloes =  this.takeBoloes(loteria);
        if(boloes.length > 3)
            this.boloesSelected = boloes.slice(0, 3);
        else
            this.boloesSelected = boloes;
        this.countBoloes = boloes.length;
    }

    takeBoloes(loteria){
        return (loteria.ConcursoBolao) ? 
                this.boloes.filter((l) => l.CdConcurso ==  loteria.ConcursoBolao.Codigo)
                : [];
    }
    async deleteGame(index, codigoLoteria, numeroConcurso){
        this.component.showLoading();
        var result = await Cart.removeGameByIndex(index, codigoLoteria, numeroConcurso);
        if(!result || !result.Erros|| !result.Erros.length){
            await this.select(this.lotterySelected, true);
            var miniCart = this.component.component("MiniCart");
            if(miniCart){
                miniCart.refresh();
            }  
        }else{
            this.component.showAlert("Falha ao remover aposta tente novamente.");
        }
        this.component.hideLoading();
        
    }
    isSelected(loteria) {
        return loteria.CodigoLoteria == this.lotterySelected.CodigoLoteria && 
               loteria.Especial == this.lotterySelected.Especial;
    }
    isRecorrente(){
        if(!this.selected || !this.selected.JogosNoCarrinho || !this.selected.JogosNoCarrinho.length)
            return false;
        return this.selected.JogosNoCarrinho.filter((a)=> a.Recorrente).length >= 1;
    }
    concursos(){
        if(!this.selected || !this.selected.JogosNoCarrinho || !this.selected.JogosNoCarrinho.length)
            return 0;
        return this.selected.JogosNoCarrinho[0].Teimosinha;
    }

    selectTabApostar(tab){
        this.tabApostar = tab;
    }
    minTeimosinha(){
        return 1;
    }
    maxTeimosinha(){
        var superTeimosinha = (this.selected.Loteria.SuperTeimosinhas || [])[(this.selected.Loteria.SuperTeimosinhas || []).length-1];
        if(superTeimosinha)
            return superTeimosinha;
        return this.selected.Loteria.Teimosinhas[this.selected.Loteria.Teimosinhas.length-1];
    }
   
    async toogleRecorrente(){
        if(!this.selected)
            return false;
        
        var loteria = this.lotterySelected;
        if(!loteria)
            return false;

        this.component.showLoading();
        await Cart.updateTeimosinha(this.selected.Loteria.CodigoDaLoteria, this.selected.ConcursoFacaSeuJogo.Numero, this.concursos(), !this.isRecorrente());
        await this.select(loteria, true);
        var miniCart = this.component.component("MiniCart");
        if(miniCart){
            miniCart.refresh();
        }
        this.component.hideLoading();
    }
    stepsTeimosinhas(){
        return this.listTeimosinhas().length;
    }
    listTeimosinhas(){
        var list = [1];
        var teimosinhas = (this.selected.Loteria.Teimosinhas || []);
        for(var i in teimosinhas){
            list.push(teimosinhas[i]);
        }

        var superTeimosinhas = (this.selected.Loteria.SuperTeimosinhas || []);
        for(var i in superTeimosinhas){
            list.push(superTeimosinhas[i]);
        }
        return list;
    }
    sliderSideClass(index){
        var middle = this.listTeimosinhas().length / 2;
        if(!Number.isInteger(middle)){
            middle = parseInt(middle);
            middle++;
        }
        index++;
        if(index == 1)
            return "first";
        if(index == this.listTeimosinhas().length)
            return "last";
        if(index > middle)
            return "right";
        if(index < middle)
            return "left";
        return "center";
    }
    async changeConcursos(concursos){

        //this.sliderConcursos;
        //var concursos = this.listTeimosinhas()[this.sliderConcursos];

        if(!this.selected)
            return false;
        var loteria = this.loterias.filter((l) => l.CodigoLoteria == this.selected.Loteria.CodigoDaLoteria && l.concurso.Numero == this.selected.ConcursoFacaSeuJogo.Numero)[0];
        if(!loteria)
            return false;
        this.component.showLoading();
        await Cart.updateTeimosinha(this.selected.Loteria.CodigoDaLoteria, this.selected.ConcursoFacaSeuJogo.Numero, concursos, false);
        await this.select(loteria, true);
        var miniCart = this.component.component("MiniCart");
        if(miniCart){
            miniCart.refresh();
        }
        this.component.hideLoading();
    }

}
export default Apostar;