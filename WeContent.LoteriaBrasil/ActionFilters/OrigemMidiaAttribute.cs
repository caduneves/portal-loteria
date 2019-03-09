using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using Microsoft.AspNetCore.Mvc.Filters;
using WeContent.LoteriaBrasil.Models;

namespace SorteOnline.Web.Infrastructure.ActionFilter
{
    public class OrigemMidiaAttribute : ActionFilterAttribute
    {
        private void CookieQueryString(Microsoft.AspNetCore.Http.HttpContext context, string name)
        {
            var value = context.Request.Query[name].ToString();
            var cookie = context.Request.Cookies[name];

            if (cookie == null || !string.IsNullOrWhiteSpace(value))
            {
                 context.Response.Cookies.Delete(name);
                context.Response.Cookies.Append(name, value, new Microsoft.AspNetCore.Http.CookieOptions(){
                    Expires = DateTime.Now.AddDays(1)
                });
            }
        }

        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
           
            var userAgent = filterContext.HttpContext.Request.Headers["User-Agent"].ToString();
            if (IsRobot(userAgent))
                return;

            var zanpid = filterContext.HttpContext.Request.Query["zanpid"].ToString();
            if (!string.IsNullOrWhiteSpace(zanpid))
            {
                filterContext.HttpContext.Response.Cookies.Append("zanpid", zanpid, new Microsoft.AspNetCore.Http.CookieOptions(){
                    Expires = DateTime.MinValue
                });
            }

            var remoteIpAddress = filterContext.HttpContext.Connection.RemoteIpAddress.ToString();
            if(remoteIpAddress == "::1")
            {
                remoteIpAddress = "127.0.0.1";
            }
            var remoteIpAddresCookie = filterContext.HttpContext.Request.Cookies["ip"];
            if(remoteIpAddresCookie == null){
                   filterContext.HttpContext.Response.Cookies.Append("ip", remoteIpAddress, new Microsoft.AspNetCore.Http.CookieOptions(){
                    Expires = DateTime.Now.AddMinutes(30),
                });
            }
            var id = filterContext.HttpContext.Request.Query["id"].ToString();
            string idPub = filterContext.HttpContext.Request.Query["idPub"].ToString();

            if (!string.IsNullOrEmpty(idPub))
                id = string.Concat(id, idPub.PadLeft(3, '0'));

            int codigoDeMidia;
            var codigoSite = (int)CacheManager.Configuration.codigoSite;

            codigoDeMidia = getIdCanal(id, codigoSite, getCanalOrganico(filterContext));

            var cookie = filterContext.HttpContext.Request.Cookies["midia"];

            string referrer = filterContext.HttpContext.Request.Headers["Referer"].ToString();
        
            referrer = referrer.ToLower();
            //Limita o referrer a 500 caracteres para evitar problemas na API e em outros pontos do sistema
             referrer = referrer.Substring(0, Math.Min(referrer.Length, 500));
            

            if (cookie == null || !string.IsNullOrWhiteSpace(id))
            {
                //Contabiliza midia
                new System.Net.WebClient().DownloadString(string.Format("{0}/OrigemMidiaService.svc/midia/?codigoDeMidia={1}&codigoDoSite={2}&referrer={3}",
                                                          CacheManager.Configuration.sorteOnlineAPI,
                                                          codigoDeMidia,
                                                          codigoSite,  
                                                          System.Net.WebUtility.UrlEncode(referrer)));
               

                filterContext.HttpContext.Response.Cookies.Delete("midia");
                filterContext.HttpContext.Response.Cookies.Append("midia", codigoDeMidia.ToString(), new Microsoft.AspNetCore.Http.CookieOptions(){
                    Expires =  DateTime.Now.AddDays(1)
                });
                filterContext.HttpContext.Response.Cookies.Delete("referrer");
                filterContext.HttpContext.Response.Cookies.Append("referrer", referrer, new Microsoft.AspNetCore.Http.CookieOptions(){
                    Expires =  DateTime.Now.AddDays(1)
                });
                

            }
            CookieQueryString(filterContext.HttpContext, "utm_source");
            CookieQueryString(filterContext.HttpContext, "utm_content");
            CookieQueryString(filterContext.HttpContext, "utm_campaign");
            CookieQueryString(filterContext.HttpContext, "utm_term");
            CookieQueryString(filterContext.HttpContext, "utm_medium");
        }
        private int getCanalOrganico(ActionExecutingContext filterContext)
        {
            try
            {
                 string referrer = filterContext.HttpContext.Request.Headers["Referer"].ToString();
                
                referrer = referrer.ToLower();
                //se for null vazio ou veio do proprio site é Espontaneo
                if (string.IsNullOrWhiteSpace(referrer) ||
                    referrer.Contains("localhost") ||
                    referrer.Contains(CacheManager.Configuration.url) ||
                    referrer.Contains(CacheManager.Configuration.urlHomologacao))
                {
                    return -1;
                }

                if (referrer.Contains("google.com"))
                    return 0;
                if (referrer.Contains("bing.com"))
                    return 1;
                if (referrer.Contains("yahoo.com"))
                    return 2;
                //Outros
                return 3;

            }
            catch (Exception)
            {
                return -1; //Espontaneo
            }
        }
        private int getIdCanal(string idCanal, int idSite, int canalOrganico)
        {
            //Midia especifica
            int id;
            if (int.TryParse(idCanal, out id))
                return id;

            //Espontaneo
            if (canalOrganico == -1)
            {
                switch (idSite)
                {
                    case 5: //Loteria Brasil
                        return 50001;
                    case 6: //Loterica
                        return 60001;
                    default://SorteOnline
                        return 1;
                }
            }

            //Organico
            int BaseID;
            switch (idSite)
            {
                case 5: //Loteria Brasil
                    BaseID = 1150000000;
                    return BaseID + canalOrganico;
                case 6: //Loterica
                    BaseID = 1160000000;
                    return BaseID + canalOrganico;
                default://SorteOnline
                    BaseID = 1100000000;
                    return BaseID + canalOrganico;
            }
        }

        public bool IsRobot(string UserAgent)
        {
            if (string.IsNullOrWhiteSpace(UserAgent))
                return true;
            var ret = (UserAgent == "Mediapartners-Google");
            ret |= UserAgent.Contains("AdsBot-Google");

            return ret;
        }
    }
}