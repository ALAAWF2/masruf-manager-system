import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "@/services/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  doc,
  updateDoc
} from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

type Expense = {
  id?: string;
  title: string;
  description: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "approved_by_department" | "waiting_executive";
  createdAt: Timestamp;
  createdBy: string;
  department: string;
  employeeName: string;
};


type ExpenseContextType = {
  expenses: Expense[];
  addExpense: (data: Omit<Expense, "id" | "createdAt" | "status" | "createdBy">) => Promise<void>;
  updateStatus: (id: string, status: "approved" | "rejected") => Promise<void>;
  loading: boolean;
};

const ExpenseContext = createContext<ExpenseContextType>({
  expenses: [],
  addExpense: async () => {},
  updateStatus: async () => {},
  loading: true
});

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "expenses"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const list: Expense[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as Omit<Expense, "id">;
        list.push({ id: doc.id, ...data });
      });
      setExpenses(list);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const addExpense = async (
    data: Omit<Expense, "id" | "createdAt" | "status" | "createdBy">
      & { attachments?: string[] }
  ) => {
    if (!user) return;
  
    try {
      await addDoc(collection(db, "expenses"), {
        ...data,
        attachments: data.attachments || [],
        status: "pending",
        createdAt: Timestamp.now(),
        createdBy: user.id,
        employeeName: user.name,       // 👈 الاسم
        department: user.department    // 👈 القسم
      });
      toast.success("تم إرسال الطلب بنجاح");
    } catch (err) {
      toast.error("فشل في إضافة الطلب");
    }
  };
  

  const updateStatus = async (
    id: string,
    status: "approved" | "rejected" | "approved_by_department" | "waiting_executive"
  ) => {
  
    try {
      await updateDoc(doc(db, "expenses", id), {
        status
      });
      toast.success("تم تحديث الحالة");
    } catch (err) {
      toast.error("حدث خطأ أثناء تحديث الحالة");
    }
  };

  return (
    <ExpenseContext.Provider value={{ expenses, addExpense, updateStatus, loading }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export const useExpenses = () => useContext(ExpenseContext);
