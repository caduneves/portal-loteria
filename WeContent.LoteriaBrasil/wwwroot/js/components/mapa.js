"use strict";

var APP = APP || {};

APP.Mapa = (function($){
    var obj = {
        actual: {},
        data: [],
        estados: [
            { 'AC' : 'Acre' },
            { 'AL' : 'Alagoas' },
            { 'AP' : 'Amapá' },
            { 'AM' : 'Amazonas' },
            { 'BA' : 'Bahia' },
            { 'CE' : 'Ceará' },
            { 'DF' : 'Distrito Federal' },
            { 'ES' : 'Espírito Santo' },
            { 'GO' : 'Goiás' },
            { 'MA' : 'Maranhão' },
            { 'MT' : 'Mato Grosso' },
            { 'MS' : 'Mato Grosso do Sul' },
            { 'MG' : 'Minas Gerais' },
            { 'PA' : 'Pará' },
            { 'PB' : 'Paraíba' },
            { 'PR' : 'Paraná' },
            { 'PE' : 'Pernambuco' },
            { 'PI' : 'Piauí' },
            { 'RJ' : 'Rio de Janeiro' },
            { 'RN' : 'Rio Grande do Norte' },
            { 'RS' : 'Rio Grande do Sul' },
            { 'RO' : 'Rondônia' },
            { 'RR' : 'Roraima' },
            { 'SC' : 'Santa Catarina' },
            { 'SP' : 'São Paulo' },
            { 'SE' : 'Sergipe' },
            { 'TO' : 'Tocantins' }
        ]
    };

    obj.GetUfByName = function(name){
        var r = obj.estados.filter(function(a, b){
            return (Object.values(a)[0] == name);
        });

        return (r.length ? Object.keys(r[0])[0] : "SP");
    }

    obj.GetNameByUf = function(uf){
        var r = obj.estados.filter(function(a, b){
            return (Object.keys(a)[0] == uf);
        });

        return (r.length ? Object.values(r[0])[0] : "SP");
    }

    obj.SetInfo = function(name) {
        var name = name || "São Paulo";
        var uf = obj.GetUfByName(name);

        console.log(obj.data);

        var r = obj.data.filter(function(a, b){
            return (a.Estado == uf);
        });

        if(!r.length){
            r = [{
                QuantidadeDeGanhadores: 0,
                Valor: 0,
                PercentualGanhadores: 0,
                PercentualValor: 0,
                PercentualValor: 0
            }]
        }

        obj.$btnUf.filter('[name="'+name+'"]').addClass('-active');

        obj.$floatInfo.find('.mapa-ajax-header').text(name);

        obj.$floatInfo.find('.quantidade.ganhadores').text(r[0].QuantidadeDeGanhadores);
        obj.$floatInfo.find('.quantidade.premios').text(r[0].Valor.format("c"));

        obj.$floatInfo.find('.porcentagem.ganhadores').text(r[0].PercentualGanhadores+"%");
        obj.$floatInfo.find('.porcentagem.premios').text(r[0].PercentualValor+"%");

        obj.$floatInfo.find('.barra.ganhadores div').css({ width: r[0].PercentualGanhadores+'%'});
        obj.$floatInfo.find('.barra.premios div').css({ width: r[0].PercentualValor+'%'});
    };

    obj.Attach = function(){

        obj.$btnUf.on('click', function(e){
            e.preventDefault();
            obj.$btnUf.removeClass('-active');
            obj.SetInfo($(this).attr("name"));
            obj.$floatInfo.trigger(':toggle');
            return false;
        });

        obj.$floatInfo.on(':toggle', function(e){
            obj.$floatInfo.toggleClass('-active');
        });

        obj.$btnClose.on('click touchend', function(e){
            e.preventDefault();
            obj.$floatInfo.trigger(':toggle');
            return false;
        })

        obj.$el.on(':loaded', function(e){
            obj.$el.addClass('-loaded');
            obj.SetInfo();
        });

        obj.GetInfo();
    }

    obj.GetInfo = function(){
        var params = {
            l : obj.$el.attr("data-loteria"), //Código Loteria
            o : (obj.$el.attr("data-especial") == "true" ? 4 : 1) //Especial
        };

        $.ajax({
            url: 'https://www.mobilefirst.sorteonline.com.br/JogoService.svc/estatistica/premiacaoEstado',
            type: 'GET',
            data: params,
        })
        .done(function(res) {
            obj.data = res;
            obj.$el.trigger(":loaded");
        })
        .fail(function(res) {
            obj.$el.trigger(":error");
        });

        $('.normalize-uf').each(function(i, e) {
            var uf = $(e).text();
            $(e).text( obj.GetNameByUf(uf) );
        });
        
        $('.normalize-money').each(function(i, e) {
            var v = Number($(e).text().replace(",", "."));
            $(e).text( APP.Helpers.ValorAproximado(v) );
        });
        
    };

    obj.Init = function(){
        obj.$el = $('#map');
        obj.$map = obj.$el.find('#svg-map');
        obj.$floatInfo = obj.$el.find('.mapa-ajax-container');
        obj.$btnClose = obj.$floatInfo.find('.btn-close');
        obj.$btnUf = obj.$map.find('a');



        obj.Attach();
    };

    return obj;
})(jQuery || $);


$('#header .btn-menu, .mobile-menu-shadow').on('click touchend', function(e){
    e.preventDefault();
    $('html').toggleClass('mobi-menu-active');
    $('#header .btn-menu .fa').toggleClass('fa-bars fa-times');
})