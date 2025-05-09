import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/services/firebase";

type User = {
  id: string;
  name: string;
  email: string;
  role: "employee" | "manager" | "section_manager"; // ← ✅ صح
};


type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
};

const DEMO_USERS = [
  {
    id: "1",
    name: "أحمد محمد",
    email: "employee@example.com",
    password: "password123",
    role: "employee" as const,
    department: "التسويق"
  },
  {
    id: "2",
    name: "محمد خالد",
    email: "manager@example.com",
    password: "password123",
    role: "manager" as const,
    department: "الإدارة"
  }
];

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: () => {},
  loading: true
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ تحميل المستخدم من localStorage عند أول تشغيل
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setLoading(false);
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  // ✅ حفظ المستخدم تلقائيًا في localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as Omit<User, "id">;
            const fullUser = { id: firebaseUser.uid, ...userData };
            setUser(fullUser);
            localStorage.setItem("user", JSON.stringify(fullUser));
          } else {
            const demoUser = DEMO_USERS.find(u => u.email === firebaseUser.email);
            if (demoUser) {
              const { password, ...secureUser } = demoUser;
              setUser(secureUser);
              localStorage.setItem("user", JSON.stringify(secureUser));
            } else {
              await signOut(auth);
              setUser(null);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("حدث خطأ أثناء تحميل بيانات المستخدم");
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as Omit<User, "id">;
        const fullUser = { id: firebaseUser.uid, ...userData };
        setUser(fullUser);
        localStorage.setItem("user", JSON.stringify(fullUser));
        toast.success("تم تسجيل الدخول بنجاح");
        navigate("/");
      } else {
        const demoUser = DEMO_USERS.find(u => u.email === email);
        if (demoUser) {
          const { password, ...secureUser } = demoUser;
          setUser(secureUser);
          localStorage.setItem("user", JSON.stringify(secureUser));
          toast.success("تم تسجيل الدخول بنجاح");
          navigate("/");
        } else {
          toast.error("لم يتم العثور على بيانات المستخدم");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);
      if (demoUser) {
        const { password, ...secureUser } = demoUser;
        setUser(secureUser);
        localStorage.setItem("user", JSON.stringify(secureUser));
        toast.success("تم تسجيل الدخول بنجاح");
        navigate("/");
      } else {
        toast.error("البريد الالكتروني أو كلمة المرور غير صحيحة");
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("user");
      setUser(null);
      toast.info("تم تسجيل الخروج بنجاح");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
