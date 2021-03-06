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
    public class LoteriaController : Controller
    {
        [OrigemMidia]
        public IActionResult Index()
        {
            return View();
        }
        public IActionResult PremiosNoSite(string nomeLoteria){

             int lottery = -1;
             nomeLoteria = (nomeLoteria ?? string.Empty).ToLower().Trim();
             switch (nomeLoteria) {
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
            return View("~/Views/Premiacoes/Index.cshtml", lottery);
        }
        [OrigemMidia]
        public IActionResult Detail(string nomeLoteria)
        {
             int lottery = -1;
             nomeLoteria = (nomeLoteria ?? string.Empty).ToLower().Trim();
             switch (nomeLoteria) {
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

            return View(model: lottery);
        }
    }
}
