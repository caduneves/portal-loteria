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
    public class CreditoController : Controller
    {
        [OrigemMidia]
        public IActionResult Index()
        {
            return View();
        }
        [OrigemMidia]
        public IActionResult Comprar()
        {
            return View("Index");
        }
    }
}
