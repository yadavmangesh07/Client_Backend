import { useState } from "react";
import { format } from "date-fns";
import { 
  Edit, 
  Trash2, 
  User, 
  MoreHorizontal,
  AlertTriangle,
  Eye 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import type { Purchase } from "@/types";

interface PurchaseListProps {
  data: Purchase[];
  onEdit: (purchase: Purchase) => void;
  onDelete: (id: string) => void;
  // 👇 Optional prop for row clicking
  onRowClick?: (purchase: Purchase) => void;
}

export function PurchaseList({ data, onEdit, onDelete, onRowClick }: PurchaseListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
            <CardTitle>Purchase History</CardTitle>
            <CardDescription>Manage your expenses and vendor payments.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">S.No</TableHead>
                        <TableHead>Store Name</TableHead>
                        <TableHead>Invoice No</TableHead>
                        <TableHead>Invoice Date</TableHead>
                        <TableHead>Total Amt</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Unpaid</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Pay Mode</TableHead>
                        <TableHead>Pay Date</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={12} className="text-center h-24 text-muted-foreground">
                                No records found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((item, index) => {
                            const itemUnpaid = Math.max(0, item.totalAmount - item.amountPaid);
                            return (
                                <TableRow 
                                    key={item.id} 
                                    // 👇 Make row clickable
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => onRowClick?.(item)}
                                >
                                    <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                                    <TableCell className="font-semibold text-gray-900">{item.storeName}</TableCell>
                                    <TableCell>{item.invoiceNo || "-"}</TableCell>
                                    
                                    <TableCell className="text-nowrap">
                                        {format(new Date(item.invoiceDate), "dd MMM yyyy")}
                                    </TableCell>

                                    <TableCell>₹{item.totalAmount.toLocaleString()}</TableCell>
                                    <TableCell className="text-green-600">₹{item.amountPaid.toLocaleString()}</TableCell>
                                    <TableCell className="text-red-500 font-medium">₹{itemUnpaid.toLocaleString()}</TableCell>
                                    
                                    <TableCell>
                                        <Badge variant="outline" className={`
                                            ${item.status?.includes('Full') ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                            ${item.status?.includes('Partially') ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
                                            ${item.status?.includes('Unpaid') ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                        `}>
                                            {item.status}
                                        </Badge>
                                    </TableCell>
                                    
                                    <TableCell>{item.paymentMode}</TableCell>
                                    
                                    <TableCell className="text-nowrap">
                                        {format(new Date(item.paymentDate || new Date()), "dd MMM yyyy")}
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded-full w-fit">
                                            <User className="h-3 w-3" />
                                            <span className="font-medium">{item.createdBy || "Unknown"}</span>
                                        </div>
                                    </TableCell>
                                    
                                    <TableCell className="text-right">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                          
                                          {/* 👇 New View Option */}
                                          <DropdownMenuItem onClick={() => onRowClick?.(item)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Details
                                          </DropdownMenuItem>
                                          
                                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(item); }}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Details
                                          </DropdownMenuItem>
                                          
                                          <DropdownMenuSeparator />
                                          
                                          <DropdownMenuItem 
                                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                            onClick={(e) => { 
                                                e.stopPropagation(); // Prevent row click
                                                item.id && setDeleteId(item.id); 
                                            }}
                                          >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Record
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
               <AlertTriangle className="h-5 w-5" />
               Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this purchase record? 
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}