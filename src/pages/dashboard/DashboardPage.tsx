import { useEffect, useState } from "react";
import { Users, FileText, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { dashboardService, type DashboardStats } from "@/services/dashboardService";
import { invoiceService } from "@/services/invoiceService";
import type { Invoice } from "@/types";

export default function DashboardPage() {
  // Initialize with safe defaults
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalInvoices: 0,
    totalRevenue: 0,
  });
  
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Fetch Stats
        const statsData = await dashboardService.getStats();
        
        // Only update if we actually got a valid object back
        if (statsData) {
            setStats(statsData);
        }

        // 2. Fetch Recent Invoices (Page 0, Size 5)
        const invoicesData = await invoiceService.search({ page: 0, size: 5 });
        // @ts-ignore
        setRecentInvoices(invoicesData.content || []);
      } catch (error) {
        console.error("Dashboard load error:", error);
        // We don't show an error toast here to avoid spamming if the backend is just waking up
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Helper to safely format currency
  const formatCurrency = (amount: any) => {
    // Force conversion to number, defaulting to 0 if null/undefined
    const value = Number(amount) || 0;
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your billing status.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* 👇 CRASH FIX: Uses helper function */}
            <div className="text-2xl font-bold">
                {formatCurrency(stats?.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{Number(stats?.totalClients) || 0}</div>
            <p className="text-xs text-muted-foreground">Active clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{Number(stats?.totalInvoices) || 0}</div>
            <p className="text-xs text-muted-foreground">Total invoices generated</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Recent Invoices</h3>
            <Button asChild variant="outline" size="sm">
                <Link to="/invoices">View All</Link>
            </Button>
        </div>
        
        <div className="border rounded-md bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow><TableCell colSpan={5} className="text-center h-24">Loading...</TableCell></TableRow>
              ) : !recentInvoices || recentInvoices.length === 0 ? (
                 <TableRow><TableCell colSpan={5} className="text-center h-24">No recent activity.</TableCell></TableRow>
              ) : (
                recentInvoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.invoiceNo}</TableCell>
                    <TableCell>
                        {/* Safe check for client name vs ID */}
                        {inv.clientId || "Unknown"} 
                    </TableCell>
                    <TableCell>{inv.issuedAt ? format(new Date(inv.issuedAt), 'MMM dd') : '-'}</TableCell>
                    <TableCell>
                        <Badge variant={inv.status === 'PAID' ? 'default' : 'secondary'}>{inv.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                        {formatCurrency(inv.total)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}