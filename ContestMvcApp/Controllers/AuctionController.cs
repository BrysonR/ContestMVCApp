using System.Web.Mvc;
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
    }
}
