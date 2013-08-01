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
    }
}
