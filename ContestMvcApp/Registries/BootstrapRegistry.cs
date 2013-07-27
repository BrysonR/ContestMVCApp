using StructureMap.Configuration.DSL;

namespace ContestMvcApp.Registries
{
    public class BootstrapRegistry : Registry
    {
        public BootstrapRegistry()
        {
            Scan(x =>
            {
                x.IncludeNamespaceContainingType<BootstrapRegistry>();
                x.LookForRegistries();
            });
        }
    }
}