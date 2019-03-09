using System.Net.Http;
using System.Text;
using Newtonsoft.Json;

namespace WeContent.LoteriaBrasil.Models
{
    public class JsonContent : StringContent
    {
        public JsonContent(object obj) :
            base(JsonConvert.SerializeObject(obj), Encoding.UTF8, "application/json")
        { }

         public JsonContent(string jsonObj) :
            base(jsonObj, Encoding.UTF8, "application/json")
        { }
    }
}