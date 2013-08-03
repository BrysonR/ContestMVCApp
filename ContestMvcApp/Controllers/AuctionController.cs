using System.Security.Cryptography.X509Certificates;
using System.Web.Mvc;
using System.Web.UI.WebControls;
using ContestMvcApp.Services;

namespace ContestMvcApp.Controllers
{
    public class AuctionController : Controller
    {
        private readonly ITestService _testService;

        public AuctionController(ITestService testService)
        {
            _testService = testService;
        }

        public ActionResult Index()
        {
            _testService.DoNothing();
            return View("Create");
        }

        public class ListingData
        {
            public virtual string Title { get; set; }
            public virtual string Category { get; set; }
            public virtual string Origin { get; set; }
            public virtual string Destination { get; set; }
        }

        public class ListingInputModel
        {
            public virtual string Title { get; set; }
            public virtual string Category { get; set; }
            public virtual string Origin { get; set; }
            public virtual string Destination { get; set; }
        }

        [HttpPost]
        public ActionResult ListItem(ListingData data)
        {
            var result = data;
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        //[HttpPut]
        //public ActionResult SaveItem(ListingData data)
        //{
        //}
    }
}
