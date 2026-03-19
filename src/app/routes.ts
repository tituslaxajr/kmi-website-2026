import { createBrowserRouter } from "react-router";
import { Layout } from "./components/layout/Layout";
import { AdminLayout } from "./components/layout/AdminLayout";
import { HomePage } from "./pages/HomePage";
import { StoriesPage } from "./pages/StoriesPage";
import { StoryDetailPage } from "./pages/StoryDetailPage";
import { PartnersPage } from "./pages/PartnersPage";
import { PartnerDetailPage } from "./pages/PartnerDetailPage";
import { ImpactPage } from "./pages/ImpactPage";
import { MediaPage } from "./pages/MediaPage";
import { GivePage } from "./pages/GivePage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { MinistriesPage } from "./pages/MinistriesPage";
import { MinistryDetailPage } from "./pages/MinistryDetailPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminStyleGuide } from "./pages/admin/AdminStyleGuide";
import { AdminStories } from "./pages/admin/AdminStories";
import { AdminPartners } from "./pages/admin/AdminPartners";
import { AdminMedia } from "./pages/admin/AdminMedia";
import { AdminDonations } from "./pages/admin/AdminDonations";
import { AdminAssets } from "./pages/admin/AdminAssets";
import { AdminMinistries } from "./pages/admin/AdminMinistries";
import { AdminPageImages } from "./pages/admin/AdminPageImages";
import { AdminSubscribers } from "./pages/admin/AdminSubscribers";
import { AdminStoryEditor } from "./pages/admin/AdminStoryEditor";
import { AdminTeam } from "./pages/admin/AdminTeam";
import { AdminSiteSettings } from "./pages/admin/AdminSiteSettings";
import { AdminUsers } from "./pages/admin/AdminUsers";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "ministries", Component: MinistriesPage },
      { path: "ministries/:slug", Component: MinistryDetailPage },
      { path: "stories", Component: StoriesPage },
      { path: "stories/:slug", Component: StoryDetailPage },
      { path: "partners", Component: PartnersPage },
      { path: "partners/:id", Component: PartnerDetailPage },
      { path: "impact", Component: ImpactPage },
      { path: "media", Component: MediaPage },
      { path: "give", Component: GivePage },
      { path: "about", Component: AboutPage },
      { path: "contact", Component: ContactPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
  {
    path: "/admin/login",
    Component: AdminLoginPage,
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "style-guide", Component: AdminStyleGuide },
      { path: "stories", Component: AdminStories },
      { path: "stories/new", Component: AdminStoryEditor },
      { path: "stories/edit/:id", Component: AdminStoryEditor },
      { path: "partners", Component: AdminPartners },
      { path: "donations", Component: AdminDonations },
      { path: "media", Component: AdminMedia },
      { path: "assets", Component: AdminAssets },
      { path: "ministries", Component: AdminMinistries },
      { path: "page-images", Component: AdminPageImages },
      { path: "subscribers", Component: AdminSubscribers },
      { path: "team", Component: AdminTeam },
      { path: "site-settings", Component: AdminSiteSettings },
      { path: "users", Component: AdminUsers },
    ],
  },
]);