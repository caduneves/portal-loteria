using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Net.Http.Headers;
using WebMarkupMin.AspNetCore2;
namespace WeContent.LoteriaBrasil
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc(options =>
            {
                options.InputFormatters.Add(new TextPlainInputFormatter());
            });

            // Adds a default in-memory implementation of IDistributedCache.
            services.AddDistributedMemoryCache();

            services.AddSession(options =>
            {
                options.IdleTimeout = TimeSpan.FromMinutes(30);
                options.Cookie.HttpOnly = true;
            });

            services.AddWebMarkupMin( options =>
            {
                options.AllowMinificationInDevelopmentEnvironment = true;
                options.AllowCompressionInDevelopmentEnvironment = true;
            }).AddHtmlMinification( options =>
            {
                options.MinificationSettings.RemoveRedundantAttributes = true;
                options.MinificationSettings.RemoveHttpProtocolFromAttributes = true;
                options.MinificationSettings.RemoveHttpsProtocolFromAttributes = true;
            })
            .AddHttpCompression();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseBrowserLink();
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseWebMarkupMin();

            app.UseStaticFiles(new StaticFileOptions  
            {
                OnPrepareResponse = ctx =>
                {
                    const int durationInSeconds = 60 * 60 * 24 * 365;
                    var cacheConfig =  "public,max-age=" + durationInSeconds;
                    if(!ctx.Context.Response.Headers.TryAdd(HeaderNames.CacheControl,cacheConfig)){
                        ctx.Context.Response.Headers[HeaderNames.CacheControl] = cacheConfig;
                    }
                       
                }
            });
            
            app.UseSession();
        
            app.UseMvc(routes =>
            { 
                routes.MapRoute(
                    name: "resultados",
                    template: "resultados",
                    defaults: new{
                        controller = "Resultados",
                        action = "Index"
                    }
                );

               routes.MapRoute(
                    name: "resultados-individual",
                    template: "{slugLoteria}/resultados/{concurso?}",
                    defaults: new{
                        controller = "Resultados",
                        action = "Detail"
                    }
                );

                routes.MapRoute(
                    name: "premiacoes",
                    template: "premiacoes",
                    defaults: new{
                        controller = "Premiacoes",
                        action = "Index"
                    }
                );
                routes.MapRoute(
                    name: "premiacoes_individuais",
                    template: "{nomeLoteria}/premios-no-site",
                    defaults: new{
                        controller = "Loteria",
                        action = "PremiosNoSite"
                    }
                );
                routes.MapRoute(
                    name: "quem-somoss",
                    template: "quem-somos",
                    defaults: new{
                        controller = "Institucional",
                        action = "QuemSomos"
                    }
                );
                routes.MapRoute(
                    name: "como-funciona",
                    template: "como-funciona",
                    defaults: new{
                        controller = "Institucional",
                        action = "ComoFunciona"
                    }
                );

                 routes.MapRoute(
                    name: "politicadeprivacidade",
                    template: "institucional/politicadeprivacidade",
                    defaults: new{
                        controller = "Institucional",
                        action = "PoliticaDePrivacidade"
                    }
                );
                routes.MapRoute(
                    name: "termosdeuso",
                    template: "institucional/termosdeuso",
                    defaults: new{
                        controller = "Institucional",
                        action = "TermosDeUso"
                    }
                );
                 routes.MapRoute(
                    name: "institucional_indique",
                    template: "newsletter/indique",
                    defaults: new{
                        controller = "Institucional",
                        action = "Indique"
                    }
                );
                 routes.MapRoute(
                    name: "atendimento",
                    template: "institucional/atendimento",
                    defaults: new{
                        controller = "Institucional",
                        action = "Atendimento"
                    }
                );
                 routes.MapRoute(
                    name: "duvidas",
                    template: "institucional/duvidas",
                    defaults: new{
                        controller = "Institucional",
                        action = "Duvidas"
                    }
                );
                routes.MapRoute(
                    name: "sobre-sorteios",
                    template: "sobre-sorteios",
                    defaults: new{
                        controller = "Institucional",
                        action = "DiasSorteio"
                    }
                );
                routes.MapRoute(
                    name: "como-pagar",
                    template: "como-pagar",
                    defaults: new{
                        controller = "Institucional",
                        action = "ComoPagar"
                    }
                );
                 routes.MapRoute(
                    name: "carrinho",
                    template: "carrinho",
                    defaults: new {
                        controller = "Carrinho",
                        action = "Index"
                    });
                routes.MapRoute(
                    name: "depoimentos",
                    template: "depoimentos",
                    defaults: new {
                        controller = "Depoimentos",
                        action = "Index"
                    });
                routes.MapRoute(
                    name: "noticias-individual",
                    template: "noticias/{slugLoteria}",
                    defaults: new {
                        controller = "Noticias",
                        action = "Individual"
                    });
                routes.MapRoute(
                    name: "noticias-detalhes",
                    template: "noticias/{slugLoteria}/{slugTitle}",
                    defaults: new {
                        controller = "Noticias",
                        action = "Detalhe"
                    });
                    routes.MapRoute(
                    name: "noticias",
                    template: "noticias",
                    defaults: new {
                        controller = "Noticias",
                        action = "Index"
                    });
                routes.MapRoute(
                    name: "cache",
                    template: "Cache",
                    defaults: new {
                        controller = "Cache",
                        action = "Index"
                    });
                routes.MapRoute(
                    name: "loterias",
                    template: "loterias",
                    defaults:  new { 
                        controller = "Loteria",
                        action = "Index" 
                    });

                routes.MapRoute(
                    name: "loterias-detalhe",
                    template: "{nomeLoteria}",
                    defaults:  new { 
                        controller = "Loteria",
                        action = "Detail" 
                    });

                routes.MapRoute(
                    name: "estatisticas-principal",
                    template: "{nomeLoteria}/estatisticas",
                    defaults: new {
                        controller = "Estatisticas",
                        action = "Index"
                    });

                routes.MapRoute(
                    name: "estatisticas-detalhe",
                    template: "{nomeLoteria}/estatisticas/{slugEstatisticas}",
                    defaults: new {
                        controller = "Estatisticas",
                        action = "Detail"
                    });


                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
                
            });
        }
    }
}
