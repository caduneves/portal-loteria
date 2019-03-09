using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Concurrent;
using WeContent.LoteriaBrasil.Models;
using System.Net.Http.Headers;
using System.IO;
using System.Text;

namespace WeContent.LoteriaBrasil.Controllers
{
    public class RequestController : Controller
    {
        public async Task<IActionResult> Index(string query)
        {

            var httpClient = new System.Net.Http.HttpClient();
                 httpClient.DefaultRequestHeaders
                           .Accept
                           .Add(new MediaTypeWithQualityHeaderValue("application/json"));
            query = CryptoHelper.Decrypt(query);
            if(!query.StartsWith("http")){
                query = $"{this.Request.Scheme}://{this.Request.Host}{this.Request.PathBase}" + query;
            }
            string response =  await httpClient.GetStringAsync(query);
            //return data
            return Content(response, "application/json", System.Text.Encoding.UTF8);
        }
        [HttpPost]
        public async Task<IActionResult> Index(string query,  [FromBody]string data)
        {
            var httpClient = new System.Net.Http.HttpClient();
            httpClient.DefaultRequestHeaders
                      .Accept
                      .Add(new MediaTypeWithQualityHeaderValue("application/json"));

            query = CryptoHelper.Decrypt(query);
            if(!query.StartsWith("http")){
                query = $"{this.Request.Scheme}://{this.Request.Host}{this.Request.PathBase}" + query;
            }
            data = CryptoHelper.Decrypt(data);
            var postResponse =  await httpClient.PostAsync(query, new JsonContent(data));
            var response = await postResponse.Content.ReadAsStringAsync();
            //return data
            return Content(response, "application/json", System.Text.Encoding.UTF8);
        }
    }
}