"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Coins,
  Clock,
  CheckCircle,
  CalendarDays,
  Send,
  Image,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";

export default function ProfileWithStats() {
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(true);

  const [allCounts, setAllCounts] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    scheduled: 0,
    posted: 0,
  });

  const router = useRouter();

  useEffect(() => {
    fetchUser();
    fetchPosts();
    fetchTransactions(); 
  }, []);

  // ---------------- FETCH USER DATA ----------------
  const fetchUser = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await fetch(`/api/auth/signup?userId=${userId}`);
      const data = await res.json();
      setUserData(data);
    } catch (err) {
      console.error("User fetch failed");
    }
  };

  // ---------------- FETCH POST COUNTS ----------------
  const fetchPosts = async () => {
    try {
      const userId = localStorage.getItem("userId");

      const res = await fetch(`/api/post-status?userId=${userId}`);
      const data = await res.json();

      if (res.ok && data.success) {
        const allPosts = data.data;

        setAllCounts({
          total: allPosts.length,
          approved: allPosts.filter((p) => p.status === "approved").length,
          pending: allPosts.filter((p) => p.status === "pending").length,
          scheduled: allPosts.filter((p) => p.status === "scheduled").length,
          posted: allPosts.filter((p) => p.status === "posted").length,
        });
      }
    } catch (err) {
      console.error("Post fetch failed");
    }
  };

  // ---------------- FETCH TRANSACTIONS ----------------
  const fetchTransactions = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await fetch(`/api/transactions?userId=${userId}`);
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error("Transaction fetch failed:", err);
    } finally {
      setLoadingTx(false);
    }
  };

  if (!userData) {
    return (
      <div className="h-screen flex items-center justify-center text-xl font-semibold text-gray-600">
        Loading...
      </div>
    );
  }

  const { fullName, email, phone, wallet } = userData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6 mt-10">
      <div className="max-w-5xl mx-auto">

        {/* ---------------- PROFILE CARD ---------------- */}
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 mb-10">
          
          <div className="text-center mb-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
              {fullName?.charAt(0)}
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mt-3">{fullName}</h2>
            <p className="text-gray-500 text-sm">Your Personal Dashboard</p>
          </div>

          <div className="space-y-4">
            <InfoRow icon={<User />} label="Full Name" value={fullName} />
            <InfoRow icon={<Mail />} label="Email" value={email} />
            <InfoRow icon={<Phone />} label="Phone" value={phone} />

            <div className="flex justify-between items-center bg-gray-100 p-4 rounded-xl shadow-sm border">
              <span className="flex items-center gap-2 font-medium text-gray-600">
                <Coins className="text-yellow-500" /> Wallet Balance
              </span>
              <div className="flex items-center gap-3">
                <span className="text-gray-800 font-bold text-lg">{wallet}</span>
                <button
                  onClick={() => router.push("/wallet")}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1.5 rounded-lg font-medium shadow-md hover:scale-105 transition"
                >
                  Add Coins
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- POST STATISTICS ---------------- */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Post Statistics</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">

          <StatCard title="Total" value={allCounts.total} icon={<Image />} color="from-indigo-500 to-indigo-700" />
          <StatCard title="Approved" value={allCounts.approved} icon={<CheckCircle />} color="from-green-500 to-green-700" />
          <StatCard title="Pending" value={allCounts.pending} icon={<Clock />} color="from-yellow-500 to-yellow-700" />
          <StatCard title="Scheduled" value={allCounts.scheduled} icon={<CalendarDays />} color="from-purple-500 to-purple-700" />
          <StatCard title="Posted" value={allCounts.posted} icon={<Send />} color="from-blue-500 to-blue-700" />

        </div>

        {/* ---------------- TRANSACTION HISTORY ---------------- */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">💰 Transaction History</h2>

        <div className="bg-white rounded-2xl p-6 shadow-lg border max-h-[350px] overflow-y-auto space-y-4">

          {loadingTx ? (
            <p className="text-gray-500 text-center">Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <p className="text-gray-500 text-center">No transactions found.</p>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between bg-gray-100 p-4 rounded-xl shadow-sm hover:bg-gray-200 transition"
              >
                <div className="flex items-start gap-3">
                  {tx.type === "credit" ? (
                    <ArrowUpCircle className="text-green-600" size={30} />
                  ) : (
                    <ArrowDownCircle className="text-red-600" size={30} />
                  )}

                  <div>
                    <p className="font-semibold text-gray-800">{tx.reason}</p>

                    {tx.metadata?.aiPrompt && (
                      <p className="text-xs text-gray-600">
                        Prompt: {tx.metadata.aiPrompt}
                      </p>
                    )}

                    <p className="text-xs text-gray-500 mt-1">
                      {tx.date} • {tx.time}
                    </p>
                  </div>
                </div>

                <div className={`text-lg font-bold ${tx.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                  {tx.type === "credit" ? "+" : "-"}
                  {tx.amount}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex justify-between items-center bg-gray-100 px-4 py-3 rounded-xl border shadow-sm">
      <span className="flex items-center gap-3 text-gray-600 font-medium">
        <span className="text-indigo-600">{icon}</span> {label}
      </span>
      <span className="text-gray-800 font-semibold">{value}</span>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div
      className="cursor-pointer p-4 rounded-2xl shadow-md border bg-white hover:scale-105 transition"
    >
      <div
        className={`w-12 h-12 rounded-xl text-white flex items-center justify-center mb-3 bg-gradient-to-br ${color}`}
      >
        {icon}
      </div>

      <h3 className="text-gray-600 font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
