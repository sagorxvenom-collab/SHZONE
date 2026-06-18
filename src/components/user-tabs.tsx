import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, ShoppingCart, User } from "lucide-react";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products", label: "Shop", icon: ShoppingBag },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/orders", label: "Orders", icon: User },
];

export function UserTabs() {
  const pathname = usePathname();

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/40 overflow-x-auto"
      style={{ backgroundColor: "hsl(0 40% 3%)" }}
    >
      <div className="flex min-w-max">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href === "/products" && pathname.startsWith("/products"));
          return (
            <Link key={href} href={href} className="flex-1">
              <div
                className={`flex flex-col items-center gap-0.5 py-2 px-5 transition-colors whitespace-nowrap ${active ? "" : "text-muted-foreground"}`}
                style={active ? { color: "hsl(25 100% 55%)" } : {}}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
