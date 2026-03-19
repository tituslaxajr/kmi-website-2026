"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  DollarSign,
  Film,
  Palette,
  LogOut,
  ArrowLeft,
  Loader2,
  Menu,
  X,
  ImageIcon,
  HeartHandshake,
  PanelsTopLeft,
  Mail,
  ChevronRight,
  Search,
  Bell,
  UsersRound,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
const logoDarkImg = "/logo.png";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<any>;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Stories", path: "/admin/stories", icon: BookOpen },
      { label: "Ministries", path: "/admin/ministries", icon: HeartHandshake },
      { label: "Partners", path: "/admin/partners", icon: Users },
      { label: "Team", path: "/admin/team", icon: UsersRound },
      { label: "Media", path: "/admin/media", icon: Film },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Donations", path: "/admin/donations", icon: DollarSign },
      { label: "Subscribers", path: "/admin/subscribers", icon: Mail },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "Users", path: "/admin/users", icon: ShieldCheck },
      { label: "Site Settings", path: "/admin/site-settings", icon: Settings },
      { label: "Page Images", path: "/admin/page-images", icon: PanelsTopLeft },
      { label: "Assets", path: "/admin/assets", icon: ImageIcon },
      { label: "Style Guide", path: "/admin/style-guide", icon: Palette },
    ],
  },
];

// Flatten for breadcrumb lookup
const allLinks = navGroups.flatMap((g) => g.items);

function getPageTitle(pathname: string): string {
  const match = allLinks.find((link) =>
    link.path === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(link.path)
  );
  return match?.label || "Admin";
}

function getUserInitials(name?: string): string {
  if (!name) return "A";
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-light-linen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin text-harvest-gold" />
          <span className="text-slate-text" style={{ fontSize: "0.8125rem" }}>Loading admin...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const pageTitle = getPageTitle(pathname);
  const initials = getUserInitials(user?.name);

  return (
    <div className="min-h-screen bg-light-linen flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-covenant-navy/20 backdrop-blur-[2px] z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-[256px] bg-white flex flex-col shrink-0 z-50 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar top — Logo */}
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logoDarkImg} alt="Kapatid Admin" className="h-9 w-auto" />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-field-sand/60 text-slate-text transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sidebar divider */}
        <div className="mx-4 h-px bg-mist/40" />

        {/* Nav groups */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-5">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p
                className="text-slate-text/40 px-3.5 mb-1.5"
                style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}
              >
                {group.title}
              </p>
              <div className="space-y-0.5">
                {group.items.map((link) => {
                  const isActive =
                    link.path === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(link.path);
                  return (
                    <Link
                      key={link.path}
                      href={link.path}
                      className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg transition-all duration-200 relative ${
                        isActive
                          ? "bg-harvest-gold/8 text-harvest-gold"
                          : "text-slate-text hover:bg-field-sand/50 hover:text-covenant-navy"
                      }`}
                      style={{ fontSize: "0.8125rem", fontWeight: isActive ? 700 : 500 }}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-harvest-gold rounded-r-full" />
                      )}
                      <link.icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="px-3 pb-3 pt-1 space-y-1">
          <div className="mx-1 h-px bg-mist/30 mb-2" />
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-slate-text hover:bg-field-sand/50 hover:text-covenant-navy transition-all duration-200"
            style={{ fontSize: "0.8125rem", fontWeight: 500 }}
          >
            <ArrowLeft size={16} strokeWidth={1.8} />
            Back to Site
          </Link>
          <button
            onClick={async () => {
              await logout();
              router.push("/admin/login");
            }}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-mission-red/70 hover:bg-mission-red/4 hover:text-mission-red transition-all duration-200 w-full cursor-pointer"
            style={{ fontSize: "0.8125rem", fontWeight: 500 }}
          >
            <LogOut size={16} strokeWidth={1.8} />
            Sign Out
          </button>

          {/* User card */}
          <div className="flex items-center gap-3 px-3.5 py-3 mt-1 bg-field-sand/40 rounded-xl">
            <div
              className="w-8 h-8 rounded-full bg-covenant-navy flex items-center justify-center shrink-0"
            >
              <span className="text-white" style={{ fontSize: "0.6875rem", fontWeight: 700 }}>{initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-covenant-navy truncate"
                style={{ fontSize: "0.8125rem", fontWeight: 700 }}
              >
                {user?.name}
              </p>
              <p className="text-slate-text/60 truncate" style={{ fontSize: "0.6875rem" }}>
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Right border line on sidebar */}
      <div className="hidden lg:block w-px bg-mist/40 shrink-0" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar — desktop */}
        <div className="hidden lg:flex sticky top-0 z-30 bg-light-linen/80 backdrop-blur-md items-center justify-between px-8 py-3.5 border-b border-mist/25">
          <div className="flex items-center gap-2 text-slate-text/50" style={{ fontSize: "0.8125rem" }}>
            <span className="hover:text-covenant-navy transition-colors">Admin</span>
            <ChevronRight size={12} />
            <span className="text-covenant-navy font-semibold">{pageTitle}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-mist/30">
              <Search size={14} className="text-slate-text/30" />
              <span className="text-slate-text/30" style={{ fontSize: "0.75rem" }}>Quick search...</span>
              <kbd className="ml-4 bg-field-sand text-slate-text/40 px-1.5 py-0.5 rounded" style={{ fontFamily: "monospace", fontSize: "0.5625rem" }}>
                /
              </kbd>
            </div>
          </div>
        </div>

        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-mist/30 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-field-sand/50 text-covenant-navy transition-colors cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <img src={logoDarkImg} alt="Kapatid Admin" className="h-7 w-auto" />
              <span className="text-slate-text/30 mx-1">|</span>
              <span className="text-covenant-navy" style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                {pageTitle}
              </span>
            </div>
          </div>
          <div
            className="w-7 h-7 rounded-full bg-covenant-navy flex items-center justify-center"
          >
            <span className="text-white" style={{ fontSize: "0.5625rem", fontWeight: 700 }}>{initials}</span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}