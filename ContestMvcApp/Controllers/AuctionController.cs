using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Web.Mvc;
using System.Web.UI.WebControls;
using ContestMvcApp.Services;

namespace ContestMVCApp.Models 
{
    using System;    


    public class ListingItem
    {
        public virtual string ListTitle { get; set; }
        public virtual string ListCategory { get; set; }
        public virtual string Categories { get; set; }
        public virtual string ListOrigin { get; set; }
        public virtual string ListDestination { get; set; }
    }

    [Serializable]
    public class ListingViewModel
    {
        public string Message { get; set; }
    }
}

namespace ContestMvcApp.Controllers
{
    using System;
    using System.Web.Mvc;
    using ContestMVCApp.Models;

    public class AuctionController : Controller
    {

        public ActionResult Index()
        {
            return View("Create");
        }

        public ActionResult Listings()
        {
            return View("Listings");
        }

        [HttpPost]
        public ActionResult SaveItem(List<ListingItem> ListingItems)
        {
            var item = ListingItems[0].ListTitle;
            return Json(ListingItems);
        }

        //[HttpPut]
        //public ActionResult SaveItem(ListingData data)
        //{
        //}
    }
}
