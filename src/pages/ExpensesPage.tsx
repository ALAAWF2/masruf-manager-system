import { useExpenses } from "@/contexts/ExpenseContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

export default function ExpensesPage() {
  const { expenses, loading } = useExpenses();
  const { user } = useAuth();

  const myExpenses = expenses.filter((exp) => exp.createdBy === user?.id);

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">طلبات الصرف الخاصة بك</h1>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : myExpenses.length === 0 ? (
        <p className="text-gray-500">لا توجد طلبات صرف حتى الآن.</p>
      ) : (
        myExpenses.map((expense) => (
          <Link key={expense.id} to={`/expenses/${expense.id}`}>
            <Card className="mb-4 cursor-pointer hover:shadow-md transition">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">{expense.title}</h2>
                  <Badge
                    variant={
                      expense.status === "approved"
                        ? "success"
                        : expense.status === "rejected"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {expense.status === "pending"
                      ? "معلق"
                      : expense.status === "approved"
                      ? "مقبول"
                      : "مرفوض"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {expense.description}
                </p>
                <p className="mt-1 font-medium text-orange-600">
                  {expense.amount.toLocaleString()} ر.س
                </p>
              </CardContent>
            </Card>
          </Link>
        ))
      )}
    </div>
  );
}
