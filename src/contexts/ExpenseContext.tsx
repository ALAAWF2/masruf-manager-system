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
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

export type Expense = {
  id?: string;
  title: string;
  description: string;
  amount: number;
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "approved_by_department"
    | "waiting_executive";
  createdAt: Timestamp;
  createdBy: string;
  employeeName: string;
  department: string;
  attachments?: string[];
};

type ExpenseContextType = {
  expenses: Expense[];
  addExpense: (
    data: Omit<
      Expense,
      "id" | "createdAt" | "status" | "createdBy" | "employeeName" | "department"
    >
  ) => Promise<void>;
  updateStatus: (
    id: string,
    status:
      | "approved"
      | "rejected"
      | "approved_by_department"
      | "waiting_executive"
  ) => Promise<void>;
  loading: boolean;
};

const ExpenseContext = createContext<ExpenseContextType>({
  expenses: [],
  addExpense: async () => {},
  updateStatus: async () => {},
  loading: true,
});

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  const { user } = useAuth();

  const addExpense = async (
    data: Omit<
      Expense,
      "id" | "createdAt" | "status" | "createdBy" | "employeeName" | "department"
    >
  ) => {
    if (!user?.id || !user.name || !user.department) {
      toast.error("بيانات المستخدم غير مكتملة");
      return;
    }

    try {
      await addDoc(collection(db, "expenses"), {
        ...data,
        attachments: data.attachments || [],
        status: "pending",
        createdAt: Timestamp.now(),
        createdBy: user.id,
        employeeName: user.name,
        department: user.department,
      });
      toast.success("تم إرسال الطلب بنجاح");
    } catch (err) {
      console.error(err);
      toast.error("فشل في إضافة الطلب");
    }
  };

  const updateStatus = async (
    id: string,
    status:
      | "approved"
      | "rejected"
      | "approved_by_department"
      | "waiting_executive"
  ) => {
    try {
      await updateDoc(doc(db, "expenses", id), { status });

      setExpenses((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status } : e))
      );

      toast.success("تم تحديث الحالة بنجاح");
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء تحديث الحالة");
    }
  };

  return (
    <ExpenseContext.Provider
      value={{ expenses, addExpense, updateStatus, loading }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export const useExpenses = () => useContext(ExpenseContext);
