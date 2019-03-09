using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Concurrent;
using WeContent.LoteriaBrasil.Models;
namespace WeContent.LoteriaBrasil.Controllers
{
    public class CacheController : Controller
    {
       
        public IActionResult Clean(string cacheKey)
        {
            if(string.IsNullOrWhiteSpace(cacheKey)){
                return NotFound();
            }
            CacheManager.Clean(cacheKey);
            return Content("true", "application/json", System.Text.Encoding.UTF8);
        }
        public IActionResult Index(string cacheKey, int expiration, string query)
        {
            if(string.IsNullOrWhiteSpace(cacheKey)){
                return NotFound();
            }
            var data = CacheManager.Execute(cacheKey, expiration, query);
            //return data
            return Content(data, "application/json", System.Text.Encoding.UTF8);
        }
    }
}