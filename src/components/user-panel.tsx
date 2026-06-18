import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { getUser, clearUser, User } from "@/lib/app";
import { useToast } from "@/hooks/index";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { User as UserIcon, ShoppingBag, MapPin, Phone, LogOut, ChevronRight, Menu, X } from "lucide-react";

export function UserPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(getUser());
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    clearUser();
    setUser(null);
    queryClient.invalidateQueries();
    toast({ title: "Logged out" });
    setOpen(false);
  };

  const menuItems = [
    { href: "/orders", label: "My Orders", icon: ShoppingBag },
    { href: "/track-order", label: "Track Order", icon: MapPin },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="relative h-9 w-9 flex items-center justify-center hover:bg-muted/30 rounded-sm transition-colors"
          aria-label="User menu"
        >
          <UserIcon className="h-[18px] w-[18px]" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[300px] flex flex-col gap-0 p-0"
        style={{ backgroundColor: "hsl(0 35% 5%)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-12 border-b border-border/40">
          <span className="font-display font-bold text-sm text-foreground">Account</span>
          <button onClick={() => setOpen(false)} className="text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User Info */}
        {user ? (
          <div className="px-5 py-5 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "hsl(25 100% 50% / 0.15)" }}>
                <UserIcon className="h-5 w-5" style={{ color: "hsl(25 100% 55%)" }} />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">{user.name || user.phone}</p>
                <p className="text-xs text-muted-foreground">{user.phone}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-5 py-5 border-b border-border/40">
            <p className="text-sm text-muted-foreground mb-3">Login to track your orders</p>
            <Link href="/orders" onClick={() => setOpen(false)}>
              <button
                className="w-full h-10 text-sm font-semibold text-white rounded-md"
                style={{ background: "linear-gradient(135deg, hsl(25 100% 50%), hsl(25 100% 40%))" }}
              >
                Login
              </button>
            </Link>
          </div>
        )}

        {/* Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {menuItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all cursor-pointer">
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{label}</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        {user && (
          <div className="px-3 pb-5 border-t border-border/40 pt-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-red-400 hover:bg-red-900/10 transition-all w-full"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
