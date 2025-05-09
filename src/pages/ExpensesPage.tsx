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

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "معلق";
      case "approved_by_department":
        return "بانتظار التنفيذي";
      case "waiting_executive":
        return "بانتظار التنفيذ";
      case "approved":
        return "مقبول";
      case "rejected":
        return "مرفوض";
      default:
        return status;
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "destructive";
      case "pending":
      case "approved_by_department":
      case "waiting_executive":
        return "secondary";
      default:
        return "outline";
    }
  };

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
                  <Badge variant={getBadgeVariant(expense.status)}>
                    {getStatusText(expense.status)}
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
