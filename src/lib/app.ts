// ============================================================
// src/lib/app.ts - Consolidated library module
// Merges: user-auth.ts, admin-auth.ts, firebase-db.ts, imgbb.ts
// ============================================================

// ─── firebase-db.ts ───────────────────────────────────────────────────────────

import { auth, db, googleProvider } from "./firebase";
import { ref, get, set, push, update, remove, onValue, off, DataSnapshot } from "firebase/database";
import { signInWithPopup, signOut, onAuthStateChanged, User as FbUser } from "firebase/auth";

export interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "flat";
  discount: number;
  minOrder: number;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export interface SiteSettings {
  whatsappNumber: string;
  phoneNumber: string;
  messengerLink: string;
  showWhatsapp: boolean;
  showPhone: boolean;
  showMessenger: boolean;
  showCod: boolean;
  showBkash: boolean;
  showNagad: boolean;
  showBankTransfer: boolean;
  bkashNumber: string;
  nagadNumber: string;
  bankAccount: string;
  bankDetails: string;
  siteName: string;
  siteLogo: string;
  bannerImage: string;
  freeShippingThreshold: number;
  contactEmail: string;
  address: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  businessHours: string;
  adminLogo: string;
  adminBanner: string;
  deliveryChargeInside: number;
  deliveryChargeOutside: number;
  deliveryBaseCity: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  whatsappNumber: "8801998778632",
  phoneNumber: "01998778632",
  messengerLink: "https://m.me/shzone",
  showWhatsapp: true,
  showPhone: true,
  showMessenger: true,
  showCod: true,
  showBkash: true,
  showNagad: true,
  showBankTransfer: false,
  bkashNumber: "01998778632",
  nagadNumber: "01998778632",
  bankAccount: "",
  bankDetails: "",
  siteName: "SHZONE",
  siteLogo: "",
  bannerImage: "",
  freeShippingThreshold: 5000,
  contactEmail: "shzone@example.com",
  address: "Bogra, Bangladesh",
  facebookUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
  businessHours: "Sat-Thu: 10AM - 8PM",
  adminLogo: "",
  adminBanner: "",
  deliveryChargeInside: 60,
  deliveryChargeOutside: 120,
  deliveryBaseCity: "Bogra",
};

// ── Coupons

export async function getAllCoupons(): Promise<Coupon[]> {
  const snap = await get(ref(db, "coupons"));
  if (!snap.exists()) return [];
  const data = snap.val() as Record<string, Omit<Coupon, "id">>;
  return Object.entries(data).map(([id, c]) => ({ id, ...c }));
}

export function subscribeCoupons(cb: (coupons: Coupon[]) => void) {
  const r = ref(db, "coupons");
  const handler = (snap: DataSnapshot) => {
    if (!snap.exists()) { cb([]); return; }
    const data = snap.val() as Record<string, Omit<Coupon, "id">>;
    cb(Object.entries(data).map(([id, c]) => ({ id, ...c })));
  };
  onValue(r, handler);
  return () => off(r, "value", handler);
}

export async function createCoupon(coupon: Omit<Coupon, "id" | "usedCount" | "createdAt">): Promise<string> {
  const r = push(ref(db, "coupons"));
  await set(r, { ...coupon, code: coupon.code.toUpperCase().trim(), usedCount: 0, createdAt: new Date().toISOString() });
  return r.key!;
}

export async function updateCoupon(id: string, data: Partial<Omit<Coupon, "id" | "createdAt">>): Promise<void> {
  if (data.code) data.code = data.code.toUpperCase().trim();
  await update(ref(db, `coupons/${id}`), data);
}

export async function deleteCoupon(id: string): Promise<void> {
  await remove(ref(db, `coupons/${id}`));
}

export async function validateCoupon(code: string, orderTotal: number): Promise<{ valid: boolean; coupon?: Coupon; error?: string }> {
  const snap = await get(ref(db, "coupons"));
  if (!snap.exists()) return { valid: false, error: "Invalid coupon code" };
  const data = snap.val() as Record<string, Omit<Coupon, "id">>;
  const entry = Object.entries(data).find(([, c]) => c.code === code.toUpperCase().trim());
  if (!entry) return { valid: false, error: "Coupon কোড সঠিক নয়" };
  const [id, c] = entry;
  const coupon: Coupon = { id, ...c };
  if (!coupon.isActive) return { valid: false, error: "এই কুপন সক্রিয় নয়" };
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return { valid: false, error: "কুপনের মেয়াদ শেষ হয়ে গেছে" };
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return { valid: false, error: "কুপনের ব্যবহার সীমা শেষ" };
  if (orderTotal < coupon.minOrder) return { valid: false, error: `ন্যূনতম অর্ডার ৳${coupon.minOrder} হতে হবে` };
  return { valid: true, coupon };
}

export async function incrementCouponUsage(id: string): Promise<void> {
  const snap = await get(ref(db, `coupons/${id}/usedCount`));
  const current = snap.exists() ? (snap.val() as number) : 0;
  await set(ref(db, `coupons/${id}/usedCount`), current + 1);
}

export function calcDiscount(coupon: Coupon, subtotal: number): number {
  if (coupon.discountType === "percentage") return Math.round((subtotal * coupon.discount) / 100);
  return Math.min(coupon.discount, subtotal);
}

// ── Site Settings

export async function getSiteSettings(): Promise<SiteSettings> {
  const snap = await get(ref(db, "settings"));
  if (!snap.exists()) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...(snap.val() as Partial<SiteSettings>) };
}

export function subscribeSettings(cb: (s: SiteSettings) => void) {
  const r = ref(db, "settings");
  const handler = (snap: DataSnapshot) => {
    cb(snap.exists() ? { ...DEFAULT_SETTINGS, ...snap.val() } : DEFAULT_SETTINGS);
  };
  onValue(r, handler);
  return () => off(r, "value", handler);
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  await set(ref(db, "settings"), settings);
}

