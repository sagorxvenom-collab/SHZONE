import Link from "next/link";
import { motion } from "framer-motion";
import { Product } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const isDiscounted = product.originalPrice && product.originalPrice > product.price;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="group relative flex flex-col gap-3"
    >
      <Link href={`/products/${product.id}`} className="relative aspect-[3/4] overflow-hidden bg-muted block">
        {product.isNew && (
          <Badge className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground uppercase rounded-none text-[10px] tracking-wider px-2 py-0.5">
            New
          </Badge>
        )}
        {isDiscounted && (
          <Badge variant="destructive" className="absolute top-2 right-2 z-10 uppercase rounded-none text-[10px] tracking-wider px-2 py-0.5">
            Sale
          </Badge>
        )}
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>
      
      <div className="flex flex-col gap-1 px-1">
        <div className="flex justify-between items-start">
          <Link href={`/products/${product.id}`} className="font-display font-medium text-base hover:underline line-clamp-1">
            {product.name}
          </Link>
        </div>
        <p className="text-xs text-muted-foreground font-sans line-clamp-1">{product.nameBn}</p>
        <div className="flex items-center gap-2 mt-1 font-mono text-sm">
          <span className="font-semibold text-primary">৳{product.price.toLocaleString()}</span>
          {isDiscounted && (
            <span className="text-muted-foreground line-through text-xs">৳{product.originalPrice?.toLocaleString()}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
