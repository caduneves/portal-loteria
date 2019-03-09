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
    public class InstitucionalController : Controller
    {
        [OrigemMidia]
        public IActionResult ComoPagar()
        {
            return View();
        }
        [OrigemMidia]
        public IActionResult DiasSorteio()
        {
            return View();
        }
        [OrigemMidia]
         public IActionResult QuemSomos()
        {
            return View();
        }
        [OrigemMidia]
        public IActionResult TermosDeUso()
        {
            return View();
        }
        [OrigemMidia]
        public IActionResult PoliticaDePrivacidade()
        {
            return View();
        }
        [OrigemMidia]
        public IActionResult Atendimento()
        {
            return View();
        }
        [OrigemMidia]
        public IActionResult Indique()
        {
            return View();
        }
        [OrigemMidia]
        public IActionResult Duvidas()
        {
            return View();
        }
        public IActionResult ComoFunciona()
        {
            return View();
        }

    }
}
