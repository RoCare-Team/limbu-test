"use client";

import { useEffect, useState } from "react";

export default function ConnectedBusinessPage() {
  const [users, setUsers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/connectedBussiness");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load users");

        // Sort in descending order (latest first)
        const sortedUsers = data.users.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setUsers(sortedUsers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);


  const truncateToken = (token) => {
    if (!token) return "-";
    return token.length > 15
      ? `${token.substring(0, 10)}...${token.substring(token.length - 5)}`
      : token;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          🏢 Connected Businesses
        </h1>

        {loading && (
          <p className="text-center text-gray-600 animate-pulse">
            Loading users...
          </p>
        )}
        {error && (
          <p className="text-center text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
            ❌ {error}
          </p>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
                <tr>
                  <th className="p-3 border">Name</th>
                  <th className="p-3 border">Email</th>
                  <th className="p-3 border">Google ID</th>
                  <th className="p-3 border">Access Token</th>
                  <th className="p-3 border">Refresh Token</th>
                  <th className="p-3 border">Created Date</th>
                  <th className="p-3 border">Status</th>
                </tr>
              </thead>
              <tbody className="text-gray-800">
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 transition duration-200"
                  >
                    <td className="p-3 border font-semibold">{user.name}</td>
                    <td className="p-3 border">{user.email}</td>
                    <td className="p-3 border text-xs text-gray-500">
                      {user.googleId || "-"}
                    </td>
                    <td className="p-3 border text-xs text-gray-500">
                      {truncateToken(user.accessToken)}
                    </td>
                    <td className="p-3 border text-xs text-gray-500">
                      {truncateToken(user.refreshToken)}
                    </td>
<td className="p-3 border text-sm text-gray-700">
  {user.createdAt
    ? new Date(user.createdAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—"}
</td>

                    <td
                      className={`p-3 border font-semibold text-center ${
                        user.status === "Connected"
                          ? "text-green-600 bg-green-50"
                          : "text-red-600 bg-red-50"
                      }`}
                    >
                      {user.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <p className="text-center text-gray-500 mt-4">
                No connected businesses found.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
