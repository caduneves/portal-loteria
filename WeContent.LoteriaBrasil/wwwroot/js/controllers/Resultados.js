import Controller from './Controller';
import Loterias from '../api/Loterias';
import Loteria from '../models/Loteria';
import Resultados from '../api/Resultados';
import ModelResultado from '../models/Resultado';
import ServiceConteudo from '../api/Conteudo';

class ResultadosController extends Controller {
    constructor(){
        super();
        this.codigoLoteria = -1;
        this.concurso = null;
        this.loterias = [];
        this.loteria = {};
        this.resultados = [];
        this.resultadoSelected = [];
        this.$menu = $('.menu_resultados');
        this.isOpenDropFederal = null;
        this.sections = [];

    }
    async start() {

        this.codigoLoteria = parseInt(this.element.getAttribute('data-lottery'));
        this.concurso = this.element.getAttribute('data-concurso') || null;
        var loterias = await Loterias.listar();
        
        if( this.codigoLoteria ){
            this.loterias = loterias.map((loteria) => new Loteria(loteria));
            this.loteria = this.loterias.filter((loteria) => loteria.CodigoLoteria == this.codigoLoteria)[0];

            var resultados = await Resultados.loteria(this.codigoLoteria, this.concurso);
            var sections = await ServiceConteudo.get('results/'+this.loteria.class+'.json');

            console.log(sections);

            this.sections = sections;

        } else {
            var resultados = await Resultados.ultimos();
        }
        
        
        this.resultadoSelected = resultados.map((resultado) => new ModelResultado(resultado));
        
        console.log( this.resultadoSelected );

        // var resultados = await Resultados.ultimos();
        // this.resultados = resultados.map((resultado) => new ModelResultado(resultado));
        // this.resultadoSelected = this.takeLastResult(this.loteria);
        if( this.$menu.length ){ this.initMenu(); }

        setTimeout(() => { this.checkHash() }, 500);
    }

    takeLastResult(loteria){
        return (loteria.CodigoLoteria) ? this.resultados.filter((a) => a.Loteria == loteria.CodigoLoteria) : [];
    }

    initMenu() {
        
        var $container = $('.wrap-allresults-list');
        var $menu = $container.find('.menu_resultados');
        var $document = $(document);
        var $window = $(window);
        var offsetTop = $container.offset().top - 112;

        var checkMenu = function(){
            var offset = $window.scrollTop();
            var isFixed = (offset - 40) >= offsetTop;
            
            $menu[ isFixed ? 'addClass' : 'removeClass' ]('-fixed');
        };

        $window.on('scroll resize', function(e){
            checkMenu();
        });

        checkMenu();
    }

    goTo( target ) {
        console.log(target);
        $("html, body").animate({ scrollTop: $('#'+target).offset().top }, 1000);
    }

    checkHash(){
        if( window.location.hash ){
            this.goTo( window.location.hash.replace("#", "") );
        }
    }

    setDrop(index) {
        console.log(index);
        this.isOpenDropFederal = (this.isOpenDropFederal == index) ? null : index;
    }

    submitFilter(e) {
        var v = $(e.target).find('input').val();
        if(!v){ return; }

        window.location = '/' + this.loteria.class + '/resultados/' + v;
    }
}

export default ResultadosController;