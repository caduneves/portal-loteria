using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Concurrent;
using Microsoft.Extensions.PlatformAbstractions;

namespace WeContent.LoteriaBrasil.Models
{
    static class CacheManager{
            private static ConcurrentDictionary<string, CacheItem> Caches = new ConcurrentDictionary<string, CacheItem>();
            private static ConcurrentDictionary<string, object> Lockers = new ConcurrentDictionary<string, object>();
            public static dynamic Configuration;
            public static string GenericToken;
            static CacheManager(){
                var directory = System.IO.Path.Combine(PlatformServices.Default.Application.ApplicationBasePath, "wwwroot/js/config.json");
                if(!System.IO.File.Exists(directory)){
                    directory = System.IO.Path.Combine(PlatformServices.Default.Application.ApplicationBasePath, "../../../wwwroot/js/config.json");
                }
                if(!System.IO.File.Exists(directory))
                    directory = System.IO.Path.Combine(PlatformServices.Default.Application.ApplicationBasePath, "publish/wwwroot/js/config.json");
                
                var data = System.IO.File.ReadAllText(directory);   
                Configuration = Newtonsoft.Json.JsonConvert.DeserializeObject(data);
                GenericToken = Newtonsoft.Json.JsonConvert.DeserializeObject(new System.Net.WebClient().DownloadString(string.Format("{0}/ContaService.svc/new-token", CacheManager.Configuration.sorteOnlineAPI))).ToString();
            }
            private class CacheItem
            {
                public DateTime Expiration { get; set; }
                public string Result { get; set; }
            }

            private  static string GetCache(string cacheKey)
            {
                CacheItem cache;
                if (Caches.TryGetValue(cacheKey, out cache))
                {
                    if (cache != null && (cache.Expiration >= DateTime.Now && !string.IsNullOrWhiteSpace(cache.Result)))
                    {
                        return cache.Result;
                    }
                    Caches.TryRemove(cacheKey, out cache);
                }
                return null;
            }
            public static void Clean(string cacheKey)
            {
                if(string.IsNullOrWhiteSpace(cacheKey)){
                    return;
                }
                Caches.TryRemove(cacheKey, out var cacheItem);
            }
            public static string Execute(string cacheKey, int expiration, string query, bool isBase64 = true)
            {
                if(string.IsNullOrWhiteSpace(cacheKey)){
                    return null;
                }
                string data;
                //Check cachecus
                if ((data = GetCache(cacheKey)) == null)
                {
                    //lock concurrents if is not cached
                    lock (Lockers.GetOrAdd(cacheKey, new object()))
                    {
                        //check if cache as added when locked
                        if ((data = GetCache(cacheKey)) == null)
                        {
                            //execute request
                            query = isBase64 ? System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(query)) : query;
                            
                            
                            data = new System.Net.WebClient().DownloadString(query);
                            CacheItem cache = new CacheItem() 
                            {
                                Expiration = DateTime.Now.AddSeconds(expiration),
                                Result = data
                            };
                            Caches.TryAdd(cacheKey, cache);
                        }
                    }
                }
                //return data
                return data;
            }
    }

}