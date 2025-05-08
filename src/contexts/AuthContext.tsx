
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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

// Demo users for the prototype
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

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // In a real app, this would be an API call
      const user = DEMO_USERS.find((u) => u.email === email && u.password === password);
      
      if (user) {
        // Strip password for security
        const { password, ...secureUser } = user;
        setUser(secureUser);
        localStorage.setItem("user", JSON.stringify(secureUser));
        toast.success("تم تسجيل الدخول بنجاح");
        navigate("/");
      } else {
        toast.error("البريد الالكتروني أو كلمة المرور غير صحيحة");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء تسجيل الدخول");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    toast.info("تم تسجيل الخروج بنجاح");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
