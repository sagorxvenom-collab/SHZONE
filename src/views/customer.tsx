import { Layout } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/index";
import { getGetCartQueryKey, useAddToCart, useCreateOrder, useGetCart, useGetFeaturedProducts, useGetOrder, useGetProduct, useGetTrendingProducts, useListCategories, useListOrders, useListProducts, useRemoveCartItem, useUpdateCartItem } from "@/lib/api-client";
import { Coupon, addUserOrder, calcDiscount, getUser, getUserOrders, incrementCouponUsage, isLoggedIn, setUser, validateCoupon } from "@/lib/app";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, AlertTriangle, ArrowLeft, ArrowRight, Check, ChevronDown, ChevronRight, ChevronUp, Filter, MapPin, Minus, Package, Phone, Plus, Search, Shield, Star, Tag, X } from "lucide-react";
import Link from "next/link";
import { useParams as useNextParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const COLLECTION_IMAGES: Record<string, string> = {
  "T-Shirts":    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
  "Shirts":      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
  "Polo":        "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&q=80",
  "Hoodie":      "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80",
  "Jacket":      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
  "Accessories": "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80",
};

export function Home() {
  const { data: featuredProducts } = useGetFeaturedProducts();
  const { data: trendingProducts } = useGetTrendingProducts();
  const { data: categories } = useListCategories();

  return (
    <Layout>

      {/* ── Hero ── */}
      <section className="relative w-full h-[88vh] min-h-[560px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/80 z-10" />
        <img
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80"
          alt="SHZONE Hero"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="relative z-20 w-full px-5 pb-12 md:px-10 md:pb-16">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
            <p className="text-[11px] text-white/50 uppercase tracking-[0.3em] mb-3">New Season 2026</p>
            <h1 className="text-[13vw] sm:text-7xl md:text-8xl font-display font-black text-white uppercase tracking-tighter leading-none mb-5">
              Defy<br />The<br />Ordinary
            </h1>
            <p className="text-sm text-white/60 mb-6 max-w-xs leading-relaxed">
              প্রিমিয়াম স্ট্রিটওয়্যার, স্পেশালি আপনার জন্য।
            </p>
            <div className="flex items-center gap-3">
              <Link href="/products">
                <button className="flex items-center gap-2 px-6 h-11 text-sm font-bold uppercase tracking-widest text-white border border-white hover:bg-white hover:text-black transition-all">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="/products">
                <button className="h-11 px-5 text-sm text-white/60 hover:text-white transition-colors uppercase tracking-wider">
                  Collections
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Collections Strip (Mobile horizontal scroll) ── */}
      <section className="py-10 md:py-16 bg-background overflow-hidden">
        <div className="px-4 md:px-8 mb-6 flex items-end justify-between">
          <div>
            <p className="text-[10px] tracking-[0.25em] text-muted-foreground uppercase mb-1">Browse</p>
            <h2 className="text-2xl md:text-4xl font-display font-black uppercase tracking-tighter text-foreground">Collections</h2>
          </div>
          <Link href="/products">
            <span className="text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider flex items-center gap-1">
              All <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="flex md:hidden gap-3 px-4 overflow-x-auto no-scrollbar pb-2">
          {categories?.map((cat) => {
            const img = cat.imageUrl || COLLECTION_IMAGES[cat.name] || COLLECTION_IMAGES["T-Shirts"];
            return (
              <Link key={cat.id} href={`/products?category=${cat.id}`}>
                <div className="relative shrink-0 w-36 h-52 overflow-hidden rounded-md bg-muted/20 group">
                  <img src={img} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-active:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-display font-bold text-sm uppercase tracking-wide leading-tight">{cat.name}</p>
                    <p className="text-white/50 text-[10px] mt-0.5">{cat.nameBn}</p>
                  </div>
                  {cat.productCount > 0 && (
                    <div className="absolute top-2 right-2 bg-black/50 text-white/80 text-[9px] px-1.5 py-0.5 rounded">
                      {cat.productCount}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Desktop: asymmetric bento grid */}
        <div className="hidden md:grid grid-cols-3 gap-2 px-4 md:px-8" style={{ gridTemplateRows: "280px 280px" }}>
          {categories?.slice(0, 5).map((cat, i) => {
            const img = cat.imageUrl || COLLECTION_IMAGES[cat.name] || COLLECTION_IMAGES["T-Shirts"];
            const isLarge = i === 0;
            return (
              <Link key={cat.id} href={`/products?category=${cat.id}`}
                className={`relative overflow-hidden bg-muted/20 group ${isLarge ? "row-span-2" : ""}`}>
                <img src={img} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-white font-display font-bold text-xl uppercase tracking-wider">{cat.name}</p>
                  <p className="text-white/50 text-xs mt-1">{cat.nameBn}</p>
                  <p className="text-white/30 text-xs mt-1 flex items-center gap-1">
                    Shop <ChevronRight className="h-3 w-3" />
                  </p>
                </div>
              </Link>
            );
          })}
          {categories && categories.length > 5 && (
            <Link href="/products">
              <div className="relative flex items-center justify-center bg-muted/20 border border-border/30 group hover:bg-muted/40 transition-colors">
                <div className="text-center">
                  <p className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">+{categories.length - 5} More</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">View All</p>
                </div>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="py-12 md:py-20" style={{ backgroundColor: "hsl(0 30% 6%)" }}>
        <div className="px-4 md:px-8 mb-8 flex items-end justify-between">
          <div>
            <p className="text-[10px] tracking-[0.25em] text-muted-foreground uppercase mb-1">Handpicked</p>
            <h2 className="text-2xl md:text-4xl font-display font-black uppercase tracking-tighter">Essential Drops</h2>
          </div>
          <Link href="/products?featured=true">
            <span className="text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider flex items-center gap-1">
              See All <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>

        {/* Mobile: 2 col tight grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 px-4 md:px-8">
          {featuredProducts?.slice(0, 8).map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>

      {/* ── bKash Promo Banner ── */}
      <section className="py-10 px-4 md:px-8">
        <div
          className="rounded-xl overflow-hidden relative flex flex-col md:flex-row items-center justify-between gap-6 p-6 md:p-10"
          style={{ background: "linear-gradient(135deg, hsl(330 80% 12%), hsl(0 50% 8%))" }}
        >
          <div className="border border-pink-500/20 absolute inset-0 rounded-xl pointer-events-none" />
          <div>
            <p className="text-[10px] tracking-[0.25em] text-pink-400/70 uppercase mb-2">Payment</p>
            <h3 className="text-2xl md:text-3xl font-display font-black text-white tracking-tighter">
              Pay with <span style={{ color: "#e2136e" }}>bKash</span>
            </h3>
            <p className="text-sm text-white/50 mt-2 max-w-xs">
              ক্যাশ অন ডেলিভারি ও বিকাশ পেমেন্ট · Bogra ৳60 · বাইরে ৳120
            </p>
          </div>
          <Link href="/products">
            <button
              className="shrink-0 px-7 h-11 text-sm font-bold uppercase tracking-widest text-white rounded-none"
              style={{ backgroundColor: "#e2136e" }}
            >
              Shop Now
            </button>
          </Link>
        </div>
      </section>

      {/* ── New Arrivals ── */}
      {trendingProducts && trendingProducts.length > 0 && (
        <section className="py-12 md:py-20 bg-background">
          <div className="px-4 md:px-8 mb-8">
            <p className="text-[10px] tracking-[0.25em] text-muted-foreground uppercase mb-1">Just In</p>
            <h2 className="text-2xl md:text-4xl font-display font-black uppercase tracking-tighter">New Arrivals</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 px-4 md:px-8">
            {trendingProducts.slice(0, 4).map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </section>
      )}

    </Layout>
  );
}

export function Products() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");
  const isFeatured = searchParams.get("featured") === "true";

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    initialCategory && !isNaN(Number(initialCategory)) ? Number(initialCategory) : null
  );

  const { data: categories } = useListCategories();
  
  // Try to match string categories if passed in URL
  useMemo(() => {
    if (initialCategory && isNaN(Number(initialCategory)) && categories) {
      const match = categories.find(c => c.name.toLowerCase() === initialCategory.toLowerCase());
      if (match) setSelectedCategory(match.id);
    }
  }, [initialCategory, categories]);

  const { data: products, isLoading } = useListProducts({ 
    categoryId: selectedCategory,
    search: search.length > 2 ? search : undefined,
    featured: isFeatured ? true : undefined
  });

  return (
    <Layout>
      <div className="bg-muted/30 py-8 md:py-12 border-b border-border/40">
        <div className="container px-4">
          <h1 className="text-3xl md:text-5xl font-display font-bold uppercase tracking-tighter">
            {isFeatured ? "Featured" : "Collection"}
          </h1>
          <p className="text-muted-foreground mt-2">আমাদের সম্পূর্ণ কালেকশন</p>
        </div>
      </div>

      <div className="container px-4 py-8 md:py-12 flex flex-col md:flex-row gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-8">
            <div>
              <h3 className="font-semibold uppercase tracking-wider mb-4 text-sm">Search</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search products..." 
                  className="pl-9 rounded-none bg-transparent"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div>
              <h3 className="font-semibold uppercase tracking-wider mb-4 text-sm">Categories <span className="text-xs text-muted-foreground block normal-case font-normal mt-1">ক্যাটাগরি</span></h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`block w-full text-left text-sm py-1.5 ${selectedCategory === null ? 'font-semibold text-primary' : 'text-muted-foreground hover:text-primary'}`}
                >
                  All Products
                </button>
                {categories?.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`block w-full text-left text-sm py-1.5 ${selectedCategory === cat.id ? 'font-semibold text-primary' : 'text-muted-foreground hover:text-primary'}`}
                  >
                    {cat.name} <span className="text-xs ml-1 opacity-70">{cat.nameBn}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Filter Bar */}
        <div className="md:hidden flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search..." 
              className="pl-9 rounded-none bg-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-none shrink-0">
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-8 space-y-6">
                <div>
                  <h3 className="font-semibold uppercase tracking-wider mb-4 text-sm">Categories</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`block w-full text-left text-sm py-2 ${selectedCategory === null ? 'font-semibold text-primary' : 'text-muted-foreground'}`}
                    >
                      All Products
                    </button>
                    {categories?.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`block w-full text-left text-sm py-2 ${selectedCategory === cat.id ? 'font-semibold text-primary' : 'text-muted-foreground'}`}
                      >
                        {cat.name} <span className="text-xs ml-1 opacity-70">{cat.nameBn}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col gap-3">
                  <div className="aspect-[3/4] bg-muted w-full" />
                  <div className="h-4 bg-muted w-2/3" />
                  <div className="h-4 bg-muted w-1/3" />
                </div>
              ))}
            </div>
          ) : products?.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No products found matching your criteria.</p>
              <Button 
                variant="outline" 
                className="mt-4 rounded-none"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory(null);
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {products?.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export function ProductDetail() {
  const params = useNextParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useGetProduct(Number(id), {
    query: { enabled: !!id },
  });

  const addToCartMut = useAddToCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [descOpen, setDescOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (isLoading) {
    return (
      <Layout hideFooter>
        <div className="min-h-screen animate-pulse">
          <div className="flex gap-2 p-3">
            <div className="w-16 h-20 bg-muted shrink-0" />
            <div className="flex-1 h-56 bg-muted" />
          </div>
          <div className="p-4 space-y-3">
            <div className="h-3 bg-muted w-1/3" />
            <div className="h-7 bg-muted w-3/4" />
            <div className="h-5 bg-muted w-1/4" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout hideFooter>
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
          <p className="text-lg mb-4 text-muted-foreground">Product not found</p>
          <button
            onClick={() => router.push("/products")}
            className="bg-accent text-accent-foreground px-6 py-3 text-sm font-semibold uppercase tracking-wider"
          >
            Back to Shop
          </button>
        </div>
      </Layout>
    );
  }

  const allImages = [product.imageUrl, ...(product.images || [])].filter(
    (img, i, arr) => img && arr.indexOf(img) === i
  );
  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(
        ((product.originalPrice! - product.price) / product.originalPrice!) *
          100
      )
    : 0;

  const handleAddToCart = (goBuyNow = false) => {
    if (product.sizes?.length && !selectedSize) {
      toast({ title: "সাইজ বেছে নিন", description: "Please select a size", variant: "destructive" });
      return;
    }
    addToCartMut.mutate(
      {
        data: {
          productId: product.id,
          quantity,
          size: selectedSize,
          color: null,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          window.dispatchEvent(new CustomEvent("cart-updated"));
          if (goBuyNow) {
            router.push("/checkout");
          } else {
            toast({
              title: "কার্টে যোগ হয়েছে ✓",
              description: `${product.name} added to cart.`,
            });
          }
        },
      }
    );
  };

  return (
    <Layout hideFooter>
      {/* Page content with bottom padding for sticky bar */}
      <div className="pb-20">

        {/* Breadcrumb */}
        <div className="px-3 py-2 flex items-center gap-1 text-[11px] text-muted-foreground overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link href="/products" className="hover:text-foreground transition-colors">Shop</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="text-muted-foreground/70">{product.categoryName.toLowerCase()}</span>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="text-muted-foreground/70 truncate max-w-[120px]">{product.name}</span>
        </div>

        {/* Image Gallery */}
        <div className="flex gap-2 px-3 pb-3" data-testid="gallery-section">
          {/* Thumbnails */}
          <div className="flex flex-col gap-2 w-[72px] shrink-0">
            {allImages.map((img, i) => (
              <button
                key={i}
                data-testid={`thumbnail-${i}`}
                onClick={() => setSelectedImage(i)}
                className={`relative w-full aspect-[3/4] border-2 transition-all overflow-hidden ${
                  selectedImage === i
                    ? "border-accent"
                    : "border-border/40 opacity-60"
                }`}
              >
                <img
                  src={img}
                  alt={`${product.name} view ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                {i === 0 && hasDiscount && (
                  <span className="absolute top-1 left-0 bg-accent text-accent-foreground text-[9px] font-bold px-1 py-0.5 uppercase tracking-wide">
                    SALE
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Main image */}
          <div className="flex-1 aspect-[3/4] relative overflow-hidden bg-muted/30">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                src={allImages[selectedImage]}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
                data-testid="main-product-image"
              />
            </AnimatePresence>
            {/* Counter badge */}
            <div className="absolute top-2 right-2 bg-black/60 text-white text-[11px] font-medium px-2 py-0.5 rounded-sm">
              {selectedImage + 1} / {allImages.length}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="px-4" data-testid="product-info-section">

          {/* Category tag */}
          <p className="text-[11px] text-muted-foreground uppercase tracking-widest mb-2">
            {product.categoryName.toLowerCase().replace(/\s+/g, "-")}
          </p>

          {/* Title */}
          <h1 className="text-[22px] font-display font-bold leading-tight text-foreground mb-1" data-testid="product-title">
            {product.name}
          </h1>
          <p className="text-sm text-muted-foreground mb-3 font-sans">{product.nameBn}</p>

          {/* Price row */}
          <div className="flex items-center gap-3 mb-2" data-testid="price-row">
            <span className="text-2xl font-bold" style={{ color: "hsl(25 100% 50%)" }}>
              ৳{product.price.toLocaleString()}
            </span>
            {hasDiscount && (
              <>
                <span className="text-base text-muted-foreground line-through font-mono">
                  ৳{product.originalPrice?.toLocaleString()}
                </span>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-sm bg-green-600 text-white">
                  {discountPct}% off
                </span>
              </>
            )}
          </div>

          {/* SKU */}
          <p className="text-[11px] text-muted-foreground mb-2">
            SKU SHZ-{String(product.id).padStart(4, "0")}
          </p>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: product.stock > 0 ? "hsl(25 100% 50%)" : "hsl(0 70% 50%)" }}
            />
            <span className="text-sm font-medium text-foreground">
              {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
            </span>
          </div>

          <div className="border-t border-border/40 pt-4 mb-4" />

          {/* Description header */}
          <p className="text-sm font-semibold text-foreground mb-4">
            SHZONE {product.categoryName} – Full Details
          </p>

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-5" data-testid="size-selector">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold uppercase tracking-wider">Size</span>
                {selectedSize && (
                  <span className="text-xs text-muted-foreground">{selectedSize} selected</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    data-testid={`size-${s}`}
                    onClick={() => setSelectedSize(s)}
                    className={`min-w-[48px] h-10 px-3 flex items-center justify-center text-sm font-medium border transition-all ${
                      selectedSize === s
                        ? "bg-foreground text-background border-foreground"
                        : "bg-transparent text-foreground border-border/60 hover:border-foreground/40"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-5" data-testid="quantity-section">
            <span className="text-sm font-semibold uppercase tracking-wider block mb-3">Quantity</span>
            <div className="flex items-center border border-border/60 w-fit">
              <button
                data-testid="quantity-minus"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-muted/40 transition-colors"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <div
                className="w-12 h-10 flex items-center justify-center font-mono text-sm font-semibold border-x border-border/60"
                data-testid="quantity-value"
              >
                {quantity}
              </div>
              <button
                data-testid="quantity-plus"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-muted/40 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Description Accordion */}
          <div className="border-t border-border/40">
            <button
              data-testid="description-toggle"
              onClick={() => setDescOpen((v) => !v)}
              className="w-full flex items-center justify-between py-4 text-sm font-semibold uppercase tracking-wider text-foreground"
            >
              Description
              {descOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <AnimatePresence initial={false}>
              {descOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <div className="pb-4 text-sm text-muted-foreground leading-relaxed space-y-2">
                    <p>{product.description || "Premium quality fabric with comfortable fit."}</p>
                    {product.descriptionBn && (
                      <p className="text-muted-foreground/70 font-sans">{product.descriptionBn}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Details Accordion */}
          <div className="border-t border-border/40">
            <button
              data-testid="details-toggle"
              onClick={() => setDetailsOpen((v) => !v)}
              className="w-full flex items-center justify-between py-4 text-sm font-semibold uppercase tracking-wider text-foreground"
            >
              Fabric & Care
              {detailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <AnimatePresence initial={false}>
              {detailsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <div className="pb-4 text-sm text-muted-foreground leading-relaxed space-y-1">
                    <p>• Machine wash cold, tumble dry low</p>
                    <p>• Do not bleach</p>
                    <p>• Premium quality fabric</p>
                    <p>• Delivery: Bogra ৳60 / Outside Bogra ৳120</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sticky bottom bar bottom spacer info */}
          <div className="border-t border-border/40 pt-4 pb-2">
            <p className="text-[11px] text-muted-foreground text-center">
              Free shipping on orders over ৳5000 • bKash & COD accepted
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40"
        style={{ backgroundColor: "hsl(0 40% 4%)" }}
        data-testid="sticky-action-bar"
      >
        {/* Mini product info strip */}
        <div className="flex items-center justify-between px-4 pt-2 pb-1">
          <p className="text-[11px] text-muted-foreground truncate max-w-[60%]">{product.name}</p>
          <span className="text-[13px] font-bold" style={{ color: "hsl(25 100% 50%)" }}>
            ৳{product.price.toLocaleString()}
          </span>
        </div>
        <div className="flex gap-0 px-4 pb-4">
          <button
            data-testid="button-add-to-bag"
            onClick={() => handleAddToCart(false)}
            disabled={addToCartMut.isPending || product.stock === 0}
            className="flex-1 h-12 flex items-center justify-center text-sm font-semibold uppercase tracking-wider border border-r-0 border-foreground/30 text-foreground bg-transparent hover:bg-muted/30 transition-colors disabled:opacity-50"
          >
            {product.stock === 0 ? "Out of Stock" : "Add to bag"}
          </button>
          <button
            data-testid="button-buy-now"
            onClick={() => handleAddToCart(true)}
            disabled={addToCartMut.isPending || product.stock === 0}
            className="flex-1 h-12 flex items-center justify-center text-sm font-bold uppercase tracking-wider text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: "hsl(25 100% 50%)" }}
          >
            Buy now
          </button>
        </div>
      </div>
    </Layout>
  );
}

export function Cart() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: cart, isLoading } = useGetCart();
  const updateItemMut = useUpdateCartItem();
  const removeItemMut = useRemoveCartItem();

  const handleUpdateQuantity = (id: number, currentQuantity: number, delta: number) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity < 1) return;
    
    updateItemMut.mutate({
      id,
      data: { quantity: newQuantity }
    }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() })
    });
  };

  const handleRemoveItem = (id: number) => {
    removeItemMut.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() })
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto px-4 py-24">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-muted w-1/3" />
            <div className="h-[400px] bg-muted w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto px-4 py-12 md:py-24">
        <h1 className="text-3xl md:text-5xl font-display font-bold uppercase tracking-tighter mb-2">
          Your Cart
        </h1>
        <p className="text-muted-foreground mb-12">শপিং কার্ট</p>

        {isEmpty ? (
          <div className="text-center py-20 bg-muted/20 border border-border">
            <h2 className="text-xl font-semibold mb-2 uppercase tracking-wide">Cart is empty</h2>
            <p className="text-muted-foreground mb-8">আপনার কার্টে কোনো প্রোডাক্ট নেই।</p>
            <Link href="/products">
              <Button size="lg" className="rounded-none uppercase tracking-widest px-8">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2 space-y-6">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-4 md:gap-6 pb-6 border-b border-border/50">
                  <div className="w-24 md:w-32 aspect-[3/4] bg-muted shrink-0">
                    <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <Link href={`/products/${item.productId}`} className="font-display font-medium hover:underline text-lg">
                          {item.productName}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1">{item.productNameBn}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          {item.size && (
                            <span className="text-xs bg-muted px-2 py-1 uppercase font-mono">Size: {item.size}</span>
                          )}
                          {item.color && (
                            <span className="text-xs bg-muted px-2 py-1 uppercase">{item.color}</span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={removeItemMut.isPending}
                        className="text-muted-foreground hover:text-destructive p-1"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-end mt-4">
                      <div className="flex items-center border border-border h-10">
                        <button 
                          onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                          disabled={updateItemMut.isPending}
                          className="w-10 h-full flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <div className="w-10 h-full flex items-center justify-center font-mono text-sm font-medium">
                          {item.quantity}
                        </div>
                        <button 
                          onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                          disabled={updateItemMut.isPending}
                          className="w-10 h-full flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="font-mono font-semibold text-lg">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-muted/10 p-6 border border-border/50 sticky top-24">
              <h3 className="text-lg font-display font-bold uppercase tracking-wider mb-6">Order Summary</h3>
              
              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({cart.itemCount} items)</span>
                  <span className="font-mono">৳{cart.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-xs text-right">Calculated at checkout</span>
                </div>
                <Separator className="bg-border/50" />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="font-mono">৳{cart.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="bg-[#e2136e]/10 border border-[#e2136e]/20 p-3 flex items-center gap-3">
                  <img src="/images/bkash-promo.png" alt="" className="w-8 h-8 rounded-sm object-cover" />
                  <span className="text-xs font-medium text-[#e2136e]">Pay with bKash available</span>
                </div>
                <div className="bg-muted/50 border border-border/50 p-3 flex items-center gap-3">
                  <span className="text-xs font-medium">Cash on Delivery available</span>
                </div>
              </div>

              <Button 
                onClick={() => router.push("/checkout")}
                className="w-full h-14 rounded-none uppercase tracking-widest font-semibold"
              >
                Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

type Step = 1 | 2 | 3;

const DISTRICTS_BOGRA = ["Bogra"];
const DELIVERY_CHARGE_INSIDE = 60;
const DELIVERY_CHARGE_OUTSIDE = 120;
const BKASH_NUMBER = "01998778632";

export function Checkout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: cart, isLoading: cartLoading } = useGetCart();
  const createOrderMut = useCreateOrder();

  const [step, setStep] = useState<Step>(1);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [paymentOption, setPaymentOption] = useState<"delivery_only" | "full">("delivery_only");
  const [senderPhone, setSenderPhone] = useState("");
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    district: "Bogra",
    paymentMethod: "bkash",
  });

  // Auto-fill from logged-in user
  useEffect(() => {
    const user = getUser();
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
      }));
    }
  }, []);

  const isInsideBogra = DISTRICTS_BOGRA.includes(formData.district);
  const deliveryCharge = isInsideBogra ? DELIVERY_CHARGE_INSIDE : DELIVERY_CHARGE_OUTSIDE;
  const subtotal = cart?.total ?? 0;
  const discountAmount = appliedCoupon ? calcDiscount(appliedCoupon, subtotal) : 0;
  const grandTotal = subtotal - discountAmount + deliveryCharge;
  const advanceAmount = paymentOption === "full" ? grandTotal : deliveryCharge;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    const result = await validateCoupon(couponCode, subtotal);
    setCouponLoading(false);
    if (result.valid && result.coupon) {
      setAppliedCoupon(result.coupon);
      const saved = calcDiscount(result.coupon, subtotal);
      toast({ title: `কুপন প্রয়োগ হয়েছে! ৳${saved} ছাড় পেয়েছেন ✓` });
    } else {
      setCouponError(result.error ?? "Invalid coupon");
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const handleStep1Continue = () => {
    if (!formData.name || !formData.phone || !formData.address) {
      toast({ title: "সব ঘর পূরণ করুন", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    setStep(2);
  };

  const handleStep2Continue = () => {
    if (!agreedTerms) {
      toast({ title: "শর্তে সম্মত হন", description: "Please agree to terms of service.", variant: "destructive" });
      return;
    }
    setStep(3);
  };

  const handlePlaceOrder = () => {
    if (!senderPhone) {
      toast({ title: "নম্বর দিন", description: "Please enter the bKash sender number.", variant: "destructive" });
      return;
    }
    const couponNote = appliedCoupon
      ? ` | Coupon: ${appliedCoupon.code} (-৳${discountAmount})`
      : "";
    createOrderMut.mutate(
      {
        data: {
          customerName: formData.name,
          customerPhone: formData.phone,
          customerAddress: formData.address,
          district: formData.district,
          paymentMethod: formData.paymentMethod,
          notes: `bKash sender: ${senderPhone} | Payment option: ${paymentOption}${couponNote}`,
        },
      },
      {
        onSuccess: async (order) => {
          if (appliedCoupon) {
            await incrementCouponUsage(appliedCoupon.id).catch(() => {});
          }
          // Auto-create user profile from order if not logged in
          setUser({ name: formData.name, phone: formData.phone, address: formData.address, district: formData.district });
          // Save order to localStorage
          addUserOrder({
            id: order.id,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            customerAddress: order.customerAddress,
            district: order.district,
            paymentMethod: order.paymentMethod,
            total: order.total,
            deliveryCharge: order.deliveryCharge,
            status: order.status,
            items: order.items,
            notes: order.notes,
            createdAt: order.createdAt,
          });
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({ title: "Order placed!", description: "Your order has been successfully placed." });
          router.push(`/orders/${order.id}`);
        },
        onError: () => {
          toast({ title: "ত্রুটি", description: "অর্ডার দিতে সমস্যা হয়েছে।", variant: "destructive" });
        },
      }
    );
  };

  if (cartLoading) {
    return (
      <Layout hideFooter>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse space-y-4 w-full max-w-sm px-4">
            <div className="h-8 bg-muted rounded" />
            <div className="h-48 bg-muted rounded" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Layout hideFooter>
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center gap-4">
          <p className="text-lg text-muted-foreground">কার্ট খালি আছে</p>
          <Link href="/products">
            <button className="px-6 py-3 text-sm font-semibold uppercase tracking-wider" style={{ backgroundColor: "hsl(25 100% 50%)" }}>
              Shop Now
            </button>
          </Link>
        </div>
      </Layout>
    );
  }

  const StepIndicator = () => (
    <div className="flex items-center gap-2 mb-6">
      {([1, 2, 3] as Step[]).map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
            style={{
              backgroundColor:
                step > s
                  ? "hsl(25 100% 45%)"
                  : step === s
                  ? "hsl(25 100% 50%)"
                  : "hsl(0 20% 18%)",
              color: step >= s ? "white" : "hsl(0 0% 55%)",
            }}
          >
            {step > s ? <Check className="h-4 w-4" /> : s}
          </div>
          {i < 2 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
          )}
        </div>
      ))}
    </div>
  );

  const TotalBar = () => (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex flex-col"
      style={{ backgroundColor: "hsl(0 40% 4%)" }}
    >
      <button
        onClick={() => setOrderDetailsOpen((v) => !v)}
        className="border-t border-border/30"
      >
        <AnimatePresence initial={false}>
          {orderDetailsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-border/30"
            >
              <div className="px-4 py-3 space-y-2">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs text-muted-foreground">
                    <span className="truncate max-w-[60%]">{item.productName} × {item.quantity}</span>
                    <span>৳{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t border-border/30">
                  <span>Delivery</span>
                  <span>৳{deliveryCharge}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs pt-0.5" style={{ color: "hsl(160 80% 55%)" }}>
                    <span>Coupon ({appliedCoupon?.code})</span>
                    <span>-৳{discountAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-muted-foreground">Total</span>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold" style={{ color: "hsl(160 80% 50%)" }}>
              ৳{grandTotal.toLocaleString()}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform ${orderDetailsOpen ? "rotate-180" : ""}`}
            />
          </div>
        </div>
      </button>
      <button
        className="text-xs pb-2 pt-1"
        style={{ color: "hsl(160 80% 50%)" }}
        onClick={() => setOrderDetailsOpen((v) => !v)}
      >
        View order details
      </button>
    </div>
  );

  const inputClass =
    "w-full h-11 px-4 text-sm bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-purple-500 transition-colors rounded-md";

  return (
    <Layout hideFooter>
      <div className="pb-28">
        {/* Breadcrumb */}
        <div className="px-4 py-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
          <ChevronRight className="h-3 w-3" />
          <span style={{ color: "hsl(160 80% 50%)" }}>Checkout</span>
        </div>

        <div className="px-4">
          <StepIndicator />

          <AnimatePresence mode="wait">
            {/* ───── STEP 1: Delivery Address ───── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.22 }}
              >
                <h2 className="text-2xl font-display font-bold text-foreground mb-6">
                  Delivery Address
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Full Name <span className="text-muted-foreground/60">*</span>
                    </label>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                      data-testid="input-full-name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Email <span className="text-muted-foreground/60">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      className={inputClass}
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                      data-testid="input-email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Phone Number <span className="text-muted-foreground/60">*</span>
                    </label>
                    <input
                      type="tel"
                      className={inputClass}
                      placeholder="+880 1234-567890"
                      value={formData.phone}
                      onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                      data-testid="input-phone"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      District
                    </label>
                    <select
                      className={inputClass + " cursor-pointer"}
                      value={formData.district}
                      onChange={(e) => setFormData((p) => ({ ...p, district: e.target.value }))}
                      data-testid="select-district"
                    >
                      <option value="Bogra">Bogra — ৳{DELIVERY_CHARGE_INSIDE}</option>
                      <option value="Outside Bogra">Outside Bogra — ৳{DELIVERY_CHARGE_OUTSIDE}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Full Address <span className="text-muted-foreground/60">*</span>
                    </label>
                    <textarea
                      className={inputClass + " h-24 py-3 resize-none"}
                      placeholder="House, road, area, district — full delivery address"
                      value={formData.address}
                      onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                      data-testid="input-address"
                    />
                  </div>
                </div>

                {/* ── Coupon Code ── */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" style={{ color: "hsl(25 100% 55%)" }} />
                    কুপন কোড <span className="text-muted-foreground/60">(Optional)</span>
                  </label>
                  {appliedCoupon ? (
                    <div
                      className="flex items-center justify-between h-11 px-4 rounded-md border"
                      style={{ backgroundColor: "hsl(160 80% 40% / 0.1)", borderColor: "hsl(25 100% 45%)" }}
                    >
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4" style={{ color: "hsl(160 80% 55%)" }} />
                        <span className="font-mono font-bold text-sm tracking-widest" style={{ color: "hsl(160 80% 55%)" }}>
                          {appliedCoupon.code}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          — ৳{discountAmount} ছাড়
                        </span>
                      </div>
                      <button onClick={handleRemoveCoupon} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className={inputClass + " uppercase font-mono tracking-widest flex-1"}
                        placeholder="COUPON CODE"
                        value={couponCode}
                        onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="px-4 h-11 text-xs font-bold uppercase tracking-wider rounded-md text-white disabled:opacity-40"
                        style={{ backgroundColor: "hsl(25 100% 50%)" }}
                      >
                        {couponLoading ? "..." : "প্রয়োগ"}
                      </button>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-xs mt-1" style={{ color: "hsl(0 70% 60%)" }}>{couponError}</p>
                  )}
                </div>

                <button
                  onClick={handleStep1Continue}
                  className="w-full h-12 mt-6 text-sm font-bold uppercase tracking-widest text-white rounded-md transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, hsl(25 100% 50%), hsl(25 100% 40%))" }}
                  data-testid="button-step1-continue"
                >
                  CONTINUE
                </button>
              </motion.div>
            )}

            {/* ───── STEP 2: Shipping Method ───── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.22 }}
              >
                <h2 className="text-2xl font-display font-bold text-foreground mb-6">
                  Shipping Method
                </h2>

                {/* Steadfast option */}
                <div
                  className="border border-border/50 rounded-md p-4 mb-4 flex items-start gap-3"
                  style={{ backgroundColor: "hsl(0 30% 9%)" }}
                >
                  <div
                    className="w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center"
                    style={{ borderColor: "hsl(25 100% 50%)", backgroundColor: "hsl(25 100% 50%)" }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Steadfast Courier</p>
                    <p className="text-xs text-muted-foreground mt-0.5">fastest couriar service of bangladesh</p>
                    <p className="text-xs text-muted-foreground">2-3 Days</p>
                    <p className="text-sm font-bold mt-1" style={{ color: "hsl(160 80% 50%)" }}>
                      BDT {deliveryCharge}
                    </p>
                  </div>
                </div>

                {/* Terms checkbox */}
                <label
                  className="flex items-start gap-3 border border-border/50 rounded-md p-4 cursor-pointer"
                  style={{ backgroundColor: "hsl(0 30% 9%)" }}
                  data-testid="label-terms"
                >
                  <div
                    className="w-4 h-4 border border-border/60 mt-0.5 shrink-0 flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: agreedTerms ? "hsl(25 100% 50%)" : "transparent",
                      borderColor: agreedTerms ? "hsl(25 100% 50%)" : undefined,
                    }}
                  >
                    {agreedTerms && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    data-testid="checkbox-terms"
                  />
                  <p className="text-sm text-foreground leading-relaxed">
                    I agree the terms of service and will accept them unconditionally.{" "}
                    <span className="text-muted-foreground underline cursor-pointer">more...</span>
                  </p>
                </label>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 h-12 border border-border/60 text-sm font-bold uppercase tracking-widest text-foreground rounded-md hover:bg-muted/30 transition-colors"
                    data-testid="button-step2-back"
                  >
                    BACK
                  </button>
                  <button
                    onClick={handleStep2Continue}
                    className="flex-1 h-12 text-sm font-bold uppercase tracking-widest text-white rounded-md transition-opacity hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, hsl(25 100% 50%), hsl(25 100% 40%))" }}
                    data-testid="button-step2-continue"
                  >
                    CONTINUE
                  </button>
                </div>
              </motion.div>
            )}

            {/* ───── STEP 3: Payment ───── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.22 }}
              >
                <h2 className="text-2xl font-display font-bold text-foreground mb-6">
                  পেমেন্ট
                </h2>

                {/* Payment option: delivery only */}
                <div className="space-y-3 mb-5">
                  <label
                    className="flex items-start gap-3 border rounded-md p-4 cursor-pointer transition-colors"
                    style={{
                      backgroundColor: paymentOption === "delivery_only" ? "hsl(270 30% 15%)" : "hsl(0 30% 9%)",
                      borderColor: paymentOption === "delivery_only" ? "hsl(25 100% 50%)" : "hsl(0 20% 20%)",
                    }}
                    data-testid="label-pay-delivery"
                  >
                    <div
                      className="w-4 h-4 rounded-full border-2 mt-1 shrink-0 flex items-center justify-center"
                      style={{
                        borderColor: paymentOption === "delivery_only" ? "hsl(25 100% 50%)" : "hsl(0 0% 40%)",
                        backgroundColor: paymentOption === "delivery_only" ? "hsl(25 100% 50%)" : "transparent",
                      }}
                    >
                      {paymentOption === "delivery_only" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <input type="radio" className="sr-only" checked={paymentOption === "delivery_only"} onChange={() => setPaymentOption("delivery_only")} />
                    <div>
                      <p className="font-semibold text-foreground text-sm">শুধু ডেলিভারি চার্জ পরিশোধ করুন</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        এখন <span className="font-bold text-foreground">৳{deliveryCharge}</span> দিন, বাকি{" "}
                        <span className="font-bold text-foreground">৳{subtotal}</span> কাশ অন ডেলিভারি (COD)
                      </p>
                    </div>
                  </label>

                  <label
                    className="flex items-start gap-3 border rounded-md p-4 cursor-pointer transition-colors"
                    style={{
                      backgroundColor: paymentOption === "full" ? "hsl(270 30% 15%)" : "hsl(0 30% 9%)",
                      borderColor: paymentOption === "full" ? "hsl(25 100% 50%)" : "hsl(0 20% 20%)",
                    }}
                    data-testid="label-pay-full"
                  >
                    <div
                      className="w-4 h-4 rounded-full border-2 mt-1 shrink-0 flex items-center justify-center"
                      style={{
                        borderColor: paymentOption === "full" ? "hsl(25 100% 50%)" : "hsl(0 0% 40%)",
                        backgroundColor: paymentOption === "full" ? "hsl(25 100% 50%)" : "transparent",
                      }}
                    >
                      {paymentOption === "full" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <input type="radio" className="sr-only" checked={paymentOption === "full"} onChange={() => setPaymentOption("full")} />
                    <div>
                      <p className="font-semibold text-foreground text-sm">সম্পূর্ণ পেমেন্ট অনলাইনে করুন</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        এখন সম্পূর্ণ <span className="font-bold text-foreground">৳{grandTotal}</span> পরিশোধ করুন, ডেলিভারিতে কোনো পেমেন্ট লাগবে না
                      </p>
                      <p className="text-xs mt-1" style={{ color: "hsl(270 70% 75%)" }}>গিফট অর্ডারের জন্য আদর্শ</p>
                    </div>
                  </label>
                </div>

                {/* Payment method */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-foreground mb-1.5">পেমেন্ট পদ্ধতি *</label>
                  <select
                    className={inputClass + " cursor-pointer"}
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData((p) => ({ ...p, paymentMethod: e.target.value }))}
                    data-testid="select-payment-method"
                  >
                    <option value="bkash">বিকাশ (bKash)</option>
                    <option value="nagad">নগদ (Nagad)</option>
                    <option value="cod">ক্যাশ অন ডেলিভারি (COD)</option>
                  </select>
                </div>

                {/* bKash instructions */}
                <div
                  className="rounded-md p-4 mb-4 text-sm leading-relaxed space-y-2"
                  style={{ backgroundColor: "hsl(0 25% 11%)", border: "1px solid hsl(0 20% 20%)" }}
                >
                  <p className="text-foreground">
                    অর্ডারটি কনফার্ম করার জন্য অনুগ্রহ করে নিচর বিকাশ পার্সোনাল নম্বরে{" "}
                    <strong>৳{advanceAmount}</strong> ডেলিভারি চার্জ অগ্রিম{" "}
                    <strong>Send Money</strong> করুন।
                  </p>
                  <div className="border-t border-border/30 pt-2 space-y-1">
                    <p className="text-muted-foreground text-xs">বিকাশ (Personal):</p>
                    <p className="text-lg font-bold tracking-wider" style={{ color: "hsl(330 80% 60%)" }}>
                      {BKASH_NUMBER}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      অগ্রিম পরিশোধ: <span className="text-foreground font-medium">৳{advanceAmount}</span>
                      {paymentOption === "delivery_only" && (
                        <> (ডেলিভারি চার্জ)</>
                      )}
                    </p>
                    {paymentOption === "delivery_only" && (
                      <p className="text-xs text-muted-foreground">
                        বাকি টাকা: <span className="text-foreground font-medium">কাশ অন ডেলিভারি (COD)</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Sender phone */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    যে নম্বর থেকে টাকা পাঠিয়েছেন *
                  </label>
                  <input
                    type="tel"
                    className={inputClass}
                    placeholder="01712345678"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    data-testid="input-sender-phone"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    পেমেন্ট সম্পন্ন হলে যে মোবাইল নম্বর থেকে টাকা পাঠিয়েছেন, সেই নম্বরটি সঠিকভাবে লিখুন।
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 h-12 border border-border/60 text-sm font-bold uppercase tracking-widest text-foreground rounded-md hover:bg-muted/30 transition-colors"
                    data-testid="button-step3-back"
                  >
                    BACK
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={createOrderMut.isPending}
                    className="flex-1 h-12 text-sm font-bold uppercase tracking-widest text-white rounded-md transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, hsl(25 100% 50%), hsl(25 100% 40%))" }}
                    data-testid="button-place-order"
                  >
                    {createOrderMut.isPending ? "..." : "PLACE ORDER"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <TotalBar />
    </Layout>
  );
}

export function Orders() {
  const { data: orders, isLoading } = useListOrders();
  const [user] = useState(getUser);
  const [localOrders] = useState(getUserOrders);
  const loggedIn = isLoggedIn();

  // Merge local + DB orders, filter by phone if logged in
  const allOrders = loggedIn
    ? [
        ...localOrders.filter(o => o.customerPhone === user?.phone),
        ...(orders || []).filter(o => o.customerPhone === user?.phone),
      ]
    : [];
  // Remove duplicates
  const seen = new Set();
  const mergedOrders = allOrders.filter(o => {
    if (seen.has(o.id)) return false;
    seen.add(o.id);
    return true;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto px-4 py-24 animate-pulse">
          <div className="h-12 bg-muted w-1/3 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted w-full" />)}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-5xl mx-auto px-4 py-12 md:py-24">
        <h1 className="text-3xl md:text-5xl font-display font-bold uppercase tracking-tighter mb-2">
          Your Orders
        </h1>
        <p className="text-muted-foreground mb-12">Your orders and tracking</p>

        {/* Not logged in — show login */}
        {!loggedIn ? (
          <div className="text-center py-20 border border-border rounded-lg" style={{ backgroundColor: "hsl(0 30% 7%)" }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "hsl(25 100% 50% / 0.15)" }}>
              <Phone className="h-7 w-7" style={{ color: "hsl(25 100% 55%)" }} />
            </div>
            <h2 className="text-xl font-semibold mb-2 uppercase tracking-wide">Login to view orders</h2>
            <p className="text-muted-foreground mb-8">Enter your phone to track your orders</p>
            <Link href="/login">
              <Button size="lg" className="rounded-none uppercase tracking-widest px-8">
                Login
              </Button>
            </Link>
          </div>
        ) : mergedOrders.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 border border-border">
            <h2 className="text-xl font-semibold mb-2 uppercase tracking-wide">No orders yet</h2>
            <p className="text-muted-foreground mb-8">You haven't placed any orders yet.</p>
            <Link href="/products">
              <Button size="lg" className="rounded-none uppercase tracking-widest px-8">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {mergedOrders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-card border border-border hover:border-primary/50 transition-colors p-6"
              >
                <div className="flex flex-col md:flex-row gap-6 justify-between md:items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-mono font-bold text-lg">#{typeof order.id === 'number' ? order.id.toString().padStart(6, '0') : order.id}</h3>
                      <Badge variant={
                        order.status === 'pending' ? 'secondary' : 
                        order.status === 'processing' ? 'default' : 
                        order.status === 'shipped' ? 'default' : 
                        order.status === 'delivered' ? 'outline' : 'destructive'
                      } className="uppercase tracking-wider text-[10px]">
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {format(new Date(order.createdAt), "PPP")}
                    </p>
                    <p className="text-sm">
                      {order.items.length} item(s) • Total: <span className="font-mono font-semibold">৳{order.total.toLocaleString()}</span>
                    </p>
                  </div>
                  
                  <div className="text-right flex items-center justify-between md:flex-col gap-4">
                    <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                      {order.paymentMethod === 'bkash' ? 'bKash' : 'Cash on Delivery'}
                    </span>
                    <Button variant="ghost" className="uppercase text-xs tracking-widest rounded-none">
                      View Details &rarr;
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export function OrderDetail() {
  const params = useNextParams();
  const id = params.id as string;
  const orderId = Number(id);
  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!id }
  });
  const { toast } = useToast();
  const [userRating, setUserRating] = useState(0);
  const [ratingSent, setRatingSent] = useState(false);

  const submitRating = async (rating: number) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/rating`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      if (!res.ok) throw new Error("Failed");
      setRatingSent(true);
      toast({ title: `Rated ${rating} stars!` });
    } catch {
      toast({ title: "Failed to rate", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto px-4 py-24 animate-pulse">
          <div className="h-8 bg-muted w-1/4 mb-8" />
          <div className="h-64 bg-muted w-full" />
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold mb-4">Order not found</h1>
          <Link href="/orders">
            <Button variant="outline" className="rounded-none">Back to Orders</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-12 md:py-24">
        <Link href="/orders" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 uppercase tracking-widest">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-display font-bold uppercase tracking-tighter mb-2">
              Order #{order.id.toString().padStart(6, '0')}
            </h1>
            <p className="text-muted-foreground">
              Placed on {format(new Date(order.createdAt), "PPP")}
            </p>
          </div>
          <Badge variant={
            order.status === 'pending' ? 'secondary' : 
            order.status === 'processing' ? 'default' : 
            order.status === 'shipped' ? 'default' : 
            order.status === 'delivered' ? 'outline' : 'destructive'
          } className="text-sm px-4 py-1 uppercase tracking-wider rounded-none">
            {order.status}
          </Badge>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          <div className="md:col-span-2 space-y-8">
            <div className="bg-muted/10 border border-border/50 p-6">
              <h2 className="font-display font-bold uppercase tracking-wider mb-6 border-b border-border/50 pb-2">Items</h2>
              <div className="space-y-6">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start gap-4">
                    <div>
                      <Link href={`/products/${item.productId}`} className="font-display font-medium hover:underline">
                        {item.productName}
                      </Link>
                      <div className="text-sm text-muted-foreground mt-1">
                        {item.size && `Size: ${item.size} `}
                        {item.color && `| Color: ${item.color}`}
                      </div>
                      <div className="text-sm mt-1 font-mono">
                        ৳{item.price.toLocaleString()} x {item.quantity}
                      </div>
                    </div>
                    <div className="font-mono font-semibold">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-muted/10 border border-border/50 p-6">
              <h2 className="font-display font-bold uppercase tracking-wider mb-6 border-b border-border/50 pb-2">Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono">৳{(order.total - order.deliveryCharge).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-mono">৳{order.deliveryCharge.toLocaleString()}</span>
                </div>
                <Separator className="bg-border/50 my-2" />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="font-mono">৳{order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-card border border-border/50 p-6">
              <h2 className="font-display font-bold uppercase tracking-wider mb-4 border-b border-border/50 pb-2 text-sm">Customer Info</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">Name</p>
                  <p className="font-medium">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">Phone</p>
                  <p className="font-medium">{order.customerPhone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">Payment Method</p>
                  <p className="font-medium uppercase">{order.paymentMethod}</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border/50 p-6">
              <h2 className="font-display font-bold uppercase tracking-wider mb-4 border-b border-border/50 pb-2 text-sm">Shipping Address</h2>
              <div className="space-y-1 text-sm">
                <p>{order.customerAddress}</p>
                <p>{order.district}</p>
                <p>Bangladesh</p>
              </div>
            </div>

            {order.notes && (
              <div className="bg-card border border-border/50 p-6">
                <h2 className="font-display font-bold uppercase tracking-wider mb-4 border-b border-border/50 pb-2 text-sm">Order Notes</h2>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </div>
            )}

            {/* Rate Order - only for delivered orders */}
            {order.status === "delivered" && !order.rating && !ratingSent && (
              <div className="bg-card border border-border/50 p-6">
                <h2 className="font-display font-bold uppercase tracking-wider mb-4 border-b border-border/50 pb-2 text-sm">Rate Your Order</h2>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => { setUserRating(star); submitRating(star); }}
                      onMouseEnter={() => setUserRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className="h-8 w-8"
                        style={{ color: star <= userRating ? "hsl(25 100% 55%)" : "hsl(0 20% 25%)" }}
                        fill={star <= userRating ? "hsl(25 100% 55%)" : "none"}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Click a star to rate your order</p>
              </div>
            )}
            {order.rating && (
              <div className="bg-card border border-border/50 p-6">
                <h2 className="font-display font-bold uppercase tracking-wider mb-4 border-b border-border/50 pb-2 text-sm">Your Rating</h2>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-5 w-5"
                      style={{ color: star <= order.rating ? "hsl(25 100% 55%)" : "hsl(0 20% 25%)" }}
                      fill={star <= order.rating ? "hsl(25 100% 55%)" : "none"}
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium">{order.rating}/5</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

const STATUS_COLORS: Record<string, string> = {
  pending: "hsl(25 100% 50%)",
  confirmed: "hsl(210 100% 55%)",
  shipped: "hsl(270 70% 60%)",
  delivered: "hsl(160 80% 45%)",
  cancelled: "hsl(0 70% 50%)",
};

interface CustomerStats {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  fraudScore: number;
  avgRating: number;
  totalSpent: number;
  orders: any[];
}

export function TrackOrder() {
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [searched, setSearched] = useState(false);

  const { data: allOrders } = useListOrders();
  const localOrders = getUserOrders();

  const handleSearch = async () => {
    if (!phone.trim() || phone.length < 11) {
      toast({ title: "Enter valid phone number", variant: "destructive" });
      return;
    }
    setSearching(true);
    setSearched(false);

    // Fetch customer stats from API
    let apiStats: CustomerStats | null = null;
    try {
      const res = await fetch(`/api/orders/customer/${encodeURIComponent(phone.trim())}`);
      if (res.ok) apiStats = await res.json();
    } catch { /* ignore */ }

    // Search in local orders
    const local = localOrders.filter((o) => o.customerPhone === phone.trim());

    // Merge API + local orders
    const apiOrders = apiStats?.orders || [];
    const merged = [...local, ...apiOrders];
    const seen = new Set();
    const unique = merged.filter((o) => {
      if (seen.has(o.id)) return false;
      seen.add(o.id);
      return true;
    });

    setResults(unique.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setStats(apiStats);
    setSearching(false);
    setSearched(true);
  };

  const inputCls = "w-full h-12 px-4 text-sm bg-muted/20 border border-border/50 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-orange-500 rounded-md";

  return (
    <Layout>
      <div className="container max-w-3xl mx-auto px-4 py-8 md:py-16">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 uppercase tracking-widest">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Link>

        <h1 className="text-2xl md:text-4xl font-display font-bold uppercase tracking-tighter mb-2">
          Track Order
        </h1>
        <p className="text-muted-foreground mb-8">
          Enter your phone number to check order status
        </p>

        {/* Search */}
        <div className="flex gap-2 mb-8">
          <input
            type="tel"
            className={inputCls + " flex-1"}
            placeholder="01XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            maxLength={11}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-5 h-12 text-sm font-bold uppercase tracking-wider text-white rounded-md flex items-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: "hsl(25 100% 50%)" }}
          >
            <Search className="h-4 w-4" />
            {searching ? "..." : "Search"}
          </button>
        </div>

        {/* Results */}
        <AnimatePresence>
          {searched && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {results.length === 0 ? (
                <div className="text-center py-16 border border-border/40 rounded-lg" style={{ backgroundColor: "hsl(0 30% 7%)" }}>
                  <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">No orders found for this number</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Customer Reputation Card */}
                  {stats && (
                    <div className="border border-border/40 rounded-lg p-5" style={{ backgroundColor: "hsl(0 30% 7%)" }}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: stats.fraudScore > 2 ? "hsl(0 70% 50% / 0.2)" : stats.fraudScore > 0 ? "hsl(25 100% 50% / 0.2)" : stats.totalOrders > 5 ? "hsl(160 80% 45% / 0.2)" : "hsl(210 100% 55% / 0.2)" }}>
                          {stats.fraudScore > 0 ? (
                            <AlertTriangle className="h-5 w-5" style={{ color: stats.fraudScore > 2 ? "hsl(0 70% 50%)" : "hsl(25 100% 55%)" }} />
                          ) : (
                            <Shield className="h-5 w-5" style={{ color: stats.totalOrders > 5 ? "hsl(160 80% 45%)" : "hsl(210 100% 55%)" }} />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">
                            {stats.fraudScore > 2 ? "High Risk Customer" :
                             stats.fraudScore > 0 ? "Medium Risk Customer" :
                             stats.totalOrders > 5 ? "Verified Customer" : "New Customer"}
                          </p>
                          <p className="text-xs text-muted-foreground">{stats.totalOrders} orders · ৳{stats.totalSpent.toLocaleString()} spent</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center p-2 rounded-md" style={{ backgroundColor: "hsl(0 20% 12%)" }}>
                          <p className="font-semibold" style={{ color: "hsl(160 80% 55%)" }}>{stats.completedOrders}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">Completed</p>
                        </div>
                        <div className="text-center p-2 rounded-md" style={{ backgroundColor: "hsl(0 20% 12%)" }}>
                          <p className="font-semibold" style={{ color: "hsl(0 70% 60%)" }}>{stats.cancelledOrders}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">Cancelled</p>
                        </div>
                        <div className="text-center p-2 rounded-md" style={{ backgroundColor: "hsl(0 20% 12%)" }}>
                          <div className="flex items-center justify-center gap-0.5">
                            <Star className="h-3 w-3" style={{ color: "hsl(25 100% 55%)" }} />
                            <p className="font-semibold">{stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "N/A"}</p>
                          </div>
                          <p className="text-[10px] text-muted-foreground uppercase">Avg Rating</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground mb-4">
                    {results.length} order(s) found
                  </p>
                  {results.map((order) => (
                    <div
                      key={order.id}
                      className="border border-border/40 rounded-lg p-5"
                      style={{ backgroundColor: "hsl(0 30% 7%)" }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-mono font-bold text-lg text-foreground">
                              #{order.id}
                            </span>
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-medium uppercase"
                              style={{
                                backgroundColor: `${STATUS_COLORS[order.status] ?? "hsl(0 20% 25%)"}22`,
                                color: STATUS_COLORS[order.status] ?? "inherit",
                              }}
                            >
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(order.createdAt), "PPP")}
                          </p>
                        </div>
                        <span className="font-mono font-bold text-foreground">
                          ৳{order.total.toLocaleString()}
                        </span>
                      </div>

                      {/* Status Timeline */}
                      <div className="flex items-center gap-1 mb-4">
                        {["pending", "confirmed", "shipped", "delivered"].map((s, i) => {
                          const reached = [
                            "pending", "confirmed", "shipped", "delivered"
                          ].indexOf(order.status) >= i;
                          return (
                            <div key={s} className="flex items-center gap-1 flex-1">
                              <div className="flex flex-col items-center gap-1 flex-1">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor: reached
                                      ? STATUS_COLORS[s]
                                      : "hsl(0 20% 20%)",
                                  }}
                                />
                                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                                  {s}
                                </span>
                              </div>
                              {i < 3 && (
                                <div
                                  className="h-0.5 flex-1"
                                  style={{
                                    backgroundColor: reached
                                      ? STATUS_COLORS[s]
                                      : "hsl(0 20% 20%)",
                                  }}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Items */}
                      <div className="space-y-2 border-t border-border/30 pt-3">
                        {(order.items || []).map((item: any) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {item.productName} x {item.quantity}
                            </span>
                            <span className="font-mono">৳{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      {/* Address */}
                      <div className="flex items-start gap-2 mt-3 pt-3 border-t border-border/30 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                        <span>{order.customerAddress}, {order.district}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}

export function Login() {
  const router = useRouter();
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Check if already logged in
  const existing = getUser();
  if (existing) {
    return (
      <Layout hideFooter>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: "hsl(160 80% 40% / 0.15)" }}>
            <Phone className="h-8 w-8" style={{ color: "hsl(160 80% 55%)" }} />
          </div>
          <h2 className="text-xl font-display font-bold text-foreground">Welcome Back!</h2>
          <p className="text-muted-foreground text-sm">
            Logged in as <strong>{existing.phone}</strong>
          </p>
          <button
            onClick={() => router.push("/orders")}
            className="px-6 py-3 text-sm font-bold uppercase tracking-widest text-white rounded-md mt-4"
            style={{ background: "linear-gradient(135deg, hsl(25 100% 50%), hsl(25 100% 40%))" }}
          >
            View Orders
          </button>
        </div>
      </Layout>
    );
  }

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || phone.length < 11) {
      toast({ title: "Enter valid phone number", variant: "destructive" });
      return;
    }
    setStep(2);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUser({ name: name.trim(), phone: phone.trim() });
    setLoading(false);
    toast({ title: "Welcome! Login successful" });
    router.push("/orders");
  };

  const inputCls = "w-full h-12 px-4 text-sm bg-muted/20 border border-border/50 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-purple-500 rounded-md";

  return (
    <Layout hideFooter>
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "hsl(25 100% 50% / 0.15)" }}>
              <Phone className="h-8 w-8" style={{ color: "hsl(25 100% 55%)" }} />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground mb-1">
              {step === 1 ? "Enter Phone" : "Your Name"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {step === 1 ? "Enter your phone to login" : "What should we call you?"}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  className={inputCls}
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  maxLength={11}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full h-12 text-sm font-bold uppercase tracking-widest text-white rounded-md flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, hsl(25 100% 50%), hsl(25 100% 40%))" }}
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-sm font-bold uppercase tracking-widest text-white rounded-md disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, hsl(25 100% 50%), hsl(25 100% 40%))" }}
              >
                {loading ? "Saving..." : "Save & Login"}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full h-12 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Back
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Did you forget to add the page to the router?
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
