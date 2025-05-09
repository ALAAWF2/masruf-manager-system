import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useExpenses } from "@/contexts/ExpenseContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { File } from "lucide-react";

const ExpenseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { expenses, updateStatus } = useExpenses();
  const { user } = useAuth();
  const navigate = useNavigate();

  const expense = expenses.find((e) => e.id === id);

  if (!expense) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-2">لم يتم العثور على الطلب</h2>
        <p className="text-muted-foreground mb-4">
          الطلب الذي تبحث عنه غير موجود أو تم حذفه
        </p>
        <Button onClick={() => navigate("/expenses")}>العودة إلى قائمة الطلبات</Button>
      </div>
    );
  }

  const formattedDate = expense.createdAt?.seconds
    ? new Date(expense.createdAt.seconds * 1000).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const statusClass =
    expense.status === "approved"
      ? "bg-green-100 text-green-800"
      : expense.status === "rejected"
      ? "bg-red-100 text-red-800"
      : "bg-yellow-100 text-yellow-800";

  const statusText =
    expense.status === "approved"
      ? "تمت الموافقة"
      : expense.status === "rejected"
      ? "مرفوض"
      : "معلق";

  return (
    <div className="max-w-3xl mx-auto py-6 animate-fade-in">
      <Card>
        <CardHeader className="border-b pb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">
                طلب صرف #{expense.id?.substring(0, 5)}
              </CardTitle>
              <CardDescription>تم تقديمه في {formattedDate}</CardDescription>
            </div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusClass}`}>
              {statusText}
            </span>
          </div>
        </CardHeader>

        <CardContent className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">اسم الموظف</h3>
                <p className="mt-1">{expense.employeeName || "—"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">القسم</h3>
                <p className="mt-1">{expense.department || "—"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">نوع الصرف</h3>
                <p className="mt-1">{expense.expenseType || "—"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">المبلغ</h3>
                <p className="mt-1 text-lg font-bold">{expense.amount.toLocaleString()} ريال</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">تاريخ التقديم</h3>
                <p className="mt-1">{formattedDate}</p>
              </div>
              {expense.updatedAt?.seconds && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">آخر تحديث</h3>
                  <p className="mt-1">
                    {new Date(expense.updatedAt.seconds * 1000).toLocaleDateString("ar-SA")}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">الوصف</h3>
              <p className="mt-2 p-3 bg-muted/30 rounded-md">{expense.description}</p>
            </div>

            {expense.attachments && expense.attachments.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">المرفقات</h3>
                <ul className="mt-2 space-y-2">
                  {expense.attachments.map((url, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 p-2 bg-muted/30 rounded-md"
                    >
                      <File className="h-4 w-4" />
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-600 hover:text-blue-800"
                      >
                        تحميل الملف {index + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {expense.comments && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">تعليقات</h3>
                <p className="mt-2 p-3 bg-muted/30 rounded-md">{expense.comments}</p>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-t pt-6 flex justify-between">
          <Button variant="outline" onClick={() => navigate("/expenses")}>
            العودة للقائمة
          </Button>

          {user?.role === "manager" && expense.status === "pending" && (
            <div className="space-x-2 rtl:space-x-reverse">
              <Button
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
                onClick={() => {
                  updateStatus(expense.id!, "rejected");
                  navigate("/expenses");
                }}
              >
                رفض الطلب
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  updateStatus(expense.id!, "approved");
                  navigate("/expenses");
                }}
              >
                الموافقة على الطلب
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ExpenseDetailPage;
