
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { User, Bell, Search } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
          <h1 className="text-xl font-bold text-primary">نظام إدارة مصاريف الشركة</h1>
        </Link>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{user.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
              >
                تسجيل الخروج
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm">
                تسجيل الدخول
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
