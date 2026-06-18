import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingBag, Tag, ArrowLeft, BarChart3, Menu, X, Ticket, Settings, Users, LogOut,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/index";
import { adminLogout } from "@/lib/app";

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/users", label: "Users", icon: Users },
];

function NavItem({ href, label, icon: Icon, active, onClick }: { href: string; label: string; icon: any; active: boolean; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick}>
      <div
        className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
          active ? "" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
        }`}
        style={active ? { backgroundColor: "hsl(25 100% 50% / 0.15)", color: "hsl(25 100% 55%)" } : {}}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {label}
      </div>
    </Link>
  );
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAdmin, isOwner, loading: authLoading } = useAdminAuth();

  useEffect(() => {
    if (!authLoading && !isAdmin && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [authLoading, isAdmin, pathname, router]);

  const handleLogout = async () => {
    await adminLogout();
    router.push("/admin/login");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "hsl(0 35% 4%)" }}>
        <div className="text-muted-foreground text-sm">Loading admin panel...</div>
      </div>
    );
  }

  if (!isAdmin && pathname !== "/admin/login") return null;

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ backgroundColor: "hsl(0 35% 4%)" }}>

      {/* Mobile top bar */}
      <div
        className="md:hidden sticky top-0 z-50 flex items-center justify-between px-4 h-12 border-b border-border/40"
        style={{ backgroundColor: "hsl(0 40% 3%)" }}
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" style={{ color: "hsl(25 100% 50%)" }} />
          <span className="font-display font-bold text-sm text-foreground">SHZONE Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="p-1.5 rounded text-muted-foreground hover:text-foreground"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav drawer overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar (desktop fixed, mobile drawer) */}
      <aside
        className={`
          fixed md:sticky top-0 z-50 md:z-auto h-full md:h-screen w-56 shrink-0 flex flex-col border-r border-border/40
          transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        style={{ backgroundColor: "hsl(0 40% 3%)" }}
      >
        {/* Desktop logo */}
        <div className="hidden md:flex px-5 py-5 border-b border-border/40 items-center gap-2 shrink-0">
          <BarChart3 className="h-5 w-5 shrink-0" style={{ color: "hsl(25 100% 50%)" }} />
          <div>
            <p className="font-display font-bold text-sm text-foreground">SHZONE</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Admin Panel</p>
          </div>
        </div>

        {/* Mobile drawer header */}
        <div className="md:hidden flex items-center justify-between px-4 h-12 border-b border-border/40 shrink-0">
          <span className="font-display font-bold text-sm text-foreground">Menu</span>
          <button onClick={() => setMobileOpen(false)} className="text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon }) => (
            <NavItem key={href} href={href} label={label} icon={icon}
              active={pathname === href}
              onClick={() => setMobileOpen(false)}
            />
          ))}
        </nav>

        <div className="px-3 pb-5 border-t border-border/40 pt-4 shrink-0 space-y-1">
          <Link href="/" onClick={() => setMobileOpen(false)}>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-all cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
              Back to Store
            </div>
          </Link>
          <button
            onClick={() => { handleLogout(); setMobileOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer text-left"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
          {user && (
            <div className="px-3 py-2 text-xs text-muted-foreground truncate">
              {user.email}
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Mobile bottom tab bar — horizontally scrollable */}
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-border/40 overflow-x-auto"
          style={{ backgroundColor: "hsl(0 40% 3%)" }}
        >
          <div className="flex min-w-max">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href}>
                  <div
                    className={`flex flex-col items-center gap-0.5 py-2 px-4 transition-colors whitespace-nowrap ${active ? "" : "text-muted-foreground"}`}
                    style={active ? { color: "hsl(25 100% 55%)" } : {}}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[9px] font-medium">{label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
