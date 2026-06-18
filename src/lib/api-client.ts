// Stub API client — replaces @workspace/api-client-react to allow development without the generated workspace package
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// --- Types ---

export interface Product {
  id: number;
  name: string;
  nameBn?: string;
  description?: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  images?: string[];
  categoryId?: number;
  categoryName?: string;
  sizes?: string[];
  colors?: string[];
  stock?: number;
  featured?: boolean;
  trending?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  nameBn?: string;
  imageUrl?: string;
}

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  imageUrl?: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  district: string;
  paymentMethod: string;
  total: number;
  deliveryCharge: number;
  status: string;
  items: OrderItem[];
  notes?: string;
  rating?: number;
  createdAt: string;
}

export interface CreateOrderData {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  district: string;
  paymentMethod: string;
  notes?: string;
}

export interface CreateProductData {
  name: string;
  nameBn?: string;
  description?: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  images?: string[];
  categoryId?: number;
  sizes?: string[];
  colors?: string[];
  stock?: number;
  featured?: boolean;
  trending?: boolean;
}

export interface UpdateProductData {
  name?: string;
  nameBn?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  imageUrl?: string;
  images?: string[];
  categoryId?: number;
  sizes?: string[];
  colors?: string[];
  stock?: number;
  featured?: boolean;
  trending?: boolean;
}

export interface CreateCategoryData {
  name: string;
  nameBn?: string;
  imageUrl?: string;
}

export interface Coupon {
  id: number;
  code: string;
  discountType: "fixed" | "percentage";
  discountValue: number;
  minOrder?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount?: number;
  validFrom?: string;
  validUntil?: string;
  active?: boolean;
}

export interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

export interface User {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  district?: string;
  orders?: number;
}

// --- API functions ---

const API_BASE = "/api";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

async function patch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH ${path} failed: ${res.status}`);
  return res.json();
}

async function del<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`);
  return res.json();
}

// --- Query hooks ---

export function useGetFeaturedProducts() {
  return useQuery({ queryKey: ["featuredProducts"], queryFn: () => get<Product[]>("/products?featured=true") });
}

export function useGetTrendingProducts() {
  return useQuery({ queryKey: ["trendingProducts"], queryFn: () => get<Product[]>("/products?trending=true") });
}

export function useGetProduct(id: number) {
  return useQuery({ queryKey: ["product", id], queryFn: () => get<Product>(`/products/${id}`), enabled: !!id });
}

export function useListProducts(opts?: { categoryId?: number | null; search?: string; featured?: boolean }) {
  const params = new URLSearchParams();
  if (opts?.categoryId) params.set("categoryId", String(opts.categoryId));
  if (opts?.search) params.set("search", opts.search);
  if (opts?.featured) params.set("featured", "true");
  const query = params.toString() ? `?${params.toString()}` : "";
  return useQuery({ queryKey: ["products", opts], queryFn: () => get<Product[]>(`/products${query}`) });
}

export function useListCategories() {
  return useQuery({ queryKey: ["categories"], queryFn: () => get<Category[]>("/categories") });
}

export function useGetCart() {
  return useQuery({ queryKey: ["cart"], queryFn: () => get<Cart>("/cart") });
}

export function useGetOrder(id: number, opts?: { query?: { enabled?: boolean } }) {
  return useQuery({ queryKey: ["order", id], queryFn: () => get<Order>(`/orders/${id}`), enabled: opts?.query?.enabled !== false && !!id });
}

export function useListOrders() {
  return useQuery({ queryKey: ["orders"], queryFn: () => get<Order[]>("/orders") });
}

export function useGetStats() {
  return useQuery({ queryKey: ["stats"], queryFn: () => get<Stats>("/stats") });
}

export function useGetUsers() {
  return useQuery({ queryKey: ["users"], queryFn: () => get<User[]>("/users") });
}

export function useGetCoupons() {
  return useQuery({ queryKey: ["coupons"], queryFn: () => get<Coupon[]>("/coupons") });
}

// --- Query keys ---

export function getGetCartQueryKey() { return ["cart"]; }
export function getGetStatsQueryKey() { return ["stats"]; }
export function getListOrdersQueryKey() { return ["orders"]; }
export function getListProductsQueryKey() { return ["products"]; }
export function getListCategoriesQueryKey() { return ["categories"]; }

// --- Mutation hooks ---

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { productId: number; quantity: number; size?: string; color?: string }) =>
      post<CartItem>("/cart/items", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: number; quantity: number }) =>
      patch<CartItem>(`/cart/items/${data.id}`, { quantity: data.quantity }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => del(`/cart/items/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: CreateOrderData }) => post<Order>("/orders", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { status: string } }) =>
      patch<Order>(`/orders/${id}/status`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: CreateProductData }) => post<Product>("/products", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductData }) =>
      patch<Product>(`/products/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => del(`/products/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: CreateCategoryData }) => post<Category>("/categories", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Coupon> }) =>
      patch<Coupon>(`/coupons/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupons"] }),
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => del(`/coupons/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupons"] }),
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: Partial<Coupon> }) => post<Coupon>("/coupons", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupons"] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) =>
      patch<User>(`/users/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateStoreSettings() {
  return useMutation({
    mutationFn: ({ data }: { data: Record<string, unknown> }) =>
      patch("/settings", data),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Category> }) =>
      patch<Category>(`/categories/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => del(`/categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}
