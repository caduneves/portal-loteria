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
    public class EstatisticasController : Controller
    {
        [OrigemMidia]
        public IActionResult Index(string nomeLoteria)
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
        public IActionResult Detail(string nomeLoteria, string slugEstatisticas)
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
            if(lottery == -1){ return NotFound(); }

            var Data = new List<dynamic>();

            ViewBag.slugEstatisticas = slugEstatisticas;

            switch( slugEstatisticas )
            {
                case "maiores-premios":
                    ViewBag.sectionName = "Maiores Prêmios";
                    break;
                case "mais-sorteados":
                case "mais-sorteadas":
                case "numeros-mais-sorteados":
                    ViewBag.slugEstatisticas = "numeros-mais-sorteados";
                    ViewBag.sectionName = "Números mais Sorteados";
                    break;
                case "dezenas-mais-atrasadas":
                case "numeros-mais-atrasados":
                    ViewBag.slugEstatisticas = "dezenas-mais-atrasadas";
                    ViewBag.sectionName = "Números mais Atrasados";
                    break;
                case "soma-das-dezenas":
                    ViewBag.sectionName = "Soma das Dezenas";
                    break;
                case "premios-estado":
                    ViewBag.sectionName = "Prêmios por Estado";
                    break;
                case "linhas-e-colunas":
                    ViewBag.sectionName = "Linhas e Colunas";
                    break;
                case "pares-e-impares":
                    ViewBag.sectionName = "Pares e Ímpares";
                    break;
                case "placares-mais-frequentes":
                    ViewBag.sectionName = "Placares mais Frequentes";
                    break;
                case "soma-de-gols-por-concurso":
                    ViewBag.sectionName = "Soma de Gols por Concurso";
                    break;
                case "quantidade-de-gols-por-concurso":
                    ViewBag.sectionName = "Gols no Mesmo Concurso";
                    break;
                case "colunas-por-concursos":
                    ViewBag.sectionName = "Quantidade de Colunas seguidas por Concurso";
                    break;
                case "colunas-seguidas-por-concursos":
                    ViewBag.sectionName = "Colunas Seguidas por Concurso";
                    break;
                default:
                    ViewBag.sectionName = "Não encontrado";
                    break;
            }

            return View(model: lottery);
        }
    }
}
