using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SorteOnline.Web.Infrastructure.ActionFilter;
using WeContent.LoteriaBrasil.Models;

namespace WeContent.LoteriaBrasil.Controllers
{
    public class UsuarioController : Controller
    {
        [OrigemMidia]
        public IActionResult Login()
        {
            return View();
        }

        public async Task<bool> VerifyReCaptcha(string reCaptchaToken){
            byte[] lastSessionValue;
            if(this.HttpContext.Session.TryGetValue("Recaptcha-"+reCaptchaToken, out lastSessionValue)){
                return lastSessionValue[0] == 1;
            }
            
            var remoteIpAddress = this.HttpContext.Connection.RemoteIpAddress.ToString();
            if(remoteIpAddress == "::1")
            {
                remoteIpAddress = "127.0.0.1";
            }

            var httpClient = new System.Net.Http.HttpClient();

            Dictionary<string, string> values = new Dictionary<string, string>(){
                { "remoteip", remoteIpAddress },
                { "secret", "6LeBAF8UAAAAAKHC3LjyqS--y6eWPNJyC-Uhq5zl" },
                { "response", reCaptchaToken }
            };
            
            httpClient.DefaultRequestHeaders.Accept
                                        .Add(new MediaTypeWithQualityHeaderValue("application/json"));
            var response = await httpClient.PostAsync("https://www.google.com/recaptcha/api/siteverify", new FormDataContent(values));

            
            string jsonStringResponse = await response.Content.ReadAsStringAsync();
            dynamic jsonResponse = Newtonsoft.Json.Linq.JObject.Parse(jsonStringResponse);
            var success = (bool)jsonResponse.success.Value;
            this.HttpContext.Session.Set("Recaptcha-"+reCaptchaToken, new byte[]{ (byte)(success ?  1 : 0) });
            return success;
        }
        [HttpPost]
        public async Task<IActionResult> CadastroParcial([FromBody] CadastrarModel request)
        {
            var success = await VerifyReCaptcha(request.reCaptchaToken);
            if(!success){
              return Content("{ \"Erros\": [ { \"Value\" : \"Falha na autenticação\", \"Key\": \"0\"  } ] }", "application/json");
            }
            var httpClient = new System.Net.Http.HttpClient();
            httpClient.DefaultRequestHeaders.Accept
                                        .Add(new MediaTypeWithQualityHeaderValue("application/json"));
            var response = await httpClient.PostAsync(string.Format("{0}/ContaService.svc/cadastro-parcial", 
                                                                    CacheManager.Configuration.sorteOnlineAPI),
                                                                    new JsonContent(request.dadosCadastro));

            string jsonStringResponse = await response.Content.ReadAsStringAsync();
            return Content(jsonStringResponse, "application/json");
        }
        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginModel request)
        {
            var success = await VerifyReCaptcha(request.reCaptchaToken);
            if(!success){
              return Content("{ \"Erros\": [ { \"Value\" : \"Falha na autenticação\", \"Key\": \"0\"  } ] }", "application/json");
            }
            var loginResponse  = new System.Net.WebClient().DownloadString(string.Format("{0}/ContaService.svc/login?e={1}&t={2}&s={3}&codigoSite={4}", 
                                                                        CacheManager.Configuration.sorteOnlineAPI,
                                                                        WebUtility.UrlEncode(request.email),
                                                                        WebUtility.UrlEncode(request.telefone),
                                                                        WebUtility.UrlEncode(request.password),
                                                                        CacheManager.Configuration.codigoSite));
            return Content(loginResponse, "application/json");
        }
        [OrigemMidia]
        public IActionResult RedefinirSenha()
        {
            return View();
        }
        [OrigemMidia]
        public IActionResult Cadastrado()
        {
            return View();
        }
        [OrigemMidia]
        public IActionResult Cadastrar()
        {
            return View();
        }
        [OrigemMidia]
        public IActionResult Extrato()
        {
            return View();
        }
    }
}
