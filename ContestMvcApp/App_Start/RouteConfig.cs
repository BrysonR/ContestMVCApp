using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace ContestMvcApp
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                name: "Auction",
                url: "Auction/index/{id}",
                defaults: new { controller = "Auction", action = "Index", id = UrlParameter.Optional }
            );

            routes.MapRoute(
                name: "Listings",
                url: "Auction/Listings/{id}",
                defaults: new { controller = "Auction", action = "Listings", id = UrlParameter.Optional }
            );

        }
    }
}