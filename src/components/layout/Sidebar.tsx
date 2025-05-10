import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { File, Bell, Users, List, Settings } from "lucide-react";

const roleLabels: Record<string, string> = {
  employee: "موظف",
  section_manager: "مدير قسم",
  manager: "مدير تنفيذي", // ✅ تعديل الاسم الظاهر
};

export function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  const links = [
    { name: "لوحة المعلومات", href: "/", icon: List },
    { name: "طلبات الصرف", href: "/expenses", icon: File },

    // ✅ الطلبات المعلقة لمدير القسم أو المدير التنفيذي
    ...(["section_manager", "manager"].includes(user?.role || "")
      ? [{ name: "الطلبات المعلقة", href: "/pending", icon: Bell }]
      : []),

    // ✅ إدارة المستخدمين والإعدادات فقط للمدير التنفيذي
    ...(user?.role === "manager"
      ? [
          { name: "إدارة المستخدمين", href: "/users", icon: Users },
          { name: "الإعدادات", href: "/settings", icon: Settings },
        ]
      : []),
  ];

  return (
    <div className="hidden md:flex w-64 flex-col bg-white border-l shadow-sm">
      <div className="flex flex-col flex-1 p-4 gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-secondary",
              location.pathname === link.href
                ? "bg-primary/10 text-primary"
                : "text-gray-600 hover:text-primary"
            )}
          >
            <link.icon className="h-5 w-5" />
            <span>{link.name}</span>
          </Link>
        ))}
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
            {user?.name?.charAt(0) || "م"}
          </div>
          <div>
            <p className="text-sm font-medium">{user?.name || "مستخدم"}</p>
            <p className="text-xs text-muted-foreground">
              {roleLabels[user?.role || "employee"]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
