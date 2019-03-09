using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SorteOnline.Web.Infrastructure.ActionFilter;
using WeContent.LoteriaBrasil.Models;

namespace WeContent.LoteriaBrasil.Controllers
{
    public class NoticiasController : Controller
    {
        [OrigemMidia]
        public IActionResult Index()
        {
            return View(model: new  NoticiaViewModel(){
                Loteria = string.Empty,
                Sku = -1
            });
        }
        [OrigemMidia]
        public IActionResult Individual(string slugLoteria)
        {
            int lottery = -1;
            slugLoteria = (slugLoteria ?? string.Empty).ToLower().Trim();
             switch (slugLoteria) {
                case "mega":
                case "megasena":
                case "mega-sena":
                    lottery = 1;
                    break;
                case "dupla":
                case "duplasena":
                case "dupla-sena":
                    lottery = 2;
                    break;
                case "lotomania":
                    lottery = 3;
                    break;
                case "quina":
                    lottery = 4;
                    break;
                case "federal":
                case "loteria-federal":
                    lottery = 5;
                    break;
                case "loteca":
                    lottery = 6;
                    break;
                case "lotogol":
                    lottery = 7;
                    break;
                case "lotofacil":
                    lottery = 8;
                    break;
                case "timemania":
                    lottery = 9;
                    break;
                case "dia-de-sorte":
                case "diadesorte":
                    lottery = 10;
                    break;
                default:
                    lottery = -1;
                    break;
            }
            if(lottery == -1)
                return NotFound();

            return View("Index", new NoticiaViewModel(){
                Loteria = slugLoteria,
                Sku = lottery
            });
        }
        [OrigemMidia]
        public IActionResult Detalhe(string slugLoteria, string slugTitle, int? sku = null)
        {
            
            var data = CacheManager.Execute($"Noticias#detalhes({sku})", 
                                            60,
                                            string.Format("{0}/ConteudoService.svc/noticias/conteudo?t={1}&cc={2}",
                                                          CacheManager.Configuration.sorteOnlineAPI, 
                                                          CacheManager.GenericToken, 
                                                          sku), 
                                            false);
            dynamic destaque = Newtonsoft.Json.JsonConvert.DeserializeObject(data);
            return View(model: new NoticiaViewModel(){
                Loteria = slugLoteria,
                SlugTitle = slugTitle,
                Sku = sku,
                Titulo = destaque.Titulo.ToString(),
                Imagem = destaque.Imagem.ToString()

            });
        }
    }
}
