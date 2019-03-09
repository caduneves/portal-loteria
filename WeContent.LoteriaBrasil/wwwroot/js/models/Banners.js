import ServiceConteudo from '../api/Conteudo';
import { getMidia } from '../api/util';
import { midiaDefault } from '../config.json'
class Banners{


    static async applySections(){
        
        var sections = await Banners.sections();
        
        var urlTypes = ['url', 'url-tablet', 'url-smartphone'];
        var imageTypes = ['image', 'image-tablet', 'image-smartphone'];
        var classTypes = ['hidden-md hidden-sm hidden-xs', 'hidden-lg hidden-xs', 'hidden-lg hidden-md hidden-sm'];

        for(var area in sections){
            var banners = sections[area];
            var carouselItemIndex = 0;
            banners.forEach(banner=>{
                if(area == 'carousel'){
                    var wrapper = $(`<div class='item ${carouselItemIndex == 0? 'active' : ''}'><div class='carousel-caption'></div></div>`);
                    for(var type  = 0; type < 3; type++){
                        
                            var element = $(`<div class="${classTypes[type]}"></div>`);
                            element.attr("style", `background-image: url(${banner[imageTypes[type]]})`);
                            wrapper.append(element);
                            wrapper.attr("data-href", banner[urlTypes[type]]);
                            wrapper.click(function(){
                                document.location.href = $(this).attr("data-href").replace("//","/");
                            });
                            $(`#${area}`).append(wrapper);
                    }
                    $(`#${area}-indicators`).append($(`<li data-target="#home-carousel" data-slide-to="${carouselItemIndex}" ${carouselItemIndex == 0? 'class="active"' : ''}></li>`));
                    carouselItemIndex++;
                }else{
                    for(var type  = 0; type < 3; type++){
                        
                        var element = $(`<div class="${classTypes[type]}"></div>`);
                        element.attr("data-href", banner[urlTypes[type]]);
                        element.click(function(){
                            document.location.href = $(this).attr("data-href").replace("//","/");
                        });
                        element.attr("style", `background-image: url(${banner[imageTypes[type]]})`);
                        $(`#${area}`).append(element);
                    }
                }
            });
        }
    }
    //busca banners válidos para a rota atual
    static async sections(){
        var midia = parseInt(getMidia() || midiaDefault);
        var sections = await ServiceConteudo.get('banner.json');

        var validSections = [];
        var areas = {};
        var now = Date.now();
        
        for(var k in sections){
           var section = sections[k];
           var routes = section.routes;

            var routeLower = document.location.pathname.toLowerCase();
            
            if (routeLower.length > 1 && routeLower.indexOf("/") == routeLower.length - 1)
                routeLower = routeLower.substr(0, routeLower.length - 1);

            //filtra banners ativos
            var banners = section.banners.filter((b)=> now >= new Date(b.start) && now <= new Date(b.end));
            //caso nao tenha banners pula
            if(!banners.length){
                continue;
            }
            for (var i = 0; i < routes.length; i++) {
                //se for a midia padrão usa midia do banner
                if(midia == midiaDefault){
                    banners = banners.map((b)=>{
                        //clone
                        b = JSON.parse(JSON.stringify(b));
                        var urls = ['url', 'url-tablet', 'url-smartphone'];
                        //adiciona parametro de midia nas urls
                        for(var j in urls){
                            var url = b[urls[j]];
                            var newMidia = parseInt(b.midia);
                            if(url.indexOf('?') == -1){
                                url += `${url}?id=${newMidia}`;
                            }else{
                                url += `${url}&id=${newMidia}`;
                            }
                            b[urls[j]] = url;
                        }
                        return b;
                    });
                }
                //se for uma rota válida associa a area especifica o banner
                if (routes[i].toLowerCase() == routeLower) {
                    areas[section.area] = banners;
                } else {
                    var valid = true;
                    var parts = routes[i].toLowerCase().split("/");
                    var partsB = routeLower.split("/");
                    for (var j = 0; j < parts.length; j++) {
                        if (parts[j] != partsB[j] && parts[j] != "*") {
                            valid = false;
                            break;
                        }
                    }
                    if (valid){
                        areas[section.area] = banners;
                    }
                }
            }
        }
        return areas;
    }
}
export default Banners;