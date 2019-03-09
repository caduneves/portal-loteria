using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Text;
using Newtonsoft.Json;

namespace WeContent.LoteriaBrasil.Models
{
    public class FormDataContent : StringContent
    {
        public FormDataContent(Dictionary<string,string> obj) :
            base(FormDataContent.Convert(obj), Encoding.UTF8, "application/x-www-form-urlencoded")
        { }


        public static string Convert(Dictionary<string,string> obj)
        {
            string content = "";

            foreach(var key in obj.Keys){
                 content += WebUtility.UrlEncode(key) + "=" + WebUtility.UrlEncode(obj[key]) + "&";
            }
            if(content.EndsWith("&")){
                content = content.Substring(0, content.Length-1);
            }
            return content;
        }
    }
}