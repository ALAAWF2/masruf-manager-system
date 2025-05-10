import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
console.log("✅ صفحة إدارة المستخدمين تم تحميلها");

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  department: string;
};

const roleOptions = [
  { value: "manager", label: "مدير تنفيذي" },
  { value: "section_manager", label: "مدير قسم" },
  { value: "employee", label: "موظف" }
];

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const userList: User[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(userList);
    } catch (error) {
      console.error("فشل في جلب المستخدمين:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
      );
    } catch (error) {
      console.error("فشل في تحديث الصلاحية:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">إدارة المستخدمين</h2>

      {loading ? (
        <p>جاري تحميل البيانات...</p>
      ) : (
        <div className="overflow-x-auto rounded-md shadow border">
          <table className="min-w-full text-sm text-right">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 border-b">الاسم</th>
                <th className="px-4 py-3 border-b">البريد الإلكتروني</th>
                <th className="px-4 py-3 border-b">القسم</th>
                <th className="px-4 py-3 border-b">الصلاحية</th>
                <th className="px-4 py-3 border-b">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border-b">{user.name}</td>
                  <td className="px-4 py-3 border-b">{user.email}</td>
                  <td className="px-4 py-3 border-b">{user.department || "—"}</td>
                  <td className="px-4 py-3 border-b">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      {roleOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 border-b">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        user.status === "نشط"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
