
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExpenses } from "@/contexts/ExpenseContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Expense } from "@/contexts/ExpenseContext";

const PendingExpensesPage = () => {
  const { state, updateExpenseStatus } = useExpenses();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [comment, setComment] = useState("");
  const [action, setAction] = useState<"approve" | "reject" | null>(null);

  // Filter pending expenses
  const pendingExpenses = state.expenses.filter(e => e.status === "pending");

  // Check if user is authorized to view this page
  if (user?.role !== "manager") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-2">غير مصرح بالوصول</h2>
        <p className="text-muted-foreground mb-4">
          هذه الصفحة متاحة فقط للمدير التنفيذي
        </p>
        <Button onClick={() => navigate("/")}>العودة إلى الصفحة الرئيسية</Button>
      </div>
    );
  }

  const handleApprove = () => {
    if (selectedExpense) {
      updateExpenseStatus(selectedExpense.id, "approved", comment);
      setSelectedExpense(null);
      setComment("");
      setAction(null);
    }
  };

  const handleReject = () => {
    if (selectedExpense) {
      updateExpenseStatus(selectedExpense.id, "rejected", comment);
      setSelectedExpense(null);
      setComment("");
      setAction(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">الطلبات المعلقة</h2>
        <p className="text-muted-foreground">
          مراجعة وإدارة طلبات الصرف التي تحتاج إلى موافقة
        </p>
      </div>

      <div className="grid gap-6">
        {pendingExpenses.length > 0 ? (
          pendingExpenses.map((expense) => (
            <Card key={expense.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{expense.expenseType}</CardTitle>
                    <CardDescription>
                      طلب #{expense.id.substring(0, 5)} - بواسطة {expense.employeeName} ({expense.department})
                    </CardDescription>
                  </div>
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
                    معلق
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">المبلغ</p>
                    <p className="font-bold">{expense.amount.toLocaleString()} ريال</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">تاريخ الطلب</p>
                    <p>{new Date(expense.createdAt).toLocaleDateString("ar-SA")}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">المرفقات</p>
                    <p>{expense.attachments.length} ملفات</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground mb-1">التفاصيل:</p>
                  <p className="p-3 bg-muted/30 rounded-md">{expense.details}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button 
                    onClick={() => navigate(`/expenses/${expense.id}`)} 
                    variant="outline"
                  >
                    عرض التفاصيل الكاملة
                  </Button>
                  <Button 
                    onClick={() => {
                      setSelectedExpense(expense);
                      setAction("approve");
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    الموافقة على الطلب
                  </Button>
                  <Button 
                    onClick={() => {
                      setSelectedExpense(expense);
                      setAction("reject");
                    }}
                    variant="destructive"
                  >
                    رفض الطلب
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>لا توجد طلبات معلقة</CardTitle>
              <CardDescription>
                جميع طلبات الصرف تمت مراجعتها. سيظهر هنا أي طلبات جديدة تحتاج إلى موافقة.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>

      <Dialog open={!!selectedExpense} onOpenChange={(open) => !open && setSelectedExpense(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {action === "approve"
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
              onClick={() => {
                setSelectedExpense(null);
                setAction(null);
              }}
            >
              إلغاء
            </Button>
            {action === "approve" ? (
              <Button
                variant="default"
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700"
              >
                موافقة
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={handleReject}
              >
                رفض
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingExpensesPage;
