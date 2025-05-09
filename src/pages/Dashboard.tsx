import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExpenses } from "@/contexts/ExpenseContext";
import { useAuth } from "@/contexts/AuthContext";
import { PlusCircle } from "lucide-react";

const Dashboard = () => {
  const { expenses } = useExpenses();
  const { user } = useAuth();

  const userExpenses = user?.role === "employee"
    ? expenses.filter(expense => expense.createdBy === user.id)
    : expenses;

  const pendingCount = userExpenses.filter(e => e.status === "pending").length;
  const approvedCount = userExpenses.filter(e => e.status === "approved").length;
  const rejectedCount = userExpenses.filter(e => e.status === "rejected").length;

  const totalAmount = userExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const approvedAmount = userExpenses
    .filter(e => e.status === "approved")
    .reduce((sum, expense) => sum + expense.amount, 0);

  const recentExpenses = [...userExpenses]
    .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">مرحباً، {user?.name}</h2>
        <p className="text-muted-foreground">
          هذه لوحة معلومات نظام إدارة المصاريف - يمكنك متابعة طلباتك من هنا
        </p>

        {user?.role === "employee" && (
          <div className="mt-4">
            <Link
              to="/expenses/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة طلب صرف</span>
            </Link>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userExpenses.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingCount} معلق • {approvedCount} موافق عليه • {rejectedCount} مرفوض
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبالغ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAmount.toLocaleString()} ريال</div>
            <p className="text-xs text-muted-foreground">
              {approvedAmount.toLocaleString()} ريال تمت الموافقة عليها
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">طلبات بحاجة للمراجعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              من أصل {userExpenses.length} طلب
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">أحدث الطلبات</TabsTrigger>
          <TabsTrigger value="pending">الطلبات المعلقة</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>أحدث الطلبات</CardTitle>
                <CardDescription>
                  آخر 5 طلبات تم تقديمها في النظام
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentExpenses.length > 0 ? (
                  recentExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div>
                        <div className="font-medium">{expense.expenseType || expense.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {expense.employeeName || "—"} •{" "}
                          {expense.createdAt?.seconds
                            ? new Date(expense.createdAt.seconds * 1000).toLocaleDateString("ar-SA")
                            : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium">
                          {expense.amount.toLocaleString()} ريال
                        </div>
                        <div
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
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    لا توجد طلبات حتى الآن
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>الطلبات المعلقة</CardTitle>
                <CardDescription>
                  الطلبات التي تنتظر الموافقة أو الرفض
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {userExpenses.filter(e => e.status === "pending").length > 0 ? (
                  userExpenses
                    .filter(e => e.status === "pending")
                    .map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-3 border rounded-md"
                      >
                        <div>
                          <div className="font-medium">{expense.expenseType || expense.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {expense.employeeName || "—"} •{" "}
                            {expense.createdAt?.seconds
                              ? new Date(expense.createdAt.seconds * 1000).toLocaleDateString("ar-SA")
                              : ""}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{expense.amount.toLocaleString()} ريال</div>
                          <div className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            معلق
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    لا توجد طلبات معلقة
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
