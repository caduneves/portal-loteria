import Controller from './Controller';
import Resultados from '../api/Resultados';
import ModelResultado from '../models/Resultado';

class BannerResultados extends Controller{

    constructor(){
        super();
        this.data = [];
    }
    
    async start(){

        var data = await Resultados.ultimos();
        this.data = data.map((resultado) => new ModelResultado(resultado));

        setTimeout(()=> this.initSlideResultados(), 500);
    }
    
    initSlideResultados() {

        console.log("Init slider resultados");

        $('.owl-carousel-resultados').owlCarousel({
            loop: true,
            margin: 0,
            responsiveClass: true,
            responsive: {
                0: {
                    items: 1,
                    nav: true
                },
                600: {
                    items: 2,
                    nav: false
                },
                1000: {
                    items: 4,
                    nav: true,
                    loop: false
                }
            }
        });
    }
}


export default BannerResultados;