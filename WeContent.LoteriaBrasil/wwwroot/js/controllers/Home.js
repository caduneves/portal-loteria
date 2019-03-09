import Controller from './Controller';
import Loterias from '../api/Loterias';
import Loteria from '../models/Loteria';
import Resultados from '../api/Resultados';
import ModelResultado from '../models/Resultado';
import { msDate } from '../api/util';


class Home extends Controller{

    constructor(){
        super();
        this.loterias = [];
        this.ultimosResultados = [];
    }
    
    async start(){
        //vue instance start here
        //this.vm.$watch("message", () => console.log("updated", this.message));
        this.loadHomeCarousel();

        this.initSlideComoApostar();

        var ultimosResultados = await Resultados.ultimos();
        this.ultimosResultados = ultimosResultados.map((resultado) => new ModelResultado(resultado));

        this.loadBannerLoterias();

        setInterval(()=> this.reload(), 500);
    }
    async loadBannerLoterias(){

        var loterias = await Loterias.listar();
        this.loterias = loterias.map((loteria) => new Loteria(loteria));
        this.initSlideLoteria();
    }
    goToLanding(lottery){
        document.location.href = lottery.url;
    }

    timer(lottery){
        try{
            var diff = Time.fromDateDiff(msDate(lottery.DataDoSorteio), Date.now());

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
    loadHomeCarousel(){
        Vue.nextTick(function(){
            $(function(){
                $('#home-carousel').carousel();
            });
         });
    }
    initSlideLoteria(){
        Vue.nextTick(function(){
            $('.owl-carousel-loterias').owlCarousel({
                loop: true,
                margin: 0,
                responsiveClass: true,
                responsive: {
                    0: {
                        items: 1,
                        nav: true
                    },
                    600: {
                        items: 1,
                        nav: false
                    },
                    1000: {
                        items: 4,
                        nav: true,
                        loop: false
                    }
                }
            });
        });
    }
    initSlideComoApostar() {
       
        $('.owl-carousel-comoapostar').owlCarousel({
            loop: true,
            margin: 0,
            responsiveClass: true,
            responsive: {
                0:{
                    items: 1,
                    nav: true
                },
                500: {
                    items: 2,
                    nav: false
                },
                768: {
                    items: 3,
                    nav: false
                },
                1000: {
                    items: 5,
                    nav: true,
                    loop: false
                }
            }
        });
    }

}


export default Home;