import { useEffect, useState } from "react";
import { toast } from "sonner";
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  XAxis 
} from "recharts";
import { 
  DollarSign, 
  Users, 
  FileText, 
  Activity 
} from "lucide-react";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart"; 

import { dashboardService, type DashboardStats } from "@/services/dashboardService";
import type { Invoice } from "@/types"; 

// Define Chart Config
const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading Dashboard...</div>;
  }

  // If stats is null or API failed completely
  if (!stats) return <div className="p-8 text-center">No data available.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your business performance.</p>
      </div>

      {/* --- STATS CARDS --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {/* 👇 FIX: Use (value || 0) to prevent crash */}
            <div className="text-2xl font-bold">${(stats.totalRevenue || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Lifetime collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Dues</CardTitle>
            <Activity className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {/* 👇 FIX: Use (value || 0) to prevent crash */}
            <div className="text-2xl font-bold">${(stats.pendingAmount || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Unpaid invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients || 0}</div>
            <p className="text-xs text-muted-foreground">Active customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvoices || 0}</div>
            <p className="text-xs text-muted-foreground">All time generated</p>
          </CardContent>
        </Card>
      </div>

      {/* --- CHART & RECENT ACTIVITY --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* SHADCN CHART SECTION */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue for the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              {/* 👇 FIX: Ensure data is an array */}
              <BarChart accessibilityLayer data={stats.monthlyStats || []}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value ? value.slice(0, 3) : ''}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                    dataKey="amount" 
                    fill="var(--color-revenue)" 
                    radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* RECENT INVOICES */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>Latest 5 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 👇 FIX: Ensure array exists and has length */}
              {(!stats.recentInvoices || stats.recentInvoices.length === 0) ? (
                <p className="text-sm text-muted-foreground">No recent activity.</p>
              ) : (
                stats.recentInvoices.map((inv: Invoice) => (
                  <div key={inv.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        #{inv.invoiceNo}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {inv.issuedAt ? format(new Date(inv.issuedAt), "MMM dd, yyyy") : "No Date"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={inv.status === 'PAID' ? 'default' : 'secondary'} className="text-xs">
                            {inv.status}
                        </Badge>
                        <div className="font-bold text-sm">
                            ${(inv.total || 0).toFixed(2)}
                        </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}