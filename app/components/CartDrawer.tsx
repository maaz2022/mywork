"use client";
import { useCart } from "../context/CartContext";
import Image from "next/image";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UserCircle, MapPin, Phone, Loader2, CheckCircle2 } from "lucide-react";

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Prefill name and phone from Firestore
  useEffect(() => {
    if (!user) return;
    import("firebase/firestore").then(({ doc, getDoc }) => {
      getDoc(doc(db, "users", user.uid)).then(userDoc => {
        const data = userDoc.data();
        if (data) {
          setForm(f => ({
            ...f,
            name: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
            phone: data.phoneNumber || ""
          }));
        }
      });
    });
  }, [user]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("You must be logged in to checkout.");
    setLoading(true);
    try {
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        name: form.name,
        address: form.address,
        phone: form.phone,
        items: cart,
        total,
        createdAt: Timestamp.now(),
      });
      clearCart();
      setSuccess(true);
      setTimeout(() => {
        setCheckoutOpen(false);
        setSuccess(false);
      }, 1800);
      toast.success("Order placed successfully!");
      setForm({ name: "", address: "", phone: "" });
    } catch (error) {
      toast.error("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 transition-all ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl border-l border-purple-200 dark:border-purple-800 transform transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-5 border-b border-purple-100 dark:border-purple-800">
          <h2 className="text-xl font-bold text-purple-700 dark:text-purple-300">Your Cart</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors">
            <X className="w-6 h-6 text-purple-700 dark:text-purple-300" />
          </button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto max-h-[60vh]">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400">Your cart is empty.</div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                <Image src={item.image} alt={item.name} width={60} height={60} className="rounded-lg object-cover" />
                <div className="flex-1">
                  <div className="font-semibold text-purple-700 dark:text-purple-200">{item.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">£{item.price} x {item.quantity}</div>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-1 rounded-full bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                  aria-label="Remove item"
                >
                  <X className="w-4 h-4 text-red-600 dark:text-red-300" />
                </button>
              </div>
            ))
          )}
        </div>
        <div className="p-5 border-t border-purple-100 dark:border-purple-800">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-lg text-purple-700 dark:text-purple-200">Total:</span>
            <span className="text-lg font-bold text-green-600 dark:text-green-400">£{total.toFixed(2)}</span>
          </div>
          <button
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold shadow-md hover:from-purple-700 hover:to-blue-700 transition-all duration-200 mb-2"
            disabled={cart.length === 0}
            onClick={() => setCheckoutOpen(true)}
          >
            Checkout
          </button>
          <button
            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 py-2 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            onClick={clearCart}
            disabled={cart.length === 0}
          >
            Clear Cart
          </button>
        </div>
        {/* Checkout Modal */}
        <Sheet open={checkoutOpen} onOpenChange={setCheckoutOpen}>
          <SheetContent
            side="bottom"
            className="flex items-center justify-center min-h-[90vh] max-h-[95vh] px-0 md:px-0 border-none bg-transparent shadow-none"
          >
            <div className="w-full max-w-4xl mx-auto bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl p-6 md:p-10 backdrop-blur-md border border-purple-100 dark:border-purple-800 flex flex-col justify-center animate-in fade-in duration-300">
              <SheetHeader>
                <SheetTitle className="text-center text-2xl mb-2">Checkout</SheetTitle>
              </SheetHeader>
              {success ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-green-500 animate-bounce mb-4" />
                  <div className="text-2xl font-bold text-green-600 mb-2">Order Placed!</div>
                  <div className="text-gray-600 dark:text-gray-300 mb-4">Thank you for your order.</div>
                </div>
              ) : (
                <form onSubmit={handleCheckout} className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                  {/* User Info Card */}
                  <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 shadow-lg border-0">
                    <CardHeader className="flex flex-row items-center gap-3 pb-2">
                      <UserCircle className="w-10 h-10 text-purple-600 dark:text-purple-300" />
                      <div>
                        <CardTitle className="text-lg font-semibold text-purple-700 dark:text-purple-200">Your Info</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium mb-1 text-purple-700 dark:text-purple-300">Name</label>
                        <input
                          type="text"
                          className="w-full border rounded px-3 py-2 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-purple-400"
                          required
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="Your Name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-purple-700 dark:text-purple-300">Phone</label>
                        <div className="relative flex items-center">
                          <Phone className="absolute left-2 w-4 h-4 text-purple-400" />
                          <input
                            type="tel"
                            className="w-full border rounded pl-8 pr-3 py-2 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-purple-400"
                            required
                            value={form.phone}
                            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                            placeholder="Phone Number"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-purple-700 dark:text-purple-300">Address</label>
                        <div className="relative flex items-center">
                          <MapPin className="absolute left-2 w-4 h-4 text-purple-400" />
                          <input
                            type="text"
                            className="w-full border rounded pl-8 pr-3 py-2 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-purple-400"
                            required
                            value={form.address}
                            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                            placeholder="Delivery Address"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Order Summary Card */}
                  <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 shadow-lg border-0 flex flex-col justify-between">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold text-blue-700 dark:text-blue-200">Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-sm mb-1">
                          <div className="flex items-center gap-2">
                            <Image src={item.image} alt={item.name} width={32} height={32} className="rounded object-cover border" />
                            <span className="font-medium text-purple-700 dark:text-purple-200">{item.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">x{item.quantity}</span>
                          </div>
                          <span className="font-semibold text-green-600 dark:text-green-400">£{(Number(item.price) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold mt-4 border-t pt-3">
                        <span className="text-blue-700 dark:text-blue-200">Total:</span>
                        <span className="text-green-700 dark:text-green-300 text-lg">£{total.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="md:col-span-2 flex flex-col md:flex-row gap-3 mt-4">
                    <Button type="submit" className="w-full md:w-auto px-8 py-3 text-base font-semibold shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2" disabled={loading}>
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Place Order"}
                    </Button>
                    <Button type="button" variant="outline" className="w-full md:w-auto px-8 py-3 text-base font-semibold" onClick={() => setCheckoutOpen(false)} disabled={loading}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </aside>
    </div>
  );
} 