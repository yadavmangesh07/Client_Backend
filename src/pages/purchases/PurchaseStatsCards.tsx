import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PurchaseStats } from "@/types";
import { ArrowDown, ArrowUp, Wallet } from "lucide-react";
// 👇 Import the type instead of defining it inline (cleaner)
interface StatsProps {
  monthly: PurchaseStats;
  yearly: PurchaseStats;
  monthName: string; // 👈 Fixed name to match PurchasesPage.tsx
}



export function PurchaseStatsCards({ monthly, yearly, monthName }: StatsProps) {
  
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  return (
    <div className="grid gap-4 md:grid-cols-2 mb-6">
      {/* Monthly Card */}
      <Card className="border-l-4 border-l-blue-500 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {monthName} Overview
          </CardTitle>
          <Wallet className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(monthly.totalExpense)}</div>
          <p className="text-xs text-muted-foreground mb-3">Total Purchases</p>
          
          <div className="flex justify-between text-sm">
            <div className="flex items-center text-green-600 gap-1">
              <ArrowUp className="h-3 w-3" />
              <span className="font-semibold">{formatCurrency(monthly.totalPaid)}</span>
              <span className="text-xs text-gray-500 ml-1">Paid</span>
            </div>
            <div className="flex items-center text-red-600 gap-1">
              <ArrowDown className="h-3 w-3" />
              <span className="font-semibold">{formatCurrency(monthly.totalUnpaid)}</span>
              <span className="text-xs text-gray-500 ml-1">Due</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Yearly Card */}
      <Card className="border-l-4 border-l-purple-500 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Current Financial Year
          </CardTitle>
          <Wallet className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(yearly.totalExpense)}</div>
          <p className="text-xs text-muted-foreground mb-3">Total YTD Expenses</p>
          
          <div className="flex justify-between text-sm">
            <div className="flex items-center text-green-600 gap-1">
              <ArrowUp className="h-3 w-3" />
              <span className="font-semibold">{formatCurrency(yearly.totalPaid)}</span>
              <span className="text-xs text-gray-500 ml-1">Paid</span>
            </div>
            <div className="flex items-center text-red-600 gap-1">
              <ArrowDown className="h-3 w-3" />
              <span className="font-semibold">{formatCurrency(yearly.totalUnpaid)}</span>
              <span className="text-xs text-gray-500 ml-1">Due</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}