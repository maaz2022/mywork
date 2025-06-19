"use client";
import { useEffect, useState, Suspense } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CartDrawer from "../components/CartDrawer";

function OrdersPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [address, setAddress] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      setLoading(true);
      const q = query(collection(db, "orders"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  useEffect(() => {
    // Fetch user name and phone from Firestore
    if (!user) return;
    import("firebase/firestore").then(({ doc, getDoc }) => {
      getDoc(doc(db, "users", user.uid)).then(userDoc => {
        const data = userDoc.data();
        if (data) {
          setUserName(`${data.firstName} ${data.lastName}`);
          setUserPhone(data.phoneNumber || "");
        }
      });
    });
  }, [user]);

  // Download Form handler
  async function handleDownloadForm(order: any) {
    const res = await fetch("/api/generate-order-sheet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order }),
    });
    const { sheetUrl } = await res.json();
    window.open(sheetUrl, "_blank");
  }

  // Utility to convert orders to CSV
  function ordersToCSV(orders: any[]) {
    const header = [
      "Order ID",
      "Date",
      "Total (£)",
      "Status",
      "Products"
    ];
    const rows = orders.map(order => [
      order.id,
      order.createdAt && order.createdAt.seconds ? new Date(order.createdAt.seconds * 1000).toISOString().slice(0, 10) : "-",
      order.total.toFixed(2),
      order.status || "Pending",
      order.items.map((item: any) => `${item.name} (x${item.quantity})`).join("; ")
    ]);
    return [header, ...rows].map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",")).join("\r\n");
  }

  function downloadCSV(orders: any[]) {
    const csv = ordersToCSV(orders);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  }

  return (
    <>
      <Navbar onCartClick={() => setCartOpen(true)} showChangePasswordOption />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
        <div className="max-w-5xl mx-auto bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-300">Your Orders</h1>
            <Link href="/premium-dashboard" className=" bg-purple-700 dark:bg-purple-300 hover:bg-purple-800 dark:hover:bg-purple-200 text-white dark:text-purple-700 px-4 py-2 rounded-md">Return to Dashboard</Link>
          </div>
          {loading ? (
            <div className="text-center py-12 text-lg">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-lg text-gray-500">No orders found.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-purple-200 dark:divide-purple-800">
                  <thead>
                    <tr className="bg-purple-100 dark:bg-purple-900">
                      <th className="px-4 py-2 text-left text-xs font-semibold text-purple-700 dark:text-purple-300">Product(s)</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-purple-700 dark:text-purple-300">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-purple-700 dark:text-purple-300">Total Price</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-purple-700 dark:text-purple-300">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-purple-700 dark:text-purple-300">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-purple-700 dark:text-purple-300">Address</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-purple-100 dark:divide-purple-800">
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td className="px-4 py-2">
                          {order.items.map((item: any) => (
                            <div key={item.id}>{item.name}</div>
                          ))}
                        </td>
                        <td className="px-4 py-2">
                          {order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)}
                        </td>
                        <td className="px-4 py-2">£{order.total.toFixed(2)}</td>
                        <td className="px-4 py-2">{order.createdAt && order.createdAt.seconds ? new Date(order.createdAt.seconds * 1000).toISOString().slice(0, 10) : "-"}</td>
                        <td className="px-4 py-2">{order.status || "Pending"}</td>
                        <td className="px-4 py-2">{order.address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Export to CSV Button */}
              <div className="flex flex-col items-end mt-6">
                <span className="text-xs text-gray-500 mb-2">Export your order history for your records:</span>
                <Button variant="outline" onClick={() => downloadCSV(orders)}>
                  Export to CSV
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrdersPageContent />
    </Suspense>
  );
} 