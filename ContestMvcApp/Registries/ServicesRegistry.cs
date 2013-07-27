using ContestMvcApp.Services;
using StructureMap.Configuration.DSL;

namespace ContestMvcApp.Registries
{
    public class ServicesRegistry : Registry
    {
        public ServicesRegistry()
        {
            Scan(x =>
            {
                x.IncludeNamespaceContainingType<ServicesMarker>();
                x.WithDefaultConventions();
            });
        }
    }
}