// ─── user-auth.ts ──────────────────────────────────────────────────────────────────

const USER_KEY = "shzone_user";
const USER_ORDERS_KEY = "shzone_user_orders";

export interface User {
  name: string;
  phone: string;
  address?: string;
  district?: string;
}

export interface LocalOrder {
  id: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  district: string;
  paymentMethod: string;
  total: number;
  deliveryCharge: number;
  status: string;
  items: { id: number; productId: number; productName: string; price: number; quantity: number; size?: string; color?: string }[];
  notes?: string;
  createdAt: string;
}

function _storage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function getUser(): User | null {
  const raw = _storage()?.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as User; } catch { return null; }
}

export function setUser(user: User): void {
  _storage()?.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser(): void {
  _storage()?.removeItem(USER_KEY);
}

export function getUserOrders(): LocalOrder[] {
  const raw = _storage()?.getItem(USER_ORDERS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as LocalOrder[]; } catch { return []; }
}

export function addUserOrder(order: LocalOrder): void {
  const orders = getUserOrders();
  orders.unshift(order);
  _storage()?.setItem(USER_ORDERS_KEY, JSON.stringify(orders));
}

export function clearUserOrders(): void {
  _storage()?.removeItem(USER_ORDERS_KEY);
}

export function isLoggedIn(): boolean {
  return !!getUser();
}

// ─── admin-auth.ts ──────────────────────────────────────────────────────────────────

const OWNER_EMAIL = "sagor.x.venom@gmail.com";

export interface AdminUser {
  email: string;
  name: string;
  photo: string;
  isOwner: boolean;
  isActive: boolean;
  addedAt: string;
  addedBy: string;
}

export async function adminGoogleLogin() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export function adminLogout() {
  return signOut(auth);
}

export function subscribeAdminAuth(callback: (user: FbUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function isAdminEmail(email: string): Promise<{ isAdmin: boolean; isOwner: boolean; adminData?: AdminUser }> {
  const snap = await get(ref(db, `admins/${encodeKey(email)}`));
  if (!snap.exists()) return { isAdmin: false, isOwner: false };
  const data = snap.val() as AdminUser;
  return { isAdmin: data.isActive, isOwner: data.isOwner, adminData: data };
}

export function subscribeAdminAuthStatus(email: string, callback: (status: { isAdmin: boolean; isOwner: boolean; adminData?: AdminUser }) => void) {
  const r = ref(db, `admins/${encodeKey(email)}`);
  const handler = (snap: any) => {
    if (!snap.exists()) { callback({ isAdmin: false, isOwner: false }); return; }
    const data = snap.val() as AdminUser;
    callback({ isAdmin: data.isActive, isOwner: data.isOwner, adminData: data });
  };
  onValue(r, handler);
  return () => off(r, "value", handler);
}

export async function seedOwner() {
  const snap = await get(ref(db, `admins/${encodeKey(OWNER_EMAIL)}`));
  if (snap.exists()) return;
  await set(ref(db, `admins/${encodeKey(OWNER_EMAIL)}`), {
    email: OWNER_EMAIL, name: "Owner", photo: "", isOwner: true, isActive: true,
    addedAt: new Date().toISOString(), addedBy: "system",
  });
}

export async function addAdmin(email: string, addedBy: string) {
  const clean = email.trim().toLowerCase();
  await set(ref(db, `admins/${encodeKey(clean)}`), {
    email: clean, name: "", photo: "", isOwner: false, isActive: true,
    addedAt: new Date().toISOString(), addedBy,
  });
}

export async function removeAdmin(email: string) {
  if (email.toLowerCase() === OWNER_EMAIL) return;
  await set(ref(db, `admins/${encodeKey(email)}`), null);
}

export async function toggleAdminActive(email: string, active: boolean) {
  if (email.toLowerCase() === OWNER_EMAIL) return;
  await set(ref(db, `admins/${encodeKey(email)}/isActive`), active);
}

export async function getAllAdmins(): Promise<AdminUser[]> {
  const snap = await get(ref(db, "admins"));
  if (!snap.exists()) return [];
  const data = snap.val() as Record<string, AdminUser>;
  return Object.values(data);
}

export function subscribeAdmins(callback: (admins: AdminUser[]) => void) {
  const r = ref(db, "admins");
  const handler = (snap: any) => {
    if (!snap.exists()) { callback([]); return; }
    const data = snap.val() as Record<string, AdminUser>;
    callback(Object.values(data));
  };
  onValue(r, handler);
  return () => off(r, "value", handler);
}

function encodeKey(email: string) {
  return email.replace(/\./g, ",").replace(/\$/g, "%24");
}

// ─── imgbb.ts ────────────────────────────────────────────────────────────────────

const IMGBB_API_KEY = "4d6ee348fd4f8f0852539892666b8c90";

export interface ImgBBResult {
  url: string;
  thumbUrl: string;
  deleteUrl: string;
}

export async function uploadToImgBB(file: File): Promise<ImgBBResult> {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: "POST", body: formData });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "ImgBB upload failed");
  return {
    url: json.data.url as string,
    thumbUrl: (json.data.thumb?.url ?? json.data.url) as string,
    deleteUrl: json.data.delete_url as string,
  };
}

export async function uploadMultipleToImgBB(files: File[], onProgress?: (done: number, total: number) => void): Promise<ImgBBResult[]> {
  const results: ImgBBResult[] = [];
  for (let i = 0; i < files.length; i++) {
    const result = await uploadToImgBB(files[i]);
    results.push(result);
    onProgress?.(i + 1, files.length);
  }
  return results;
}
