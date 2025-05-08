
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

export type Expense = {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  expenseType: string;
  details: string;
  amount: number;
  attachments: string[];
  status: "pending" | "approved" | "rejected";
  comments?: string;
  createdAt: string;
  updatedAt: string;
};

type ExpenseState = {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
};

type ExpenseAction =
  | { type: "FETCH_EXPENSES_SUCCESS"; payload: Expense[] }
  | { type: "FETCH_EXPENSES_ERROR"; payload: string }
  | { type: "ADD_EXPENSE"; payload: Expense }
  | { type: "UPDATE_EXPENSE"; payload: Expense }
  | { type: "DELETE_EXPENSE"; payload: string };

type ExpenseContextType = {
  state: ExpenseState;
  addExpense: (expense: Omit<Expense, "id" | "createdAt" | "updatedAt" | "status">) => void;
  updateExpenseStatus: (id: string, status: "approved" | "rejected", comments?: string) => void;
  deleteExpense: (id: string) => void;
};

const initialState: ExpenseState = {
  expenses: [],
  loading: true,
  error: null,
};

// Demo data for the prototype
const demoExpenses: Expense[] = [
  {
    id: "1",
    employeeName: "أحمد محمد",
    employeeId: "1",
    department: "التسويق",
    expenseType: "مصاريف سفر",
    details: "تذاكر طيران للمؤتمر السنوي",
    amount: 2500,
    attachments: ["receipt1.pdf"],
    status: "pending",
    createdAt: new Date(2023, 4, 10).toISOString(),
    updatedAt: new Date(2023, 4, 10).toISOString(),
  },
  {
    id: "2",
    employeeName: "سارة عبدالله",
    employeeId: "3",
    department: "المالية",
    expenseType: "معدات مكتبية",
    details: "شراء جهاز حاسوب محمول جديد",
    amount: 4200,
    attachments: ["invoice1.pdf", "quote1.pdf"],
    status: "approved",
    comments: "موافق عليه بسبب الحاجة الملحة للقسم",
    createdAt: new Date(2023, 3, 25).toISOString(),
    updatedAt: new Date(2023, 3, 26).toISOString(),
  },
  {
    id: "3",
    employeeName: "محمد أحمد",
    employeeId: "4",
    department: "التطوير",
    expenseType: "برامج وتطبيقات",
    details: "اشتراك سنوي في خدمات التطوير السحابية",
    amount: 1800,
    attachments: ["subscription.pdf"],
    status: "rejected",
    comments: "يرجى استخدام الاشتراك الحالي للشركة",
    createdAt: new Date(2023, 4, 5).toISOString(),
    updatedAt: new Date(2023, 4, 7).toISOString(),
  },
];

function expenseReducer(state: ExpenseState, action: ExpenseAction): ExpenseState {
  switch (action.type) {
    case "FETCH_EXPENSES_SUCCESS":
      return {
        ...state,
        expenses: action.payload,
        loading: false,
        error: null,
      };
    case "FETCH_EXPENSES_ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case "ADD_EXPENSE":
      return {
        ...state,
        expenses: [action.payload, ...state.expenses],
      };
    case "UPDATE_EXPENSE":
      return {
        ...state,
        expenses: state.expenses.map((expense) =>
          expense.id === action.payload.id ? action.payload : expense
        ),
      };
    case "DELETE_EXPENSE":
      return {
        ...state,
        expenses: state.expenses.filter((expense) => expense.id !== action.payload),
      };
    default:
      return state;
  }
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(expenseReducer, initialState);
  const { user } = useAuth();

  // Load expenses from local storage or initialize with demo data
  useEffect(() => {
    const loadExpenses = () => {
      try {
        const storedExpenses = localStorage.getItem("expenses");
        if (storedExpenses) {
          const expenses = JSON.parse(storedExpenses);
          dispatch({ type: "FETCH_EXPENSES_SUCCESS", payload: expenses });
        } else {
          // First time, use demo data
          localStorage.setItem("expenses", JSON.stringify(demoExpenses));
          dispatch({ type: "FETCH_EXPENSES_SUCCESS", payload: demoExpenses });
        }
      } catch (error) {
        dispatch({ type: "FETCH_EXPENSES_ERROR", payload: "فشل تحميل البيانات" });
      }
    };

    loadExpenses();
  }, []);

  // Save expenses to local storage whenever they change
  useEffect(() => {
    if (!state.loading) {
      localStorage.setItem("expenses", JSON.stringify(state.expenses));
    }
  }, [state.expenses, state.loading]);

  const addExpense = (expenseData: Omit<Expense, "id" | "createdAt" | "updatedAt" | "status">) => {
    if (!user) {
      toast.error("يجب تسجيل الدخول لإنشاء طلب جديد");
      return;
    }

    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: "ADD_EXPENSE", payload: newExpense });
    toast.success("تم إنشاء طلب الصرف بنجاح");
  };

  const updateExpenseStatus = (id: string, status: "approved" | "rejected", comments?: string) => {
    const expense = state.expenses.find((e) => e.id === id);
    if (!expense) {
      toast.error("لم يتم العثور على الطلب");
      return;
    }

    const updatedExpense: Expense = {
      ...expense,
      status,
      comments,
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: "UPDATE_EXPENSE", payload: updatedExpense });
    
    if (status === "approved") {
      toast.success("تمت الموافقة على الطلب");
    } else {
      toast.error("تم رفض الطلب");
    }
  };

  const deleteExpense = (id: string) => {
    dispatch({ type: "DELETE_EXPENSE", payload: id });
    toast.info("تم حذف الطلب");
  };

  return (
    <ExpenseContext.Provider value={{ state, addExpense, updateExpenseStatus, deleteExpense }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error("useExpenses must be used within an ExpenseProvider");
  }
  return context;
};
