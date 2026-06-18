import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetCart,
  useUpdateCartItem,
  useRemoveCartItem,
  getGetCartQueryKey,
} from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: cart } = useGetCart();
  const updateItemMut = useUpdateCartItem();
  const removeItemMut = useRemoveCartItem();

  const handleUpdateQuantity = (id: number, current: number, delta: number) => {
    const next = current + delta;
    if (next < 1) return;
    updateItemMut.mutate(
      { id, data: { quantity: next } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }) }
    );
  };

  const handleRemove = (id: number) => {
    removeItemMut.mutate(
      { id },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }) }
    );
  };

  const handleCheckout = () => {
    onClose();
    router.push("/checkout");
  };

  const handleContinueShopping = () => {
    onClose();
    router.push("/products");
  };

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-black/60"
            onClick={onClose}
            data-testid="cart-backdrop"
          />

          {/* Drawer panel */}
          <motion.div
            key="cart-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-[400px] flex flex-col shadow-2xl"
            style={{ backgroundColor: "hsl(0 30% 7%)" }}
            data-testid="cart-drawer"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <h2 className="text-lg font-display font-bold tracking-tight text-foreground">
                Your Cart
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-muted/40 rounded-sm transition-colors text-muted-foreground hover:text-foreground"
                data-testid="cart-drawer-close"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto">
              {isEmpty ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
                  <p className="font-medium text-muted-foreground">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground/60">আপনার কার্টে কোনো পণ্য নেই</p>
                  <button
                    onClick={handleContinueShopping}
                    className="mt-2 text-sm underline text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-3 p-4" data-testid={`cart-item-${item.id}`}>
                      {/* Image */}
                      <div className="w-[72px] aspect-[3/4] bg-muted/30 shrink-0 overflow-hidden">
                        <img
                          src={item.productImageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold leading-snug text-foreground line-clamp-2">
                              {item.productName}
                            </p>
                            {item.size && (
                              <p className="text-xs text-muted-foreground mt-0.5">{item.size}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-0.5">
                              ৳{item.price.toLocaleString()} × {item.quantity}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                            ৳{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-border/50 h-8">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                              disabled={updateItemMut.isPending}
                              className="w-8 h-full flex items-center justify-center hover:bg-muted/40 transition-colors"
                              data-testid={`cart-item-minus-${item.id}`}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 h-full flex items-center justify-center text-xs font-mono font-semibold border-x border-border/50">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                              disabled={updateItemMut.isPending}
                              className="w-8 h-full flex items-center justify-center hover:bg-muted/40 transition-colors"
                              data-testid={`cart-item-plus-${item.id}`}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemove(item.id)}
                            disabled={removeItemMut.isPending}
                            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                            data-testid={`cart-item-remove-${item.id}`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {!isEmpty && (
              <div
                className="border-t border-border/40 px-5 pt-4 pb-6 space-y-4"
                style={{ backgroundColor: "hsl(0 35% 5%)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Subtotal</span>
                  <span className="text-base font-bold text-foreground">
                    ৳{cart.total.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Shipping and taxes calculated at checkout
                </p>

                <button
                  onClick={handleCheckout}
                  className="w-full h-12 flex items-center justify-center text-sm font-bold uppercase tracking-widest transition-colors text-foreground"
                  style={{ backgroundColor: "hsl(0 30% 16%)", border: "1px solid hsl(0 0% 30%)" }}
                  data-testid="cart-checkout-button"
                >
                  CHECKOUT
                </button>

                <button
                  onClick={handleContinueShopping}
                  className="w-full text-xs text-center text-muted-foreground hover:text-foreground transition-colors py-1"
                  data-testid="cart-continue-shopping"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
