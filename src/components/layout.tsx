import { ReactNode, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, Search, X } from "lucide-react";
import { useGetCart } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CartDrawer } from "@/components/cart-drawer";
import { UserPanel } from "@/components/user-panel";
import { UserTabs } from "@/components/user-tabs";

interface LayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

export function Layout({ children, hideFooter }: LayoutProps) {
  const { data: cart } = useGetCart();
  const [bannerVisible, setBannerVisible] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartBlink, setCartBlink] = useState(false);
  const blinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cartCount = cart?.itemCount || 0;

  // Listen for cart-updated custom event from product pages
  useEffect(() => {
    const handler = () => {
      if (blinkTimer.current) clearTimeout(blinkTimer.current);
      setCartBlink(false);
      // Re-trigger in next tick to restart animation
      requestAnimationFrame(() => {
        setCartBlink(true);
        blinkTimer.current = setTimeout(() => setCartBlink(false), 2100);
      });
    };
    window.addEventListener("cart-updated", handler);
    return () => {
      window.removeEventListener("cart-updated", handler);
      if (blinkTimer.current) clearTimeout(blinkTimer.current);
    };
  }, []);

  const NavLinks = () => (
    <>
      <Link href="/products" className="text-sm font-medium hover:opacity-70 transition-opacity uppercase tracking-wider">
        Shop
      </Link>
      <Link href="/products" className="text-sm font-medium hover:opacity-70 transition-opacity uppercase tracking-wider">
        T-Shirts
      </Link>
      <Link href="/orders" className="text-sm font-medium hover:opacity-70 transition-opacity uppercase tracking-wider">
        Track Order
      </Link>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* Free Shipping Banner */}
      {bannerVisible && (
        <div
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-[11px] font-medium tracking-wider text-center relative"
          style={{ backgroundColor: "hsl(0 40% 10%)", color: "hsl(0 0% 85%)" }}
          data-testid="shipping-banner"
        >
          FREE SHIPPING ON ORDERS OVER ৳5000
          <button onClick={() => setBannerVisible(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
            data-testid="banner-close" aria-label="Close banner">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 backdrop-blur"
        style={{ backgroundColor: "hsl(0 40% 4% / 0.97)" }}>
        <div className="container mx-auto px-4 h-14 flex items-center justify-between relative">

          {/* Mobile menu — left */}
          <div className="flex items-center w-10">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 p-0">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[260px] flex flex-col gap-6 pt-12"
                style={{ backgroundColor: "hsl(0 35% 5%)" }}>
                <NavLinks />
              </SheetContent>
            </Sheet>
          </div>

          {/* Brand — centered */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <span className="font-display font-bold text-xl tracking-tighter text-foreground" data-testid="brand-logo">
              SHZONE
            </span>
          </Link>

          {/* Right icons */}
          <div className="flex items-center gap-1 ml-auto">
            <Link href="/products">
              <Button variant="ghost" size="icon" className="h-9 w-9 p-0">
                <Search className="h-[18px] w-[18px]" />
              </Button>
            </Link>

            {/* Cart icon with blink */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative h-9 w-9 flex items-center justify-center hover:bg-muted/30 rounded-sm transition-colors"
              data-testid="cart-icon-button"
              aria-label="Open cart"
            >
              <ShoppingBag
                className={`h-[18px] w-[18px] transition-colors ${cartBlink ? "cart-blink" : ""}`}
                style={cartBlink ? { color: "hsl(25 100% 55%)" } : {}}
              />
              {cartCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full text-[9px] font-bold text-white"
                  style={{ backgroundColor: cartBlink ? "hsl(25 100% 60%)" : "hsl(25 100% 50%)" }}
                  data-testid="cart-count-badge"
                >
                  {cartCount}
                </span>
              )}
            </button>
            <UserPanel />
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center justify-center gap-8 border-t border-border/20 py-2">
          <NavLinks />
        </nav>
      </header>

      <main className="flex-1 w-full">
        {children}
      </main>

      {!hideFooter && (
        <footer className="border-t border-border/40 py-10 md:py-14" style={{ backgroundColor: "hsl(0 40% 4%)" }}>
          <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <span className="font-display font-bold text-xl tracking-tighter block mb-3">SHZONE</span>
              <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                Premium streetwear and essentials for the modern Bangladeshi man.
              </p>
              {/* WhatsApp Button */}
              <a
                href="https://wa.me/8801734771154"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-3 py-2 rounded-md text-sm font-medium text-white transition-transform hover:scale-105"
                style={{ backgroundColor: "#25D366" }}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp: 01734771154
              </a>
            </div>
            <div>
              <h4 className="font-semibold mb-3 uppercase tracking-wider text-xs text-muted-foreground">Shop</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/products" className="hover:text-foreground transition-colors">All Products</Link></li>
                <li><Link href="/products" className="hover:text-foreground transition-colors">New Arrivals</Link></li>
                <li><Link href="/products" className="hover:text-foreground transition-colors">T-Shirts</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 uppercase tracking-wider text-xs text-muted-foreground">Help</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/orders" className="hover:text-foreground transition-colors">Track Order</Link></li>
                <li><span className="hover:text-foreground transition-colors cursor-pointer">Returns & Exchanges</span></li>
                <li><span className="hover:text-foreground transition-colors cursor-pointer">Size Guide</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 uppercase tracking-wider text-xs text-muted-foreground">Payment</h4>
              <div className="flex gap-2 text-xs text-muted-foreground mb-3">
                <span className="border border-border/60 px-2 py-1">bKash</span>
                <span className="border border-border/60 px-2 py-1">COD</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Bogra ৳60<br />Outside Bogra ৳120
              </p>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="container mx-auto px-4 mt-10 pt-6 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground text-center md:text-left">
              &copy; {new Date().getFullYear()} SHZONE. All rights reserved.
              <span className="mx-3">·</span>
              <Link href="/admin" className="hover:text-foreground transition-colors">Admin</Link>
            </div>
            {/* Site Dev Credit */}
            <div className="flex items-center gap-2 text-xs">
              <span className="uppercase tracking-wider text-muted-foreground">Site Dev</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
              <span className="font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm text-white"
                style={{ background: "linear-gradient(135deg, hsl(25 100% 50%), hsl(25 100% 40%))", fontSize: "10px" }}>
                SAGORxVENOM
              </span>
            </div>
          </div>
        </footer>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <UserTabs />
    </div>
  );
}
