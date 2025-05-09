
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  orderBy,
  serverTimestamp,
  DocumentReference,
  Timestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";
import { Expense } from "@/contexts/ExpenseContext";

// Helper to convert Firestore data to our Expense type
const convertFirestoreExpense = (id: string, data: any): Expense => {
  return {
    id,
    employeeName: data.employeeName,
    employeeId: data.employeeId,
    department: data.department,
    expenseType: data.expenseType,
    details: data.details,
    amount: data.amount,
    attachments: data.attachments || [],
    status: data.status,
    comments: data.comments || "",
    createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
  };
};

// Get all expenses
export const getAllExpenses = async (): Promise<Expense[]> => {
  const expensesRef = collection(db, "expenses");
  const q = query(expensesRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => 
    convertFirestoreExpense(doc.id, doc.data())
  );
};

// Get expenses by employee ID
export const getEmployeeExpenses = async (employeeId: string): Promise<Expense[]> => {
  const expensesRef = collection(db, "expenses");
  const q = query(
    expensesRef, 
    where("employeeId", "==", employeeId),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => 
    convertFirestoreExpense(doc.id, doc.data())
  );
};

// Get pending expenses (for managers)
export const getPendingExpenses = async (): Promise<Expense[]> => {
  const expensesRef = collection(db, "expenses");
  const q = query(
    expensesRef, 
    where("status", "==", "pending"),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => 
    convertFirestoreExpense(doc.id, doc.data())
  );
};

// Upload file and get URL
export const uploadFile = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, `${path}/${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

// Add new expense
export const addExpense = async (
  expenseData: Omit<Expense, "id" | "createdAt" | "updatedAt" | "status">,
  files?: File[]
): Promise<Expense> => {
  // Upload files if any
  let attachments: string[] = expenseData.attachments || [];
  
  if (files && files.length > 0) {
    const uploadPromises = files.map(file => 
      uploadFile(file, `expenses/${expenseData.employeeId}`)
    );
    const uploadedUrls = await Promise.all(uploadPromises);
    attachments = [...attachments, ...uploadedUrls];
  }

  // Create expense document
  const expenseWithTimestamp = {
    ...expenseData,
    attachments,
    status: "pending" as const,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "expenses"), expenseWithTimestamp);
  
  // Return the created expense with ID
  return {
    id: docRef.id,
    ...expenseData,
    attachments,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// Update expense status
export const updateExpenseStatus = async (
  id: string, 
  status: "approved" | "rejected", 
  comments?: string
): Promise<void> => {
  const expenseRef = doc(db, "expenses", id);
  
  await updateDoc(expenseRef, {
    status,
    comments: comments || "",
    updatedAt: serverTimestamp(),
  });
};

// Delete expense
export const deleteExpense = async (id: string): Promise<void> => {
  const expenseRef = doc(db, "expenses", id);
  await updateDoc(expenseRef, {
    deleted: true,
    updatedAt: serverTimestamp(),
  });
  // Note: We're not actually deleting the document, just marking it as deleted
  // This is a common pattern to allow for data recovery and audit trails
};
