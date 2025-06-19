"use client";
import { useEffect, useState, Suspense } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Navbar from "../components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

function AdminPageContent() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [filter, setFilter] = useState<'all' | 'free' | 'premium' | 'admin'>('all');
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'orders'>('users');

  // Require Firebase Auth and admin role
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/admin-login');
        return;
      }
      // Check Firestore user role
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      if (userData && userData.role === "admin") {
        setIsAdmin(true);
        setAuthLoading(false);
      } else {
        await signOut(auth);
        router.replace('/admin-login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (isAdmin) {
      const fetchData = async () => {
        setLoadingData(true);
        const usersSnap = await getDocs(query(collection(db, "users")));
        const ordersSnap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
        setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setOrders(ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoadingData(false);
      };
      fetchData();
    }
  }, [isAdmin]);

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen text-lg">Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  // Calculate summary stats
  const totalOrders = orders.length;
  const totalResellers = users.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalPremium = users.filter(u => u.role === 'premium').length;

  // Utility to convert users to CSV
  function usersToCSV(users: any[]) {
    const header = ["Name", "Email", "Role", "Registered"];
    const rows = users.map(user => [
      `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      user.email,
      user.role,
      user.createdAt ? (user.createdAt.seconds ? new Date(user.createdAt.seconds * 1000).toISOString().slice(0, 10) : user.createdAt.slice(0, 10)) : '-'
    ]);
    return [header, ...rows].map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",")).join("\r\n");
  }
  // Utility to convert orders to CSV
  function ordersToCSV(orders: any[]) {
    const header = ["Order ID", "User", "Total (£)", "Date", "Status", "Products"];
    const rows = orders.map(order => [
      order.id,
      order.name || order.userId,
      order.total?.toFixed(2),
      order.createdAt && order.createdAt.seconds ? new Date(order.createdAt.seconds * 1000).toISOString().slice(0, 10) : '-',
      "Completed",
      order.items?.map((item: any) => `${item.name} (x${item.quantity})`).join("; ")
    ]);
    return [header, ...rows].map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",")).join("\r\n");
  }
  function downloadCSV(data: string, filename: string) {
    const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar isAdmin={true} onCartClick={() => {}} />
      <div className="max-w-7xl mx-auto py-10 px-4">
        <h1 className="text-4xl font-bold text-purple-700 dark:text-purple-300 mb-8 text-center">Admin Dashboard</h1>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <Card className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-800 dark:to-gray-900 shadow-lg border-0">
            <CardHeader className="pb-2"><CardTitle className="text-lg text-purple-700 dark:text-purple-200">Total Orders</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold text-purple-700 dark:text-purple-200">{totalOrders}</CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-gray-800 shadow-lg border-0">
            <CardHeader className="pb-2"><CardTitle className="text-lg text-blue-700 dark:text-blue-200">Total Resellers</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold text-blue-700 dark:text-blue-200">{totalResellers}</CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-100 to-purple-100 dark:from-gray-800 dark:to-gray-900 shadow-lg border-0">
            <CardHeader className="pb-2"><CardTitle className="text-lg text-green-700 dark:text-green-200">Total Revenue</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold text-green-700 dark:text-green-200">£{totalRevenue.toFixed(2)}</CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-100 to-purple-100 dark:from-gray-900 dark:to-gray-800 shadow-lg border-0">
            <CardHeader className="pb-2"><CardTitle className="text-lg text-yellow-700 dark:text-yellow-200">Total Premium Users</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold text-yellow-700 dark:text-yellow-200">{totalPremium}</CardContent>
          </Card>
        </div>
        {/* Tabs for Users/Orders */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-xl overflow-hidden border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-900/80 shadow-lg">
            <button
              className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'users' ? 'bg-purple-600 text-white' : 'bg-transparent text-purple-700 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-gray-800'}`}
              onClick={() => setActiveTab('users')}
            >
              View Users
            </button>
            <button
              className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'orders' ? 'bg-purple-600 text-white' : 'bg-transparent text-purple-700 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-gray-800'}`}
              onClick={() => setActiveTab('orders')}
            >
              View Orders
            </button>
          </div>
        </div>
        {/* Table Section */}
        <div className="w-full max-w-5xl mx-auto">
          {activeTab === 'users' && (
            <Card className="overflow-x-auto bg-white/90 dark:bg-gray-900/95 rounded-2xl shadow-xl border border-purple-100 dark:border-purple-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>All Users</CardTitle>
                <button
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold shadow-md hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                  onClick={() => downloadCSV(usersToCSV(users.filter(u => filter === 'all' ? true : u.role === filter)), 'users.csv')}
                >
                  Export to CSV
                </button>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="text-center py-8 text-lg">Loading users...</div>
                ) : (
                  <table className="min-w-full divide-y divide-purple-200 dark:divide-purple-800">
                    <thead>
                      <tr className="bg-purple-100 dark:bg-purple-900">
                        <th className="px-4 py-2 text-left text-xs font-semibold text-purple-700 dark:text-purple-300">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-purple-700 dark:text-purple-300">Email</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-purple-700 dark:text-purple-300">Role</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-purple-700 dark:text-purple-300">Registered</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-purple-100 dark:divide-purple-800">
                      {users.filter(u => filter === 'all' ? true : u.role === filter).map(user => (
                        <tr key={user.id} className="transition-colors hover:bg-purple-50 dark:hover:bg-purple-800/60 cursor-pointer">
                          <td className="px-4 py-2">{user.firstName} {user.lastName}</td>
                          <td className="px-4 py-2">{user.email}</td>
                          <td className="px-4 py-2 capitalize">{user.role}</td>
                          <td className="px-4 py-2">{user.createdAt ? (user.createdAt.seconds ? new Date(user.createdAt.seconds * 1000).toISOString().slice(0, 10) : user.createdAt.slice(0, 10)) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          )}
          {activeTab === 'orders' && (
            <Card className="overflow-x-auto bg-white/90 dark:bg-gray-900/95 rounded-2xl shadow-xl border border-purple-100 dark:border-purple-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>All Orders</CardTitle>
                <button
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold shadow-md hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                  onClick={() => downloadCSV(ordersToCSV(orders), 'orders.csv')}
                >
                  Export to CSV
                </button>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="text-center py-8 text-lg">Loading orders...</div>
                ) : (
                  <table className="min-w-full divide-y divide-purple-200 dark:divide-purple-800">
                    <thead>
                      <tr className="bg-purple-100 dark:bg-purple-900">
                        <th className="px-4 py-2 text-left text-xs font-semibold text-purple-700 dark:text-purple-300">Order ID</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-purple-700 dark:text-purple-300">User</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-purple-700 dark:text-purple-300">Total (£)</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-purple-700 dark:text-purple-300">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-purple-700 dark:text-purple-300">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-purple-700 dark:text-purple-300">Products</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-purple-100 dark:divide-purple-800">
                      {orders.map(order => (
                        <tr key={order.id} className="transition-colors hover:bg-purple-50 dark:hover:bg-purple-800/60 cursor-pointer">
                          <td className="px-4 py-2">{order.id}</td>
                          <td className="px-4 py-2">{order.name || order.userId}</td>
                          <td className="px-4 py-2">£{order.total?.toFixed(2)}</td>
                          <td className="px-4 py-2">{order.createdAt && order.createdAt.seconds ? new Date(order.createdAt.seconds * 1000).toISOString().slice(0, 10) : '-'}</td>
                          <td className="px-4 py-2">
                            <select
                              className="border rounded px-2 py-1 bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-200"
                              value={order.status || 'Pending'}
                              onChange={async (e) => {
                                const newStatus = e.target.value;
                                // Update in Firestore
                                await updateDoc(doc(db, "orders", order.id), { status: newStatus });
                                // Update local state
                                setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
                              }}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Done">Done</option>
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            {order.items?.map((item: any) => (
                              <div key={item.id}>{item.name} (x{item.quantity})</div>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminPageContent />
    </Suspense>
  );
} 