import "babel-polyfill";
import VueTheMask from 'vue-the-mask';
import money from 'v-money';
import * as controllers from './controllers/components';
import Controller from "./controllers/Controller";
import Banners from './models/Banners';

class Program{
    static async main(){

        await Banners.applySections();

        window.Vue = Vue;
        Vue.use(VueTheMask);
        Vue.use(money, {precision: 4})
        var promiseList = [];
        document.querySelectorAll("[data-vue]").forEach((el)=>{
            var controllerName = el.getAttribute("data-vue");
            console.log(controllerName);
            var controller = new controllers[controllerName](el);

            Program.instances[controllerName] = controller;
            controller.component = function(name){
                return Program.instances[name];
            };
            el.setAttribute("id",  el.getAttribute("id") || Program.guid());
            controller.element = el;
            try{
                promiseList.push(controller.onload(new Vue({
                    el: "#" + el.getAttribute("id"),
                    data: controller,
                    methods: Program.bindMethods(controller)
                })));
            }catch(ex){
                console.error("Vue loading error", ex);
            }
        });
        //remove modals and loading hidden class
        document.querySelectorAll(".message.hidden, .loading.hidden").forEach((node)=> node.classList.remove("hidden"));
        document.querySelector("body").classList.remove("invisible");
        
    }

    static bindMethods(instance){
        var methods = {};
        var functions = Object.getOwnPropertyNames(instance.constructor.prototype);
        for(var i in functions){
            var functionName =  functions[i];
            if(typeof instance[functionName] == "function" && functionName != "constructor"){
                methods[functionName] = instance[functionName].bind(instance);
            }
        }
        return methods;
    }
    static guid(){
        function s4() {
          return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return "vue-" + s4() + s4() + s4()  + s4() + s4() + s4() + s4() + s4();
    }
}
Program.instances = {};
window.VueProgram = Program;
window.onload = () => Program.main();
