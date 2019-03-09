using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Concurrent;
using Microsoft.Extensions.PlatformAbstractions;

namespace WeContent.LoteriaBrasil.Models
{
    public class NoticiaViewModel
    {
        public string Loteria { get; internal set; }
        public string SlugTitle { get; internal set; }
        public int? Sku { get; internal set; }
        public string Titulo { get; internal set; }
        public string Imagem { get; internal set; }
    }

}