namespace ContestMvcApp.Services
{
    public interface ITestService
    {
        void DoNothing();
    }

    public class TestService : ITestService
    {
        public void DoNothing()
        {
            
        }
    }
}