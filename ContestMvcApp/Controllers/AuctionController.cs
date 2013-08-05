using System;
using System.Security.Cryptography.X509Certificates;
using System.Web.Mvc;
using System.Web.UI.WebControls;
using ContestMvcApp.Services;

namespace ContestMVCApp.Models 
{
    using System;    

    [Serializable]
    public class ListingInputModel
    {
        public string ListTitle { get; set; }
        public string ListCategory { get; set; }
        public string ListOrigin { get; set; }
        public string ListDestination { get; set; }
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

        [HttpPost]
        public ActionResult SaveItem(ListingInputModel inputModel)
        {
            string item = string.Format("Created ListItem '{0}' in the system.", inputModel.ListTitle);
            return Json(new ListingViewModel {Message = item});
        }

        //[HttpPut]
        //public ActionResult SaveItem(ListingData data)
        //{
        //}
    }
}
