import { AdminLayout } from "@/components/admin-layout";
import { ImageUpload, type UploadedImage } from "@/components/image-upload";
import { Badge } from "@/components/ui/badge";
import { useAdminAuth, useToast } from "@/hooks/index";
import { getGetStatsQueryKey, getListCategoriesQueryKey, getListOrdersQueryKey, getListProductsQueryKey, useCreateCategory, useCreateProduct, useDeleteProduct, useGetOrder, useGetStats, useListCategories, useListOrders, useListProducts, useUpdateOrderStatus, useUpdateProduct } from "@/lib/api-client";
import { AdminUser, Coupon, SiteSettings, addAdmin, adminGoogleLogin, createCoupon, deleteCoupon, getAllAdmins, getSiteSettings, removeAdmin, saveSiteSettings, seedOwner, subscribeCoupons, toggleAdminActive, updateCoupon } from "@/lib/app";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, Check, CheckCircle, Clock, CreditCard, Globe, Image, Mail, MapPin, Package, Pencil, Phone, Plus, RotateCcw, Save, Search, Settings, Shield, ShoppingBag, Sparkles, Star, Tag, Trash2, TrendingUp, UserCheck, UserX, Users, X, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams as useNextParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const STATUS_COLORS: Record<string, string> = {
  pending: "hsl(25 100% 50%)",
  confirmed: "hsl(210 100% 55%)",
  shipped: "hsl(270 70% 60%)",
  delivered: "hsl(160 80% 45%)",
  cancelled: "hsl(0 70% 50%)",
};

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div
      className="rounded-lg p-5 border border-border/40 flex items-center gap-4"
      style={{ backgroundColor: "hsl(0 30% 7%)" }}
    >
      <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}22` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function mockWeeklyData(totalRevenue: number, totalOrders: number) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weights = [0.1, 0.12, 0.14, 0.16, 0.18, 0.16, 0.14];
  return days.map((day, i) => ({
    day,
    revenue: Math.round(totalRevenue * weights[i]),
    orders: Math.round(totalOrders * weights[i]),
  }));
}

export function AdminDashboard() {
  const { data: stats, isLoading } = useGetStats();
  const { data: orders } = useListOrders();
  const updateStatus = useUpdateOrderStatus();
  const queryClient = useQueryClient();

  const weeklyData = stats ? mockWeeklyData(stats.totalRevenue, stats.totalOrders) : [];

  const handleStatusChange = (id: number, status: string) => {
    updateStatus.mutate({ id, data: { status } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
      },
    });
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">SHZONE store overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Products" value={stats?.totalProducts ?? "—"} icon={Package} color="hsl(25 100% 50%)" />
        <StatCard label="Total Orders" value={stats?.totalOrders ?? "—"} icon={ShoppingBag} color="hsl(210 100% 55%)" />
        <StatCard label="Total Revenue (৳)" value={stats ? `৳${stats.totalRevenue.toLocaleString()}` : "—"} icon={TrendingUp} color="hsl(160 80% 45%)" />
        <StatCard label="Pending Orders" value={stats?.pendingOrders ?? "—"} icon={Clock} color="hsl(40 100% 55%)" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue chart */}
        <div className="rounded-lg border border-border/40 p-5" style={{ backgroundColor: "hsl(0 30% 7%)" }}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Weekly Revenue (৳)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 20% 18%)" />
              <XAxis dataKey="day" tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(0 30% 8%)", border: "1px solid hsl(0 20% 20%)", borderRadius: 6 }}
                labelStyle={{ color: "hsl(0 0% 85%)" }}
                itemStyle={{ color: "hsl(25 100% 55%)" }}
              />
              <Line type="monotone" dataKey="revenue" stroke="hsl(25 100% 50%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders chart */}
        <div className="rounded-lg border border-border/40 p-5" style={{ backgroundColor: "hsl(0 30% 7%)" }}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Weekly Orders</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 20% 18%)" />
              <XAxis dataKey="day" tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(0 30% 8%)", border: "1px solid hsl(0 20% 20%)", borderRadius: 6 }}
                labelStyle={{ color: "hsl(0 0% 85%)" }}
                itemStyle={{ color: "hsl(210 100% 65%)" }}
              />
              <Bar dataKey="orders" fill="hsl(210 100% 50%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-lg border border-border/40" style={{ backgroundColor: "hsl(0 30% 7%)" }}>
        <div className="px-5 py-4 border-b border-border/40">
          <h3 className="text-sm font-semibold text-foreground">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">ID</th>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">Customer</th>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">District</th>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">Total</th>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">Payment</th>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {(orders ?? []).slice(0, 10).map((order) => (
                <tr key={order.id} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">#{order.id}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{order.district}</td>
                  <td className="px-5 py-3 font-mono font-medium" style={{ color: "hsl(25 100% 55%)" }}>
                    ৳{order.total.toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground uppercase">{order.paymentMethod}</td>
                  <td className="px-5 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="text-xs px-2 py-1 rounded border border-border/50 bg-muted/30 text-foreground focus:outline-none"
                      style={{ color: STATUS_COLORS[order.status] ?? "inherit" }}
                      data-testid={`order-status-${order.id}`}
                    >
                      {["pending","confirmed","shipped","delivered","cancelled"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {(!orders || orders.length === 0) && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-muted-foreground text-sm">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

const STATUSES = ["all", "pending", "confirmed", "shipped", "delivered", "cancelled"];

export function AdminOrders() {
  const { data: orders, isLoading } = useListOrders();
  const updateStatus = useUpdateOrderStatus();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleStatusChange = (id: number, status: string) => {
    updateStatus.mutate({ id, data: { status } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() }),
    });
  };

  const filtered = (orders ?? []).filter((o) => {
    const matchesSearch = !search ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search) ||
      String(o.id).includes(search);
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">{orders?.length ?? 0} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, phone, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 h-9 text-sm bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent rounded-md w-64"
            data-testid="orders-search"
          />
        </div>

        <div className="flex gap-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 h-9 text-xs font-medium rounded-md capitalize transition-colors"
              style={{
                backgroundColor: statusFilter === s ? "hsl(25 100% 50% / 0.2)" : "hsl(0 20% 12%)",
                color: statusFilter === s ? "hsl(25 100% 55%)" : "hsl(0 0% 55%)",
                border: `1px solid ${statusFilter === s ? "hsl(25 100% 50% / 0.5)" : "hsl(0 20% 18%)"}`,
              }}
              data-testid={`filter-status-${s}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/40 overflow-hidden" style={{ backgroundColor: "hsl(0 30% 7%)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40">
                {["Order ID", "Customer", "District", "Items", "Total", "Payment", "Date", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-border/20">
                    {Array(8).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-muted/40 rounded animate-pulse w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">No orders found</td></tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="border-b border-border/20 hover:bg-muted/10 transition-colors cursor-pointer">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      <Link href={`/admin/orders/${order.id}`}>#{order.id}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground whitespace-nowrap">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{order.district}</td>
                    <td className="px-4 py-3 text-muted-foreground">{order.items.length} item(s)</td>
                    <td className="px-4 py-3 font-mono font-semibold whitespace-nowrap" style={{ color: "hsl(25 100% 55%)" }}>
                      ৳{order.total.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground uppercase">{order.paymentMethod}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("en-BD")}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="text-xs px-2 py-1.5 rounded border bg-muted/20 focus:outline-none cursor-pointer"
                        style={{
                          color: STATUS_COLORS[order.status] ?? "inherit",
                          borderColor: `${STATUS_COLORS[order.status]}55` ?? "hsl(0 20% 18%)",
                        }}
                        data-testid={`order-status-${order.id}`}
                      >
                        {["pending","confirmed","shipped","delivered","cancelled"].map((s) => (
                          <option key={s} value={s} className="text-foreground bg-background">{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

const ACTION_COLORS: Record<string, string> = {
  accepted: "hsl(160 80% 45%)",
  rejected: "hsl(0 70% 50%)",
  returned: "hsl(25 100% 50%)",
};

export function AdminOrderDetail() {
  const params = useNextParams();
  const id = params.id as string;
  const orderId = Number(id);
  const { data: order, isLoading } = useGetOrder(orderId);
  const { data: allOrders } = useListOrders();
  const { toast } = useToast();
  const [adminNote, setAdminNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Customer stats from all orders
  const customerOrders = (allOrders || []).filter((o) => o.customerPhone === order?.customerPhone);
  const totalOrders = customerOrders.length;
  const completedOrders = customerOrders.filter((o) => o.status === "delivered").length;
  const cancelledOrders = customerOrders.filter((o) => o.status === "cancelled").length;
  const rejectedOrders = customerOrders.filter((o) => o.adminAction === "rejected").length;
  const fraudScore = rejectedOrders;
  const avgRating = customerOrders.filter((o) => o.rating !== null).length > 0
    ? customerOrders
        .filter((o) => o.rating !== null)
        .reduce((sum, o) => sum + (o.rating ?? 0), 0) /
      customerOrders.filter((o) => o.rating !== null).length
    : 0;
  const trustLevel = fraudScore > 2 ? "high-risk" : fraudScore > 0 ? "medium-risk" : totalOrders > 5 ? "verified" : "new";
  const trustColors: Record<string, string> = {
    "verified": "hsl(160 80% 45%)",
    "new": "hsl(210 100% 55%)",
    "medium-risk": "hsl(25 100% 50%)",
    "high-risk": "hsl(0 70% 50%)",
  };

  const handleAdminAction = async (action: string, status: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/admin-action`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminAction: action, adminNote: adminNote || undefined, status }),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: `Order ${action}` });
      window.location.reload();
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted w-1/4" />
          <div className="h-64 bg-muted" />
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <h2 className="text-xl font-bold">Order not found</h2>
          <Link href="/admin/orders">
            <button className="mt-4 px-4 py-2 border rounded-md">Back to Orders</button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Link href="/admin/orders">
        <div className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 uppercase tracking-widest cursor-pointer">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
        </div>
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tighter">
                Order #{order.id}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {format(new Date(order.createdAt), "PPP")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-xs px-3 py-1.5 rounded-full font-medium uppercase tracking-wider"
                style={{
                  backgroundColor: `${STATUS_COLORS[order.status]}22`,
                  color: STATUS_COLORS[order.status],
                }}
              >
                {order.status}
              </span>
              {order.adminAction && (
                <span
                  className="text-xs px-3 py-1.5 rounded-full font-medium uppercase tracking-wider"
                  style={{
                    backgroundColor: `${ACTION_COLORS[order.adminAction]}22`,
                    color: ACTION_COLORS[order.adminAction],
                  }}
                >
                  {order.adminAction}
                </span>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="border border-border/40 rounded-lg p-5" style={{ backgroundColor: "hsl(0 30% 7%)" }}>
            <h3 className="font-display font-bold uppercase tracking-wider mb-4 text-sm">Items</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.size && `Size: ${item.size} `}{item.color && `Color: ${item.color}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ৳{item.price.toLocaleString()} x {item.quantity}
                    </p>
                  </div>
                  <span className="font-mono font-semibold text-sm">৳{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border/30 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono">৳{(order.total - order.deliveryCharge).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-mono">৳{order.deliveryCharge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-1 border-t border-border/30">
                <span>Total</span>
                <span className="font-mono" style={{ color: "hsl(25 100% 55%)" }}>৳{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="border border-border/40 rounded-lg p-5" style={{ backgroundColor: "hsl(0 30% 7%)" }}>
            <h3 className="font-display font-bold uppercase tracking-wider mb-4 text-sm">Customer Info</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Name</p>
                <p className="font-medium mt-0.5">{order.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Phone</p>
                <p className="font-medium mt-0.5">{order.customerPhone}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Address</p>
                <p className="font-medium mt-0.5">{order.customerAddress}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">District</p>
                <p className="font-medium mt-0.5">{order.district}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Payment</p>
                <p className="font-medium mt-0.5 uppercase">{order.paymentMethod}</p>
              </div>
              {order.notes && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Notes</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Admin Note */}
          {order.adminNote && (
            <div className="border border-border/40 rounded-lg p-5" style={{ backgroundColor: "hsl(0 30% 7%)" }}>
              <h3 className="font-display font-bold uppercase tracking-wider mb-2 text-sm text-red-400">Admin Note</h3>
              <p className="text-sm text-muted-foreground">{order.adminNote}</p>
            </div>
          )}

          {/* Rating */}
          {order.rating && (
            <div className="border border-border/40 rounded-lg p-5" style={{ backgroundColor: "hsl(0 30% 7%)" }}>
              <h3 className="font-display font-bold uppercase tracking-wider mb-2 text-sm">Customer Rating</h3>
              <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-5 w-5"
                  style={{ color: i < (order.rating ?? 0) ? "hsl(25 100% 55%)" : "hsl(0 20% 25%)" }}
                  fill={i < (order.rating ?? 0) ? "hsl(25 100% 55%)" : "none"}
                />
              ))}
              <span className="ml-2 text-sm font-medium">{order.rating}/5</span>
            </div>
            </div>
          )}
        </div>

        {/* Right: Customer Reputation + Actions */}
        <div className="space-y-6">
          {/* Customer Reputation Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-border/40 rounded-lg p-5"
            style={{ backgroundColor: "hsl(0 30% 7%)" }}
          >
            <h3 className="font-display font-bold uppercase tracking-wider mb-4 text-sm">Customer Reputation</h3>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${trustColors[trustLevel]}22` }}
              >
                {trustLevel === "high-risk" ? (
                  <AlertTriangle className="h-5 w-5" style={{ color: trustColors[trustLevel] }} />
                ) : (
                  <Shield className="h-5 w-5" style={{ color: trustColors[trustLevel] }} />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: trustColors[trustLevel] }}>
                  {trustLevel === "verified" ? "Verified Customer" :
                   trustLevel === "new" ? "New Customer" :
                   trustLevel === "medium-risk" ? "Medium Risk" : "High Risk"}
                </p>
                <p className="text-xs text-muted-foreground">{totalOrders} orders total</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium" style={{ color: "hsl(160 80% 55%)" }}>{completedOrders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cancelled</span>
                <span className="font-medium" style={{ color: "hsl(0 70% 50%)" }}>{cancelledOrders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rejected</span>
                <span className="font-medium" style={{ color: "hsl(0 70% 50%)" }}>{rejectedOrders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Rating</span>
                <span className="font-medium">{avgRating > 0 ? avgRating.toFixed(1) : "N/A"}</span>
              </div>
            </div>
          </motion.div>

          {/* Admin Actions */}
          <div className="border border-border/40 rounded-lg p-5" style={{ backgroundColor: "hsl(0 30% 7%)" }}>
            <h3 className="font-display font-bold uppercase tracking-wider mb-4 text-sm">Actions</h3>
            <div className="space-y-3">
              <textarea
                className="w-full h-20 px-3 py-2 text-sm bg-muted/20 border border-border/50 rounded-md text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-orange-500 resize-none"
                placeholder="Admin note (optional)..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleAdminAction("accepted", "confirmed")}
                  disabled={actionLoading || order.adminAction === "accepted"}
                  className="flex flex-col items-center gap-1 py-3 rounded-md text-xs font-semibold uppercase disabled:opacity-40 transition-all hover:opacity-90"
                  style={{ backgroundColor: "hsl(160 80% 45% / 0.2)", color: "hsl(160 80% 55%)" }}
                >
                  <CheckCircle className="h-4 w-4" />
                  Accept
                </button>
                <button
                  onClick={() => handleAdminAction("rejected", "cancelled")}
                  disabled={actionLoading || order.adminAction === "rejected"}
                  className="flex flex-col items-center gap-1 py-3 rounded-md text-xs font-semibold uppercase disabled:opacity-40 transition-all hover:opacity-90"
                  style={{ backgroundColor: "hsl(0 70% 50% / 0.2)", color: "hsl(0 70% 60%)" }}
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </button>
                <button
                  onClick={() => handleAdminAction("returned", "cancelled")}
                  disabled={actionLoading || order.adminAction === "returned"}
                  className="flex flex-col items-center gap-1 py-3 rounded-md text-xs font-semibold uppercase disabled:opacity-40 transition-all hover:opacity-90"
                  style={{ backgroundColor: "hsl(25 100% 50% / 0.2)", color: "hsl(25 100% 55%)" }}
                >
                  <RotateCcw className="h-4 w-4" />
                  Return
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

type ProductForm = {
  name: string; nameBn: string; description: string; descriptionBn: string;
  price: string; originalPrice: string; categoryId: string;
  sizes: string; colors: string; stock: string; featured: boolean; isNew: boolean;
};

const emptyForm = (): ProductForm => ({
  name: "", nameBn: "", description: "", descriptionBn: "",
  price: "", originalPrice: "", categoryId: "",
  sizes: "S,M,L,XL", colors: "Black,White", stock: "10",
  featured: false, isNew: false,
});

export function AdminProducts() {
  const { data: products, isLoading } = useListProducts({});
  const { data: categories } = useListCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [formImages, setFormImages] = useState<UploadedImage[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const openAdd = () => {
    setForm(emptyForm());
    setFormImages([]);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (p: NonNullable<typeof products>[0]) => {
    setForm({
      name: p.name, nameBn: p.nameBn,
      description: p.description ?? "", descriptionBn: p.descriptionBn ?? "",
      price: String(p.price), originalPrice: p.originalPrice ? String(p.originalPrice) : "",
      categoryId: String(p.categoryId),
      sizes: (p.sizes ?? []).join(","), colors: (p.colors ?? []).join(","),
      stock: String(p.stock), featured: p.featured, isNew: p.isNew,
    });
    // Populate existing images
    const existingImgs: UploadedImage[] = [
      { url: p.imageUrl, thumbUrl: p.imageUrl, isMain: true },
      ...((p.images ?? []).map((url: string) => ({ url, thumbUrl: url, isMain: false }))),
    ];
    setFormImages(existingImgs);
    setEditingId(p.id);
    setShowModal(true);
  };

  const buildPayload = () => {
    const mainImage = formImages.find((i) => i.isMain) ?? formImages[0];
    const otherImages = formImages.filter((i) => !i.isMain).map((i) => i.url);
    return {
      name: form.name, nameBn: form.nameBn,
      description: form.description || null, descriptionBn: form.descriptionBn || null,
      price: parseFloat(form.price),
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
      categoryId: parseInt(form.categoryId),
      imageUrl: mainImage?.url ?? "",
      images: otherImages,
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split(",").map((c) => c.trim()).filter(Boolean),
      stock: parseInt(form.stock) || 0,
      featured: form.featured, isNew: form.isNew,
    };
  };

  const handleSave = () => {
    if (!form.name || !form.price || !form.categoryId || formImages.length === 0) {
      toast({ title: "Required fields missing (including at least 1 image)", variant: "destructive" });
      return;
    }
    if (editingId) {
      updateProduct.mutate({ id: editingId, data: buildPayload() }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }); setShowModal(false); toast({ title: "Product updated!" }); },
        onError: () => toast({ title: "Update failed", variant: "destructive" }),
      });
    } else {
      createProduct.mutate({ data: buildPayload() as any }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }); setShowModal(false); toast({ title: "Product created!" }); },
        onError: () => toast({ title: "Create failed", variant: "destructive" }),
      });
    }
  };

  const handleDelete = (id: number) => {
    deleteProduct.mutate({ id }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }); setDeleteConfirm(null); toast({ title: "Deleted" }); },
      onError: () => toast({ title: "Delete failed", variant: "destructive" }),
    });
  };

  const filtered = (products ?? []).filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.nameBn.includes(search)
  );

  const discountPct = (p: NonNullable<typeof products>[0]) =>
    p.originalPrice && p.originalPrice > p.price
      ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
      : null;

  const inputClass = "w-full h-9 px-3 text-sm bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent rounded-md";

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-4 md:mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-display font-bold text-foreground">Products</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{products?.length ?? 0} total</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-1.5 px-3 md:px-4 h-8 md:h-9 text-xs md:text-sm font-semibold rounded-md text-white hover:opacity-85 transition-opacity"
          style={{ backgroundColor: "hsl(25 100% 50%)" }} data-testid="button-add-product">
          <Plus className="h-3.5 w-3.5" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input type="text" placeholder="Search products..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-4 h-8 w-full text-sm bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent rounded-md" />
      </div>

      {/* Products table — scrollable on mobile */}
      <div className="rounded-lg border border-border/40 overflow-hidden" style={{ backgroundColor: "hsl(0 30% 7%)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-border/40">
                {["Product", "Category", "Price", "Discount", "Stock", "Flags", "Actions"].map((h) => (
                  <th key={h} className="text-left px-3 py-2.5 text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-border/20">
                    {Array(7).fill(0).map((_, j) => (
                      <td key={j} className="px-3 py-2.5"><div className="h-3.5 bg-muted/30 rounded animate-pulse w-16" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">No products found</td></tr>
              ) : filtered.map((p) => {
                const disc = discountPct(p);
                return (
                  <tr key={p.id} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <img src={p.imageUrl} alt={p.name} className="w-9 h-11 object-cover rounded shrink-0" />
                        <div>
                          <p className="font-medium text-foreground text-xs line-clamp-1">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground">{p.nameBn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground text-xs">{p.categoryName}</td>
                    <td className="px-3 py-2.5 font-mono font-semibold text-xs whitespace-nowrap" style={{ color: "hsl(25 100% 55%)" }}>৳{p.price.toLocaleString()}</td>
                    <td className="px-3 py-2.5">
                      {disc ? <span className="text-[11px] px-1.5 py-0.5 rounded font-bold bg-green-600/20 text-green-400">{disc}% off</span>
                        : <span className="text-xs text-muted-foreground/30">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{p.stock}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        {p.featured && <Star className="h-3.5 w-3.5 text-yellow-500" />}
                        {p.isNew && <Sparkles className="h-3.5 w-3.5 text-blue-400" />}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(p)}
                          className="p-1.5 rounded hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setDeleteConfirm(p.id)}
                          className="p-1.5 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="rounded-lg p-6 w-72 border border-border/50 shadow-2xl" style={{ backgroundColor: "hsl(0 30% 7%)" }} onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-foreground mb-2">Delete Product?</h3>
            <p className="text-sm text-muted-foreground mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 h-9 border border-border/50 text-sm rounded text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} disabled={deleteProduct.isPending}
                className="flex-1 h-9 bg-red-600 text-white text-sm font-semibold rounded hover:bg-red-700 disabled:opacity-50">
                {deleteProduct.isPending ? "..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/75 p-0 md:p-4" onClick={() => setShowModal(false)}>
          <div
            className="w-full md:max-w-2xl rounded-t-2xl md:rounded-xl border border-border/50 shadow-2xl overflow-y-auto"
            style={{ backgroundColor: "hsl(0 30% 6%)", maxHeight: "92dvh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar on mobile */}
            <div className="md:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-border/40 sticky top-0 z-10"
              style={{ backgroundColor: "hsl(0 30% 6%)" }}>
              <h2 className="font-display font-bold text-sm md:text-base text-foreground">
                {editingId ? "Edit Product" : "Add New Product"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded hover:bg-muted/30 text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 md:p-5 space-y-4">

              {/* Image Upload — full width, top */}
              <div>
                <label className="block text-xs text-muted-foreground mb-2">
                  Product Images * <span className="text-muted-foreground/50">(first = main · tap ★ to set main · max 6)</span>
                </label>
                <ImageUpload images={formImages} onChange={setFormImages} maxImages={6} />
              </div>

              {/* Fields grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Name (EN) *</label>
                  <input className={inputClass} placeholder="Essential White Tee" value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">নাম (বাংলা) *</label>
                  <input className={inputClass} placeholder="হোয়াইট টি" value={form.nameBn}
                    onChange={(e) => setForm((p) => ({ ...p, nameBn: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Price (৳) *</label>
                  <input className={inputClass} type="number" placeholder="699" value={form.price}
                    onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Original Price (৳)</label>
                  <input className={inputClass} type="number" placeholder="899 → shows discount" value={form.originalPrice}
                    onChange={(e) => setForm((p) => ({ ...p, originalPrice: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Category *</label>
                  <select className={inputClass + " cursor-pointer"} value={form.categoryId}
                    onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}>
                    <option value="">Select category</option>
                    {(categories ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Stock</label>
                  <input className={inputClass} type="number" placeholder="10" value={form.stock}
                    onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-muted-foreground mb-1.5">Sizes (comma separated)</label>
                  <input className={inputClass} placeholder="S,M,L,XL,XXL" value={form.sizes}
                    onChange={(e) => setForm((p) => ({ ...p, sizes: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-muted-foreground mb-1.5">Colors (comma separated)</label>
                  <input className={inputClass} placeholder="Black,White,Grey" value={form.colors}
                    onChange={(e) => setForm((p) => ({ ...p, colors: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-muted-foreground mb-1.5">Description (EN)</label>
                  <textarea className={inputClass + " h-14 py-2 resize-none"} placeholder="Product description..."
                    value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-muted-foreground mb-1.5">বিবরণ (বাংলা)</label>
                  <textarea className={inputClass + " h-14 py-2 resize-none"} placeholder="পণ্যের বিবরণ..."
                    value={form.descriptionBn} onChange={(e) => setForm((p) => ({ ...p, descriptionBn: e.target.value }))} />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-5 pt-1">
                {[
                  { key: "featured", label: "Featured", icon: Star, color: "hsl(40 100% 55%)", iconClass: "text-yellow-500" },
                  { key: "isNew", label: "New Arrival", icon: Sparkles, color: "hsl(210 100% 50%)", iconClass: "text-blue-400" },
                ].map(({ key, label, icon: Icon, color, iconClass }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                    <div className="w-8 h-5 rounded-full relative transition-colors"
                      style={{ backgroundColor: (form as any)[key] ? color : "hsl(0 20% 20%)" }}
                      onClick={() => setForm((p) => ({ ...p, [key]: !(p as any)[key] }))}>
                      <div className="w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all"
                        style={{ left: (form as any)[key] ? "calc(100% - 18px)" : "2px" }} />
                    </div>
                    <span className="text-xs text-foreground flex items-center gap-1">
                      <Icon className={`h-3.5 w-3.5 ${iconClass}`} /> {label}
                    </span>
                  </label>
                ))}
              </div>

              {/* Discount preview */}
              {form.price && form.originalPrice && parseFloat(form.originalPrice) > parseFloat(form.price) && (
                <div className="flex items-center gap-2 px-3 py-2 rounded bg-green-600/10 border border-green-600/20">
                  <span className="text-xs text-green-400">
                    {Math.round(((parseFloat(form.originalPrice) - parseFloat(form.price)) / parseFloat(form.originalPrice)) * 100)}% discount
                    — ৳{parseFloat(form.price)} (was ৳{parseFloat(form.originalPrice)})
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 md:px-5 pb-5 pt-2 flex gap-3">
              <button onClick={() => setShowModal(false)}
                className="flex-1 h-10 border border-border/50 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/20">
                Cancel
              </button>
              <button onClick={handleSave}
                disabled={createProduct.isPending || updateProduct.isPending}
                className="flex-1 h-10 text-sm font-bold text-white rounded-md hover:opacity-85 disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: "hsl(25 100% 50%)" }}>
                {(createProduct.isPending || updateProduct.isPending) ? "Saving..." : (editingId ? "Update" : "Create")}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export function AdminCategories() {
  const { data: categories, isLoading } = useListCategories();
  const createCategory = useCreateCategory();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", nameBn: "", slug: "", imageUrl: "" });

  const handleCreate = () => {
    if (!form.name || !form.nameBn || !form.slug) {
      toast({ title: "সব ঘর পূরণ করুন", variant: "destructive" });
      return;
    }
    createCategory.mutate(
      { data: { name: form.name, nameBn: form.nameBn, slug: form.slug, imageUrl: form.imageUrl || null } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
          setForm({ name: "", nameBn: "", slug: "", imageUrl: "" });
          setShowForm(false);
          toast({ title: "Category created!" });
        },
        onError: () => toast({ title: "Failed to create", variant: "destructive" }),
      }
    );
  };

  const inputClass = "w-full h-9 px-3 text-sm bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent rounded-md";

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">{categories?.length ?? 0} categories</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 h-9 text-sm font-semibold rounded-md text-white transition-opacity hover:opacity-85"
          style={{ backgroundColor: "hsl(25 100% 50%)" }}
          data-testid="button-add-category"
        >
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      {/* Add Category Form */}
      {showForm && (
        <div className="rounded-lg border border-border/40 p-5 mb-6" style={{ backgroundColor: "hsl(0 30% 7%)" }}>
          <h3 className="text-sm font-semibold text-foreground mb-4">New Category</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Name (English) *</label>
              <input className={inputClass} placeholder="T-Shirts" value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                data-testid="input-cat-name" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Name (বাংলা) *</label>
              <input className={inputClass} placeholder="টি-শার্ট" value={form.nameBn}
                onChange={(e) => setForm((p) => ({ ...p, nameBn: e.target.value }))}
                data-testid="input-cat-name-bn" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Slug *</label>
              <input className={inputClass} placeholder="t-shirts" value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                data-testid="input-cat-slug" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Image URL (optional)</label>
              <input className={inputClass} placeholder="https://..." value={form.imageUrl}
                onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
                data-testid="input-cat-image" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={createCategory.isPending}
              className="px-4 h-8 text-xs font-semibold rounded text-white disabled:opacity-50"
              style={{ backgroundColor: "hsl(25 100% 50%)" }}>
              {createCategory.isPending ? "Creating..." : "Create"}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 h-8 text-xs font-semibold rounded border border-border/50 text-muted-foreground hover:text-foreground">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Categories grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-muted/20 animate-pulse" />
          ))
        ) : (categories ?? []).map((cat) => (
          <div key={cat.id}
            className="rounded-lg border border-border/40 p-4 flex flex-col gap-2"
            style={{ backgroundColor: "hsl(0 30% 7%)" }}
            data-testid={`category-card-${cat.id}`}
          >
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: "hsl(25 100% 50% / 0.15)" }}>
              <Tag className="h-4 w-4" style={{ color: "hsl(25 100% 55%)" }} />
            </div>
            <p className="font-semibold text-sm text-foreground">{cat.name}</p>
            <p className="text-xs text-muted-foreground">{cat.nameBn}</p>
            <p className="text-xs font-mono text-muted-foreground/60">/{cat.slug}</p>
            <div className="mt-auto pt-2 border-t border-border/30">
              <span className="text-xs text-muted-foreground">{cat.productCount} products</span>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}

const EMPTY_FORM = {
  code: "",
  discountType: "percentage" as "percentage" | "flat",
  discount: 10,
  minOrder: 0,
  maxUses: "" as number | "",
  isActive: true,
  expiresAt: "",
};

export function AdminCoupons() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeCoupons((c) => {
      setCoupons(c.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (coupon: Coupon) => {
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discount: coupon.discount,
      minOrder: coupon.minOrder,
      maxUses: coupon.maxUses ?? "",
      isActive: coupon.isActive,
      expiresAt: coupon.expiresAt
        ? new Date(coupon.expiresAt).toISOString().slice(0, 10)
        : "",
    });
    setEditId(coupon.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) {
      toast({ title: "কোড লিখুন", variant: "destructive" });
      return;
    }
    if (form.discount <= 0) {
      toast({ title: "ছাড়ের পরিমাণ দিন", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        code: form.code.toUpperCase().trim(),
        discountType: form.discountType,
        discount: Number(form.discount),
        minOrder: Number(form.minOrder) || 0,
        maxUses: form.maxUses === "" ? null : Number(form.maxUses),
        isActive: form.isActive,
        expiresAt: form.expiresAt
          ? new Date(form.expiresAt).toISOString()
          : null,
      };
      if (editId) {
        await updateCoupon(editId, payload);
        toast({ title: "কুপন আপডেট হয়েছে ✓" });
      } else {
        await createCoupon(payload);
        toast({ title: "নতুন কুপন তৈরি হয়েছে ✓" });
      }
      resetForm();
    } catch {
      toast({ title: "ত্রুটি হয়েছে", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteCoupon(id);
      toast({ title: "কুপন মুছে ফেলা হয়েছে" });
    } catch {
      toast({ title: "মুছতে সমস্যা হয়েছে", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    await updateCoupon(coupon.id, { isActive: !coupon.isActive });
  };

  const inputCls =
    "w-full h-10 px-3 text-sm bg-muted/20 border border-border/50 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-purple-500 rounded-md";

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Coupons
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            ডিসকাউন্ট কুপন manage করুন
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg, hsl(25 100% 50%), hsl(25 100% 40%))" }}
        >
          <Plus className="h-4 w-4" />
          নতুন কুপন
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div
          className="rounded-lg border border-border/40 p-5 mb-6"
          style={{ backgroundColor: "hsl(0 30% 7%)" }}
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">
            {editId ? "কুপন সম্পাদনা করুন" : "নতুন কুপন তৈরি করুন"}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-muted-foreground mb-1.5">
                কুপন কোড *
              </label>
              <input
                className={inputCls + " uppercase font-mono tracking-widest"}
                placeholder="যেমন: SAVE20"
                value={form.code}
                onChange={(e) =>
                  setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))
                }
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">
                ছাড়ের ধরন
              </label>
              <select
                className={inputCls + " cursor-pointer"}
                value={form.discountType}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    discountType: e.target.value as "percentage" | "flat",
                  }))
                }
              >
                <option value="percentage">শতাংশ (%)</option>
                <option value="flat">নির্দিষ্ট টাকা (৳)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">
                ছাড়ের পরিমাণ *
              </label>
              <input
                type="number"
                min={1}
                className={inputCls}
                placeholder={form.discountType === "percentage" ? "যেমন: 10" : "যেমন: 50"}
                value={form.discount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, discount: Number(e.target.value) }))
                }
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">
                ন্যূনতম অর্ডার (৳)
              </label>
              <input
                type="number"
                min={0}
                className={inputCls}
                placeholder="0 = কোনো সীমা নেই"
                value={form.minOrder}
                onChange={(e) =>
                  setForm((p) => ({ ...p, minOrder: Number(e.target.value) }))
                }
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">
                সর্বোচ্চ ব্যবহার
              </label>
              <input
                type="number"
                min={1}
                className={inputCls}
                placeholder="ফাঁকা = সীমাহীন"
                value={form.maxUses}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    maxUses: e.target.value === "" ? "" : Number(e.target.value),
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">
                মেয়াদ শেষ (তারিখ)
              </label>
              <input
                type="date"
                className={inputCls}
                value={form.expiresAt}
                onChange={(e) =>
                  setForm((p) => ({ ...p, expiresAt: e.target.value }))
                }
              />
            </div>

            <div className="col-span-2 flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() =>
                    setForm((p) => ({ ...p, isActive: !p.isActive }))
                  }
                  className="w-10 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer"
                  style={{
                    backgroundColor: form.isActive
                      ? "hsl(25 100% 45%)"
                      : "hsl(0 20% 25%)",
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full bg-white transition-transform shadow"
                    style={{
                      transform: form.isActive
                        ? "translateX(16px)"
                        : "translateX(0)",
                    }}
                  />
                </div>
                <span className="text-sm text-foreground">সক্রিয়</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-md text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: "hsl(160 80% 35%)" }}
            >
              <Check className="h-4 w-4" />
              {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
            </button>
            <button
              onClick={resetForm}
              className="flex items-center gap-2 px-5 py-2 rounded-md text-sm font-semibold border border-border/50 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              বাতিল
            </button>
          </div>
        </div>
      )}

      {/* Coupons list */}
      <div className="rounded-lg border border-border/40" style={{ backgroundColor: "hsl(0 30% 7%)" }}>
        <div className="px-5 py-4 border-b border-border/40 flex items-center gap-2">
          <Tag className="h-4 w-4" style={{ color: "hsl(25 100% 55%)" }} />
          <h3 className="text-sm font-semibold text-foreground">
            সব কুপন ({coupons.length})
          </h3>
        </div>

        {loading ? (
          <div className="px-5 py-10 text-center text-muted-foreground text-sm">
            লোড হচ্ছে...
          </div>
        ) : coupons.length === 0 ? (
          <div className="px-5 py-10 text-center text-muted-foreground text-sm">
            কোনো কুপন নেই। উপরে "নতুন কুপন" বাটনে ক্লিক করুন।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">কোড</th>
                  <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">ছাড়</th>
                  <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">ন্যূনতম</th>
                  <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">ব্যবহার</th>
                  <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">মেয়াদ</th>
                  <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">স্ট্যাটাস</th>
                  <th className="text-right px-5 py-3 text-xs text-muted-foreground font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => {
                  const expired =
                    c.expiresAt && new Date(c.expiresAt) < new Date();
                  const maxed =
                    c.maxUses !== null && c.usedCount >= c.maxUses;
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-border/20 hover:bg-muted/10 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <span className="font-mono font-bold text-foreground tracking-widest">
                          {c.code}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-medium" style={{ color: "hsl(160 80% 50%)" }}>
                        {c.discountType === "percentage"
                          ? `${c.discount}%`
                          : `৳${c.discount}`}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {c.minOrder > 0 ? `৳${c.minOrder}` : "—"}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {c.usedCount}
                        {c.maxUses !== null ? ` / ${c.maxUses}` : ""}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground text-xs">
                        {c.expiresAt
                          ? new Date(c.expiresAt).toLocaleDateString("bn-BD")
                          : "সীমাহীন"}
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => handleToggleActive(c)}
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor:
                              c.isActive && !expired && !maxed
                                ? "hsl(160 80% 40% / 0.2)"
                                : "hsl(0 60% 40% / 0.2)",
                            color:
                              c.isActive && !expired && !maxed
                                ? "hsl(160 80% 55%)"
                                : "hsl(0 70% 60%)",
                          }}
                        >
                          {expired
                            ? "মেয়াদ শেষ"
                            : maxed
                            ? "সীমা শেষ"
                            : c.isActive
                            ? "সক্রিয়"
                            : "বন্ধ"}
                        </button>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(c)}
                            className="p-1.5 rounded hover:bg-muted/30 text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            disabled={deletingId === c.id}
                            className="p-1.5 rounded hover:bg-red-900/30 text-muted-foreground hover:text-red-400 disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export function AdminSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSettings>({} as SiteSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSiteSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSiteSettings(settings);
      toast({ title: "সেটিংস সেভ হয়েছে ✓" });
    } catch {
      toast({ title: "সেভ করতে সমস্যা হয়েছে", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full h-10 px-3 text-sm bg-muted/20 border border-border/50 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-orange-500 rounded-md";
  const inputClsSmall = "w-full h-10 px-3 text-sm bg-muted/20 border border-border/50 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-orange-500 rounded-md max-w-xs";

  const Toggle = ({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) => (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!value)}
        className="w-10 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer"
        style={{ backgroundColor: value ? "hsl(25 100% 50%)" : "hsl(0 20% 25%)" }}
      >
        <div className="w-5 h-5 rounded-full bg-white transition-transform shadow" style={{ transform: value ? "translateX(16px)" : "translateX(0)" }} />
      </div>
      <span className="text-sm text-foreground">{label}</span>
    </label>
  );

  const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
    <div className="rounded-lg border border-border/40 p-6" style={{ backgroundColor: "hsl(0 30% 7%)" }}>
      <div className="flex items-center gap-2 mb-5">
        <Icon className="h-4 w-4" style={{ color: "hsl(25 100% 55%)" }} />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );

  const Field = ({ label, value, onChange, placeholder, small }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; small?: boolean }) => (
    <div>
      <label className="block text-xs text-muted-foreground mb-1.5">{label}</label>
      <input className={small ? inputClsSmall : inputCls} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );

  const NumField = ({ label, value, onChange, placeholder }: { label: string; value: number; onChange: (v: number) => void; placeholder?: string }) => (
    <div>
      <label className="block text-xs text-muted-foreground mb-1.5">{label}</label>
      <input className={inputClsSmall} type="number" placeholder={placeholder} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
          লোড হচ্ছে...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">সাইটের সেটিংস পরিবর্তন করুন</p>
        </div>
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* Payment Methods */}
        <Section icon={CreditCard} title="Payment Methods">
          <Toggle value={settings.showCod} onChange={(v) => setSettings((p) => ({ ...p, showCod: v }))} label="Cash on Delivery (COD)" />
          <Toggle value={settings.showBkash} onChange={(v) => setSettings((p) => ({ ...p, showBkash: v }))} label="bKash" />
          {settings.showBkash && (
            <Field label="bKash নম্বর" value={settings.bkashNumber} onChange={(v) => setSettings((p) => ({ ...p, bkashNumber: v }))} placeholder="01998778632" />
          )}
          <Toggle value={settings.showNagad} onChange={(v) => setSettings((p) => ({ ...p, showNagad: v }))} label="Nagad" />
          {settings.showNagad && (
            <Field label="Nagad নম্বর" value={settings.nagadNumber} onChange={(v) => setSettings((p) => ({ ...p, nagadNumber: v }))} placeholder="01998778632" />
          )}
          <Toggle value={settings.showBankTransfer} onChange={(v) => setSettings((p) => ({ ...p, showBankTransfer: v }))} label="Bank Transfer" />
          {settings.showBankTransfer && (
            <div className="space-y-3">
              <Field label="Bank Account Number" value={settings.bankAccount} onChange={(v) => setSettings((p) => ({ ...p, bankAccount: v }))} placeholder="0123456789" />
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Bank Details</label>
                <textarea className="w-full h-20 px-3 py-2 text-sm bg-muted/20 border border-border/50 text-foreground rounded-md focus:outline-none focus:border-orange-500 resize-none placeholder:text-muted-foreground/40"
                  value={settings.bankDetails} onChange={(e) => setSettings((p) => ({ ...p, bankDetails: e.target.value }))} placeholder="Bank name, branch, routing info" />
              </div>
            </div>
          )}
        </Section>

        {/* Delivery Charges */}
        <Section icon={MapPin} title="Delivery Charges">
          <Field label="Base City (e.g., Bogra)" value={settings.deliveryBaseCity} onChange={(v) => setSettings((p) => ({ ...p, deliveryBaseCity: v }))} placeholder="Bogra" />
          <NumField label="Inside City Charge (৳)" value={settings.deliveryChargeInside} onChange={(v) => setSettings((p) => ({ ...p, deliveryChargeInside: v }))} placeholder="60" />
          <NumField label="Outside City Charge (৳)" value={settings.deliveryChargeOutside} onChange={(v) => setSettings((p) => ({ ...p, deliveryChargeOutside: v }))} placeholder="120" />
        </Section>

        {/* Site Info */}
        <Section icon={ShoppingBag} title="Site Information">
          <Field label="Site Name" value={settings.siteName} onChange={(v) => setSettings((p) => ({ ...p, siteName: v }))} placeholder="SHZONE" />
          <Field label="Site Logo URL" value={settings.siteLogo} onChange={(v) => setSettings((p) => ({ ...p, siteLogo: v }))} placeholder="https://..." />
          <Field label="Home Banner Image URL" value={settings.bannerImage} onChange={(v) => setSettings((p) => ({ ...p, bannerImage: v }))} placeholder="https://..." />
          <NumField label="Free Shipping Threshold (৳)" value={settings.freeShippingThreshold} onChange={(v) => setSettings((p) => ({ ...p, freeShippingThreshold: v }))} placeholder="5000" />
        </Section>

        {/* Contact */}
        <Section icon={Phone} title="Contact Info">
          <Toggle value={settings.showWhatsapp} onChange={(v) => setSettings((p) => ({ ...p, showWhatsapp: v }))} label="WhatsApp দেখাবে" />
          {settings.showWhatsapp && (
            <Field label="WhatsApp নম্বর (country code সহ)" value={settings.whatsappNumber} onChange={(v) => setSettings((p) => ({ ...p, whatsappNumber: v }))} placeholder="8801998778632" />
          )}
          <Toggle value={settings.showPhone} onChange={(v) => setSettings((p) => ({ ...p, showPhone: v }))} label="Phone দেখাবে" />
          {settings.showPhone && (
            <Field label="ফোন নম্বর" value={settings.phoneNumber} onChange={(v) => setSettings((p) => ({ ...p, phoneNumber: v }))} placeholder="01998778632" />
          )}
          <Toggle value={settings.showMessenger} onChange={(v) => setSettings((p) => ({ ...p, showMessenger: v }))} label="Messenger দেখাবে" />
          {settings.showMessenger && (
            <Field label="Messenger লিংক" value={settings.messengerLink} onChange={(v) => setSettings((p) => ({ ...p, messengerLink: v }))} placeholder="https://m.me/shzone" />
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Email" value={settings.contactEmail} onChange={(v) => setSettings((p) => ({ ...p, contactEmail: v }))} placeholder="shzone@example.com" />
            <Field label="Address" value={settings.address} onChange={(v) => setSettings((p) => ({ ...p, address: v }))} placeholder="Bogra, Bangladesh" />
          </div>
        </Section>

        {/* Social Media */}
        <Section icon={Globe} title="Social Media">
          <Field label="Facebook URL" value={settings.facebookUrl} onChange={(v) => setSettings((p) => ({ ...p, facebookUrl: v }))} placeholder="https://facebook.com/..." />
          <Field label="Instagram URL" value={settings.instagramUrl} onChange={(v) => setSettings((p) => ({ ...p, instagramUrl: v }))} placeholder="https://instagram.com/..." />
          <Field label="YouTube URL" value={settings.youtubeUrl} onChange={(v) => setSettings((p) => ({ ...p, youtubeUrl: v }))} placeholder="https://youtube.com/..." />
        </Section>

        {/* Business Hours */}
        <Section icon={Clock} title="Business Hours">
          <Field label="Business Hours" value={settings.businessHours} onChange={(v) => setSettings((p) => ({ ...p, businessHours: v }))} placeholder="Sat-Thu: 10AM - 8PM" />
        </Section>

        {/* Admin Dashboard Branding */}
        <Section icon={Image} title="Admin Dashboard Branding">
          <Field label="Admin Logo URL" value={settings.adminLogo} onChange={(v) => setSettings((p) => ({ ...p, adminLogo: v }))} placeholder="https://..." />
          <Field label="Admin Banner URL" value={settings.adminBanner} onChange={(v) => setSettings((p) => ({ ...p, adminBanner: v }))} placeholder="https://..." />
        </Section>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, hsl(25 100% 50%), hsl(25 100% 40%))" }}
        >
          <Save className="h-4 w-4" />
          {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
        </button>
      </div>
    </AdminLayout>
  );
}

export function AdminUsers() {
  const { isAdmin, isOwner, loading: authLoading } = useAdminAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/admin/login");
      return;
    }
    if (!authLoading && isAdmin) {
      loadAdmins();
    }
  }, [authLoading, isAdmin, router]);

  const loadAdmins = async () => {
    setLoading(true);
    const list = await getAllAdmins();
    setAdmins(list);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newEmail.trim() || !newEmail.includes("@")) {
      toast({ title: "Valid email required", variant: "destructive" });
      return;
    }
    setAdding(true);
    try {
      await addAdmin(newEmail.trim(), "owner");
      setNewEmail("");
      await loadAdmins();
      toast({ title: "Admin added successfully" });
    } catch {
      toast({ title: "Failed to add admin", variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (email: string) => {
    if (!confirm(`Remove ${email} from admins?`)) return;
    await removeAdmin(email);
    await loadAdmins();
    toast({ title: "Admin removed" });
  };

  const handleToggle = async (email: string, active: boolean) => {
    await toggleAdminActive(email, active);
    await loadAdmins();
    toast({ title: active ? "Admin activated" : "Admin deactivated" });
  };

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">Loading...</div>
      </AdminLayout>
    );
  }

  if (!isAdmin) return null;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Admin Users</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage admin panel access</p>
        </div>
      </div>

      {/* Add new admin */}
      {isOwner && (
        <div className="rounded-lg border border-border/40 p-6 mb-6" style={{ backgroundColor: "hsl(0 30% 7%)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Plus className="h-4 w-4" style={{ color: "hsl(25 100% 55%)" }} />
            <h3 className="text-sm font-semibold text-foreground">Add New Admin</h3>
          </div>
          <div className="flex gap-3">
            <input
              className="flex-1 h-10 px-3 text-sm bg-muted/20 border border-border/50 rounded-md focus:outline-none focus:border-orange-500 text-foreground placeholder:text-muted-foreground/40"
              placeholder="Enter email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <button
              onClick={handleAdd}
              disabled={adding}
              className="h-10 px-5 rounded-md text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, hsl(25 100% 50%), hsl(25 100% 40%))" }}
            >
              {adding ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
      )}

      {/* Admin list */}
      <div className="rounded-lg border border-border/40 overflow-hidden" style={{ backgroundColor: "hsl(0 30% 7%)" }}>
        <div className="px-6 py-3 border-b border-border/40 flex items-center gap-2">
          <Users className="h-4 w-4" style={{ color: "hsl(25 100% 55%)" }} />
          <span className="text-sm font-semibold text-foreground">Admin List</span>
          <span className="text-xs text-muted-foreground">({admins.length})</span>
        </div>
        <div className="divide-y divide-border/30">
          {admins.map((admin) => (
            <div key={admin.email} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {admin.isOwner ? (
                  <Shield className="h-5 w-5" style={{ color: "hsl(25 100% 55%)" }} />
                ) : admin.isActive ? (
                  <UserCheck className="h-5 w-5" style={{ color: "hsl(160 80% 45%)" }} />
                ) : (
                  <UserX className="h-5 w-5" style={{ color: "hsl(0 70% 50%)" }} />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">{admin.email}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: admin.isOwner
                          ? "hsl(25 100% 50% / 0.2)"
                          : admin.isActive
                          ? "hsl(160 80% 45% / 0.2)"
                          : "hsl(0 70% 50% / 0.2)",
                        color: admin.isOwner
                          ? "hsl(25 100% 55%)"
                          : admin.isActive
                          ? "hsl(160 80% 55%)"
                          : "hsl(0 70% 60%)",
                      }}
                    >
                      {admin.isOwner ? "Owner" : admin.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">Added {new Date(admin.addedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              {isOwner && !admin.isOwner && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(admin.email, !admin.isActive)}
                    className="text-xs px-2.5 py-1.5 rounded-md border border-border/40 hover:bg-muted/20 text-foreground"
                  >
                    {admin.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleRemove(admin.email)}
                    className="p-1.5 rounded-md hover:bg-red-500/10 text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

export function AdminLogin() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await seedOwner();
      const user = await adminGoogleLogin();
      if (!user?.email) {
        toast({ title: "Login failed", variant: "destructive" });
        setLoading(false);
        return;
      }
      // Auth check is done by route guard, just redirect
      router.push("/admin");
      toast({ title: "Login successful!" });
    } catch (e: any) {
      toast({ title: e?.message || "Login failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "hsl(0 35% 4%)" }}
    >
      <div className="w-full max-w-sm text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: "hsl(25 100% 50% / 0.2)" }}
        >
          <Shield className="h-8 w-8" style={{ color: "hsl(25 100% 55%)" }} />
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">
          SHZONE Admin
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Google দিয়ে লগইন করুন
        </p>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full h-12 rounded-md flex items-center justify-center gap-3 text-white font-semibold text-sm disabled:opacity-50 transition-transform active:scale-95"
          style={{ background: "linear-gradient(135deg, hsl(25 100% 50%), hsl(25 100% 40%))" }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>

        <div className="mt-6">
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Back to Store
          </a>
        </div>
      </div>
    </div>
  );
}
