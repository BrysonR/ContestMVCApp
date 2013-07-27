using System.Web.Mvc;
using ContestMvcApp.Services;

namespace ContestMvcApp.Controllers
{
    public class HomeController : Controller
    {
        private readonly ITestService _testService;

        public HomeController(ITestService testService)
        {
            _testService = testService;
        }

        public ActionResult Index()
        {
            _testService.DoNothing();
            return View();
        }

    }
}
