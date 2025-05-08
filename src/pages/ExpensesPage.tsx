
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useExpenses, Expense } from "@/contexts/ExpenseContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { File, Plus, Search } from "lucide-react";

const ExpensesPage = () => {
  const { state, updateExpenseStatus } = useExpenses();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [comment, setComment] = useState("");

  // Filter expenses based on user role and filters
  let filteredExpenses = user?.role === "employee"
    ? state.expenses.filter(expense => expense.employeeId === user.id)
    : state.expenses;
  
  // Apply status filter
  if (statusFilter !== "all") {
    filteredExpenses = filteredExpenses.filter(expense => expense.status === statusFilter);
  }
  
  // Apply search filter
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredExpenses = filteredExpenses.filter(expense => 
      expense.employeeName.toLowerCase().includes(term) ||
      expense.department.toLowerCase().includes(term) ||
      expense.expenseType.toLowerCase().includes(term) ||
      expense.details.toLowerCase().includes(term) ||
      expense.amount.toString().includes(term)
    );
  }

  // Sort by creation date (newest first)
  filteredExpenses = [...filteredExpenses].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleApprove = () => {
    if (selectedExpense) {
      updateExpenseStatus(selectedExpense.id, "approved", comment);
      setSelectedExpense(null);
      setComment("");
    }
  };

  const handleReject = () => {
    if (selectedExpense) {
      updateExpenseStatus(selectedExpense.id, "rejected", comment);
      setSelectedExpense(null);
      setComment("");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">طلبات الصرف</h2>
          <p className="text-muted-foreground">
            قائمة بجميع طلبات الصرف {user?.role === "employee" ? "الخاصة بك" : ""}
          </p>
        </div>
        {user && (
          <Button onClick={() => navigate("/expenses/new")}>
            <Plus className="h-4 w-4 ml-2" />
            طلب صرف جديد
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة طلبات الصرف</CardTitle>
          <CardDescription>
            يمكنك البحث وتصفية طلبات الصرف من هنا
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="بحث..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">معلق</SelectItem>
                <SelectItem value="approved">تمت الموافقة</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الطلب</TableHead>
                  <TableHead>الموظف</TableHead>
                  <TableHead>القسم</TableHead>
                  <TableHead>نوع الصرف</TableHead>
                  <TableHead>المبلغ (ريال)</TableHead>
                  <TableHead>تاريخ الطلب</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.id.substring(0, 5)}</TableCell>
                      <TableCell>{expense.employeeName}</TableCell>
                      <TableCell>{expense.department}</TableCell>
                      <TableCell>{expense.expenseType}</TableCell>
                      <TableCell>{expense.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        {new Date(expense.createdAt).toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            expense.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : expense.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {expense.status === "approved"
                            ? "تمت الموافقة"
                            : expense.status === "rejected"
                            ? "مرفوض"
                            : "معلق"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link to={`/expenses/${expense.id}`}>
                            <Button variant="ghost" size="sm">
                              <File className="h-4 w-4" />
                              <span className="sr-only">عرض</span>
                            </Button>
                          </Link>
                          {user?.role === "manager" && expense.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                onClick={() => setSelectedExpense(expense)}
                              >
                                موافقة
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => setSelectedExpense(expense)}
                              >
                                رفض
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                      لا توجد طلبات صرف متطابقة مع البحث
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedExpense} onOpenChange={(open) => !open && setSelectedExpense(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedExpense?.status === "approved"
                ? "تأكيد الموافقة على الطلب"
                : "تأكيد رفض الطلب"}
            </DialogTitle>
            <DialogDescription>
              طلب صرف #{selectedExpense?.id.substring(0, 5)} - {selectedExpense?.expenseType}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">إضافة تعليق (اختياري):</p>
              <Textarea
                placeholder="أدخل سبب الموافقة أو الرفض"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedExpense(null)}
            >
              إلغاء
            </Button>
            <Button
              variant="default"
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700"
            >
              موافقة
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
            >
              رفض
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpensesPage;
