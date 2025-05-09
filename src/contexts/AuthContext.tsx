
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
  role: "employee" | "manager";
  department?: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
};

// Demo users for the prototype - will be replaced by Firebase data
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

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          
          if (userDoc.exists()) {
            // User exists in Firestore
            const userData = userDoc.data() as Omit<User, "id">;
            setUser({ 
              id: firebaseUser.uid, 
              ...userData 
            });
          } else {
            // For demo purposes, if the user doesn't exist in Firestore but is authenticated,
            // fall back to demo users
            const demoUser = DEMO_USERS.find(u => u.email === firebaseUser.email);
            if (demoUser) {
              const { password, ...secureUser } = demoUser;
              setUser(secureUser);
            } else {
              // If we can't find a matching demo user, log them out
              await signOut(auth);
              setUser(null);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("حدث خطأ أثناء تحميل بيانات المستخدم");
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Try to sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      try {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        
        if (userDoc.exists()) {
          // User exists in Firestore
          const userData = userDoc.data() as Omit<User, "id">;
          setUser({ 
            id: firebaseUser.uid, 
            ...userData 
          });
          toast.success("تم تسجيل الدخول بنجاح");
          navigate("/");
        } else {
          // For demo purposes, if the user doesn't exist in Firestore
          const demoUser = DEMO_USERS.find(u => u.email === email);
          if (demoUser) {
            const { password, ...secureUser } = demoUser;
            setUser(secureUser);
            toast.success("تم تسجيل الدخول بنجاح");
            navigate("/");
          } else {
            toast.error("لم يتم العثور على بيانات المستخدم");
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("حدث خطأ أثناء تحميل بيانات المستخدم");
      }
    } catch (error) {
      console.error("Login error:", error);
      // For demo purposes, try with demo users if Firebase auth fails
      const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);
      
      if (demoUser) {
        // Strip password for security
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

  // Logout function
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
